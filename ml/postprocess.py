import logging
logger = logging.getLogger(__name__)

import copy
from typing import Any

from pydantic import BaseModel
from models import TimeRange, CourseRow, TableData

# ---------------------------------------------------------------------------
# Free-slot search configuration
# ---------------------------------------------------------------------------

# Search window: 7:00 AM – 9:00 PM (in minutes from midnight)
_SEARCH_START: int = 7 * 60
_SEARCH_END:   int = 21 * 60

# When no duration can be inferred, assume a one-hour class
_DEFAULT_DURATION: int = 60

# Granularity of the slot search (minutes)
_STEP: int = 30

# Day groups tried in order when assigning a fallback day pattern.
# MWF / TTh come first as they are the most common university patterns.
_FALLBACK_DAY_GROUPS: list[list[str]] = [
    ["monday"],
    ["tuesday"],
    ["wednesday"],
    ["thursday"],
    ["friday"],
    ["saturday"],
    ["sunday"],
]

# ---------------------------------------------------------------------------
# Free-slot helpers
# ---------------------------------------------------------------------------

def _is_valid_days(val: Any) -> bool:
    """Return True only when *val* is a non-empty list of non-empty strings."""
    return (
        isinstance(val, list)
        and len(val) > 0
        and all(isinstance(d, str) and d for d in val)
    )


def _is_valid_time(val: Any) -> bool:
    """Accept either a TimeRange instance or a pre-serialized dict."""
    if isinstance(val, TimeRange):
        return True
    if isinstance(val, dict):
        start = val.get("start")
        end   = val.get("end")
        return (
            isinstance(start, int) and isinstance(end, int)
            and 0 <= start <= 1439 and 0 < end <= 1439
            and end > start
        )
    return False


def _get_time_bounds(val: Any) -> tuple[int, int]:
    """Extract (start, end) from a TimeRange or a dict."""
    if isinstance(val, TimeRange):
        return val.start, val.end
    return val["start"], val["end"]

def _collect_all_valid_slots(valid_rows, invalid_rows):
    occupied_set = set()

    def add_slots(rows_list):
        for row in rows_list:
            for slot in row.get("schedules", []):
                days     = slot.get("days")
                time_val = slot.get("time")
                if _is_valid_days(days) and _is_valid_time(time_val):
                    t_start, t_end = _get_time_bounds(time_val)
                    for day in days:
                        occupied_set.add((day, t_start, t_end))

    add_slots(valid_rows)
    add_slots(invalid_rows)
    return occupied_set


def _find_free_slot_fast(
    occupied_set: set[tuple[str, int, int]],
    duration_mins: int = _DEFAULT_DURATION,
    preferred_days: list[str] | None = None,
) -> tuple[list[str], int, int]:
    """
    Finds a free window using a fast lookup against a flattened single-day master set.
    """
    day_groups_to_try: list[list[str]] = (
        [preferred_days] if preferred_days else []
    ) + _FALLBACK_DAY_GROUPS

    for day_group in day_groups_to_try:
        for start in range(_SEARCH_START, _SEARCH_END - duration_mins + 1, _STEP):
            end = start + duration_mins
            
            # Check overlap against the master set for each day in our target group
            overlap = False
            for day in day_group:
                # Interval overlap formula: start_a < end_b AND end_a > start_b
                if any(day == occ_day and start < occ_end and end > occ_start 
                       for occ_day, occ_start, occ_end in occupied_set):
                    overlap = True
                    break
            
            if not overlap:
                return day_group, start, end

    # Absolute Fallback outside the window
    return ["monday"], _SEARCH_END, _SEARCH_END + duration_mins


