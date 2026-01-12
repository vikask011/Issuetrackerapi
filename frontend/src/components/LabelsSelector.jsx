import { useEffect, useState } from "react";
import { getLabels } from "../api/issues";

export default function LabelsSelector({ selected, onChange }) {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    getLabels().then(setLabels);
  }, []);

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <h4>Labels</h4>

      {labels.map((label) => (
        <label key={label.id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selected.includes(label.id)}
            onChange={() => toggle(label.id)}
          />
          {label.name}
        </label>
      ))}
    </div>
  );
}
