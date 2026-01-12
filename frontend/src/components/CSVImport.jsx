import { useState } from "react";
import { importIssuesCSV } from "../api/issues";

export default function CSVImport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const upload = async () => {
    try {
      setError("");
      setResult(null);

      if (!file) {
        setError("Please select a CSV file");
        return;
      }

      const res = await importIssuesCSV(file);
      setResult(res);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <h2>Import Issues (CSV)</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={upload} style={{ marginLeft: 10 }}>
        Upload
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <p>Created: {result.created}</p>
          <p>Failed: {result.failed}</p>

          {result.errors.length > 0 && (
            <ul>
              {result.errors.map((e, i) => (
                <li key={i}>
                  Row {e.row}: {e.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