def fill_missing_slots(invalid_rows: list[dict], occupied_set: set[tuple[str, int, int]]) -> None:
    """
    Repairs missing schedule components sequentially, updating the master set instantly
    as slots are filled to ensure fallback assignments never collide with each other.
    """
    for row in invalid_rows:
        for slot in row.get("schedules", []):
            days = slot.get("days")
            time_val = slot.get("time")

            valid_days = _is_valid_days(days)
            valid_time = _is_valid_time(time_val)

            if valid_days and valid_time:
                continue  # Slot is already clean

            # Scenario A: Time is known, Days are missing
            if valid_time and not valid_days:
                t_start, t_end = _get_time_bounds(time_val)
                duration = t_end - t_start
                new_days, _, _ = _find_free_slot_fast(occupied_set, duration)
                slot["days"] = new_days
                for d in new_days:
                    occupied_set.add((d, t_start, t_end))

            # Scenario B: Days are known, Time is missing
            elif valid_days and not valid_time:
                new_days, new_start, new_end = _find_free_slot_fast(
                    occupied_set, _DEFAULT_DURATION, preferred_days=list(days)
                )
                slot["days"] = new_days
                slot["time"] = TimeRange(start=new_start, end=new_end)
                
                for d in new_days:
                    occupied_set.add((d, new_start, new_end))

            # Scenario C: Completely unreadable slot
            else:
                new_days, new_start, new_end = _find_free_slot_fast(occupied_set, _DEFAULT_DURATION)
                slot["days"] = new_days
                slot["time"] = TimeRange(start=new_start, end=new_end)
                
                for d in new_days:
                    occupied_set.add((d, new_start, new_end))

def serialize_row(row: list[dict[str, str]] | dict[str, Any] | BaseModel) -> Any:
    """Convert Pydantic models in row to dicts recursively."""
    if isinstance(row, dict):
        return {k: serialize_row(v) for k, v in row.items()}
    elif isinstance(row, list):
        return [serialize_row(item) for item in row]
    elif isinstance(row, BaseModel):
        return row.model_dump()
    else:
        return row

def validate_course_rows(table: TableData) -> TableData:
    """
    An elegant two-pass validation pipeline with precise index tracking.
    """
    valid_rows: list[dict] = []
    
    # Store tuples of (original_row_number, row_dict)
    invalid_rows_tracked: list[tuple[int, dict]] = []

    # Pass 1: Categorize rows and keep track of their real matrix row number
    for idx, row in enumerate(table.rows, 1):
        try:
            CourseRow.model_validate(row)
            valid_rows.append(row)
        except Exception as e:
            logger.warning("Row %d failed validation (will attempt slot repair): %s", idx, e)
            invalid_rows_tracked.append((idx, row))

    # Pass 2: Repair and Re-validate
    if invalid_rows_tracked:
        # Extract just the dicts out to pass to your optimization engine
        raw_invalid_dicts = [row for _, row in invalid_rows_tracked]
        
        # Save deep copies of original state BEFORE repair
        original_states = [copy.deepcopy(row) for row in raw_invalid_dicts]
        
        # Build the initial master copy of all valid intervals
        occupied_set = _collect_all_valid_slots(valid_rows, raw_invalid_dicts)
        
        # Repair the invalid items in-place modifying our tracking set on-the-fly
        fill_missing_slots(raw_invalid_dicts, occupied_set)

        # Final verification round using our saved real-world index numbers
        for (original_idx, row), original_state in zip(invalid_rows_tracked, original_states):
            try:
                # Log the original (unrepaired) state first
                logger.info("Original Row %d Data: %s", original_idx, serialize_row(original_state))
                
                # Validate the repaired row
                CourseRow.model_validate(row)
                valid_rows.append(row)
                
                # Log the repaired (now-validated) state
                logger.info("Repaired Row %d Data: %s", original_idx, serialize_row(row))
                logger.info("Row %d passed validation after slot repair.", original_idx)
            except Exception as e:
                logger.error("Row %d still failed after slot repair; discarding: %s", original_idx, e)

    return TableData(headers=table.headers, rows=valid_rows, cells=table.cells)