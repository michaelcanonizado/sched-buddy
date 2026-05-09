import time
import uuid
from typing import Dict, Optional
from core.schemas import Job, JobStatus


class JobStore:
    """Thread-safe in-memory store for pipeline jobs."""

    def __init__(self):
        self._jobs: Dict[str, Job] = {}

    def create(self, filename: str) -> Job:
        job_id = str(uuid.uuid4())
        job = Job(
            job_id=job_id,
            status=JobStatus.PENDING,
            filename=filename,
            created_at=time.time(),
        )
        self._jobs[job_id] = job
        return job

    def get(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def update(self, job_id: str, **kwargs) -> Optional[Job]:
        job = self._jobs.get(job_id)
        if job:
            for key, value in kwargs.items():
                setattr(job, key, value)
        return job

    def all(self) -> list[Job]:
        return list(self._jobs.values())

    def delete(self, job_id: str) -> bool:
        return self._jobs.pop(job_id, None) is not None

    def purge_expired(self, ttl: int) -> int:
        now = time.time()
        expired = [
            jid for jid, job in self._jobs.items()
            if now - job.created_at > ttl
        ]
        for jid in expired:
            del self._jobs[jid]
        return len(expired)


# Singleton — shared across the app lifetime
job_store = JobStore()
