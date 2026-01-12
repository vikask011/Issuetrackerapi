import { useEffect, useState } from "react";
import { listIssues, getLabels } from "../api/issues";

export default function IssueList({ onSelect, onSelectBulk }) {
  const [issues, setIssues] = useState([]);
  const [status, setStatus] = useState("");
  const [labels, setLabels] = useState([]);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);

  /* -------------------------
     LOAD LABELS (ONCE)
  -------------------------- */
  useEffect(() => {
    getLabels().then(setLabels);
  }, []);

  /* -------------------------
     LOAD ISSUES (FILTERED)
  -------------------------- */
  useEffect(() => {
    const loadIssues = async () => {
      const filters = {};
      if (status) filters.status = status;
      if (selectedLabels.length) filters.labelIds = selectedLabels;

      const data = await listIssues(filters);
      setIssues(data);
    };

    loadIssues();
  }, [status, selectedLabels]);

  /* -------------------------
     FILTER HANDLERS
  -------------------------- */
  const toggleLabel = (id) => {
    setSelectedLabels((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* -------------------------
     BULK SELECTION
  -------------------------- */
  const toggleIssue = (id) => {
    setSelectedIssues((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* 🔥 SEND BULK SELECTION UP */
  useEffect(() => {
    onSelectBulk?.(selectedIssues);
  }, [selectedIssues, onSelectBulk]);

  return (
    <div style={{ marginBottom: 30 }}>
      <h2>Issues</h2>

      {/* STATUS FILTER */}
      <div style={{ marginBottom: 10 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {/* LABEL FILTER */}
      <div style={{ marginBottom: 10 }}>
        <strong>Filter by labels:</strong>
        {labels.map((label) => (
          <label key={label.id} style={{ marginLeft: 10 }}>
            <input
              type="checkbox"
              checked={selectedLabels.includes(label.id)}
              onChange={() => toggleLabel(label.id)}
            />
            {label.name}
          </label>
        ))}
      </div>

      {/* ISSUE LIST */}
      {issues.map((issue) => (
        <div
          key={issue.id}
          style={{
            padding: 10,
            border: "1px solid #ccc",
            marginBottom: 6,
            cursor: "pointer",
            background: selectedIssues.includes(issue.id)
              ? "#f5f5f5"
              : "white",
          }}
          onClick={() => onSelect(issue.id)}
        >
          {/* BULK CHECKBOX */}
          <input
            type="checkbox"
            checked={selectedIssues.includes(issue.id)}
            onClick={(e) => e.stopPropagation()} // 🚫 prevent row click
            onChange={() => toggleIssue(issue.id)}
            style={{ marginRight: 8 }}
          />

          <strong>#{issue.id}</strong> {issue.title}
          <div>Status: {issue.status}</div>

          {issue.labels?.length > 0 && (
            <div>
              Labels: {issue.labels.map((l) => l.name).join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
