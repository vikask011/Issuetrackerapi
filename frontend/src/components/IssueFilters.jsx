import LabelsSelector from "./LabelsSelector";

export default function IssueFilters({
  status,
  setStatus,
  labelIds,
  setLabelIds,
}) {
  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">ALL</option>
        <option value="OPEN">OPEN</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="CLOSED">CLOSED</option>
      </select>

      <LabelsSelector
        selected={labelIds}
        onChange={setLabelIds}
      />
      
    </div>
  );
}
