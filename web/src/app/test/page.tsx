"use client";

import { useTableExtraction } from "@/hooks/useTableExtraction";
import { useEffect, useState } from "react";

export default function TestPage() {
  const { extract, subjects, phase, error } = useTableExtraction();
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setStartTime(Date.now());
      setElapsedTime(null);
      extract(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (phase === "done" && startTime) {
      setElapsedTime(Date.now() - startTime);
    }
  }, [phase, startTime]);

  return (
    <div style={{ padding: 32 }}>
      <h1>Pipeline Test</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <p>Status: <strong>{phase}</strong></p>

      {elapsedTime && (
        <p style={{ color: "#0070f3" }}>
          Processing time: <strong>{(elapsedTime / 1000).toFixed(2)}s</strong>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {phase === "done" && (
        <pre style={{ background: "#f4f4f4", padding: 16 }}>
          {JSON.stringify(subjects, null, 2)}
        </pre>
      )}
    </div>
  );
}