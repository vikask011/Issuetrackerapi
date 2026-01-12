import { useState } from "react";
import CreateIssue from "./components/CreateIssue";
import UpdateIssue from "./components/UpdateIssue";
import Comments from "./components/Comments";
import IssueList from "./components/IssueList";
import BulkActions from "./components/BulkActions";
import CSVImport from "./components/CSVImport";
import Reports from "./components/Reports";

function App() {
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [bulkIssueIds, setBulkIssueIds] = useState([]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Issue Tracker</h1>

      {/* CREATE ISSUE */}
      <CreateIssue />

      <hr />

      {/* BULK ACTIONS (VISIBLE ONLY IF ISSUES SELECTED) */}
      {bulkIssueIds.length > 0 && (
        <>
          <BulkActions issueIds={bulkIssueIds} />
          <hr />
        </>
      )}

      <CSVImport />
<hr />

      {/* ISSUE LIST */}
      <IssueList
        onSelect={setActiveIssueId}
        onSelectBulk={setBulkIssueIds}
      />

      <hr />

      {/* ISSUE DETAILS */}
      {activeIssueId && (
        <>
          <UpdateIssue issueId={activeIssueId} />
          <hr />
          <Comments issueId={activeIssueId} />
        </>
      )}

       <hr />
      <Reports />
    </div>
  );
}

export default App;
