import { useEffect, useState } from "react";
import { getAuditLogs } from "../api/issues";

export default function AuditLog({ issueId }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!issueId) return;

    getAuditLogs(issueId)
      .then(setLogs)
      .catch(() => setError("Failed to load audit logs"));
  }, [issueId]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Audit History</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {logs.length === 0 ? (
        <p>No audit logs yet</p>
      ) : (
        <ul style={{ paddingLeft: 20 }}>
          {logs.map((log) => (
            <li key={log.id} style={{ marginBottom: 8 }}>
              <strong>{log.action}</strong>{" "}
              <span style={{ color: "#666" }}>
                ({new Date(log.created_at).toLocaleString()})
              </span>
              {log.meta && (
                <pre style={{ background: "#f5f5f5", padding: 6 }}>
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
