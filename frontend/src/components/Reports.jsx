import { useEffect, useState } from "react";
import { getTopAssignees, getAvgResolution } from "../api/issues";

export default function Reports() {
  const [assignees, setAssignees] = useState([]);
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    getTopAssignees().then(setAssignees);
    getAvgResolution().then((d) => setLatency(d.average_hours));
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Reports</h2>

      <h3>Top Assignees</h3>
      <ul>
        {assignees.map((a) => (
          <li key={a.user_id}>
            {a.name} — {a.issue_count} issues
          </li>
        ))}
      </ul>

      <h3>Average Resolution Time</h3>
      {latency !== null && (
        <p>{latency.toFixed(2)} hours</p>
      )}
    </div>
  );
}
