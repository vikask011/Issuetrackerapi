import { useState } from "react";
import { bulkUpdateIssues } from "../api/issues";

export default function BulkActions({ issueIds }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const apply = async () => {
    try {
      setError("");
      setMessage("");

      await bulkUpdateIssues({
        issueIds,       // ✅ matches schema
        status,
      });

      setMessage("Bulk update successful");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 10 }}>
      <h3>Bulk Actions</h3>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Select status</option>
        <option value="OPEN">OPEN</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="CLOSED">CLOSED</option>
      </select>

      <button onClick={apply} style={{ marginLeft: 10 }}>
        Apply
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
