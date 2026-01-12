import { useEffect, useState } from "react";
import {
  getIssueById,
  updateIssue,
  updateIssueLabels,
} from "../api/issues";
import LabelsSelector from "./LabelsSelector";
import AuditLog from "./AuditLog";

export default function UpdateIssue({ issueId, onIssueLoaded }) {
  const [issue, setIssue] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 LOAD ISSUE WHEN issueId CHANGES
  useEffect(() => {
    if (!issueId) return;

    const fetchIssue = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const data = await getIssueById(issueId);
        setIssue(data);
        setSelectedLabels((data.labels ?? []).map((l) => l.id));

        onIssueLoaded?.(issueId);
      } catch (err) {
        setError(err.message || "Failed to load issue");
        setIssue(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueId, onIssueLoaded]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // 1️⃣ Update issue core fields
      await updateIssue(issueId, {
        title: issue.title,
        description: issue.description,
        status: issue.status,
        version: issue.version,
      });

      // 2️⃣ Update labels
      await updateIssueLabels(issueId, selectedLabels);

      // 3️⃣ Reload updated issue
      const refreshed = await getIssueById(issueId);
      setIssue(refreshed);
      setSelectedLabels((refreshed.labels ?? []).map((l) => l.id));

      setMessage("Issue updated successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!issueId) {
    return <p>Select an issue to update</p>;
  }

  if (loading && !issue) {
    return <p>Loading issue...</p>;
  }

  if (!issue) {
    return <p>Issue not found</p>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <h2>Update Issue #{issueId}</h2>

      {/* TITLE */}
      <div>
        <input
          style={{ width: "100%", marginBottom: 8 }}
          value={issue.title}
          onChange={(e) =>
            setIssue({ ...issue, title: e.target.value })
          }
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <textarea
          style={{ width: "100%", marginBottom: 8 }}
          rows={4}
          value={issue.description}
          onChange={(e) =>
            setIssue({ ...issue, description: e.target.value })
          }
        />
      </div>

      {/* STATUS */}
      <div>
        <select
          style={{ width: "100%", marginBottom: 12 }}
          value={issue.status}
          onChange={(e) =>
            setIssue({ ...issue, status: e.target.value })
          }
        >
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {/* LABEL SELECTOR */}
      <LabelsSelector
        selected={selectedLabels}
        onChange={setSelectedLabels}
      />

      {/* 🔖 CURRENT LABELS DISPLAY */}
      <div style={{ marginTop: 12 }}>
        <strong>Labels:</strong>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 6,
          }}
        >
          {(issue.labels ?? []).length === 0 && (
            <span style={{ color: "#777" }}>No labels</span>
          )}

          {(issue.labels ?? []).map((label) => (
            <span
              key={label.id}
              style={{
                padding: "4px 10px",
                borderRadius: 12,
                background: "#eef",
                fontSize: 12,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      </div>

      {/* VERSION */}
      <p style={{ marginTop: 10 }}>
        <strong>Version:</strong> {issue.version}
      </p>

      {/* UPDATE BUTTON */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Updating..." : "Update"}
      </button>

      {/* STATUS MESSAGES */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {/* 🔥 AUDIT LOG */}
      <AuditLog issueId={issueId} />
    </div>
  );
}
