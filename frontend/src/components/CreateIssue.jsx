import { useEffect, useState } from "react";
import { createIssue, getLabels, getUsers } from "../api/issues";

export default function CreateIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [labels, setLabels] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedLabels, setSelectedLabels] = useState([]);
  const [assigneeId, setAssigneeId] = useState("");

  const [loading, setLoading] = useState(false);

  // Load labels & users once
  useEffect(() => {
    getLabels().then(setLabels).catch(console.error);
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const toggleLabel = (id) => {
    setSelectedLabels((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const submit = async () => {
    if (!title || !description) {
      alert("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      await createIssue({
        title,
        description,
        status: "OPEN",
        label_ids: selectedLabels,
        assignee_id: assigneeId ? Number(assigneeId) : null,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedLabels([]);
      setAssigneeId("");

      alert("Issue created successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <h2>Create Issue</h2>

      {/* TITLE */}
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />

      {/* ASSIGNEE */}
      <div style={{ marginBottom: 10 }}>
        <strong>Assign to:</strong>
        <br />
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* LABELS */}
      <div style={{ marginBottom: 10 }}>
        <strong>Labels:</strong>
        <br />
        {labels.map((label) => (
          <label key={label.id} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={selectedLabels.includes(label.id)}
              onChange={() => toggleLabel(label.id)}
            />
            {label.name}
          </label>
        ))}
      </div>

      {/* SUBMIT */}
      <button onClick={submit} disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
