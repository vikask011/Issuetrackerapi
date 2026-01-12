const BASE_URL = "http://127.0.0.1:8000";

/* =======================
   ISSUES
======================= */

export async function createIssue(data) {
  const res = await fetch(`${BASE_URL}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create issue");
  return res.json();
}

export async function listIssues(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.append("status", filters.status);
  }

  if (filters.labelIds?.length) {
    filters.labelIds.forEach((id) =>
      params.append("label_ids", id)
    );
  }

  const res = await fetch(`${BASE_URL}/issues?${params.toString()}`);

  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function getIssueById(id) {
  const res = await fetch(`${BASE_URL}/issues/${id}`);
  if (!res.ok) throw new Error("Issue not found");
  return res.json();
}

export async function updateIssue(id, data) {
  const res = await fetch(`${BASE_URL}/issues/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 409) {
    throw new Error("Version conflict. Please refresh.");
  }

  if (!res.ok) throw new Error("Failed to update issue");
  return res.json();
}

/* =======================
   COMMENTS
======================= */

export async function addComment(issueId, body) {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });

  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

export async function getComments(issueId) {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

/* =======================
   LABELS
======================= */

export async function getLabels() {
  const res = await fetch(`${BASE_URL}/labels`);
  if (!res.ok) throw new Error("Failed to load labels");
  return res.json();
}

export async function updateIssueLabels(issueId, labelIds) {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/labels`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label_ids: labelIds }),
  });

  if (!res.ok) throw new Error("Failed to update labels");
  return res.json();
}

/* =======================
   USERS  ✅ NEW
======================= */

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

/* =======================
   AUDIT LOGS
======================= */

export async function getAuditLogs(issueId) {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/audit-logs`);
  if (!res.ok) throw new Error("Failed to load audit logs");
  return res.json();
}

/* =======================
   BULK UPDATE
======================= */

export async function bulkUpdateIssues({ issueIds, status, labelIds }) {
  const res = await fetch(`${BASE_URL}/issues/bulk-update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      issue_ids: issueIds,
      status: status || null,
      label_ids: labelIds || null,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Bulk update error:", err);
    throw new Error("Bulk update failed");
  }

  return res.json();
}

/* =======================
   CSV IMPORT
======================= */

export async function importIssuesCSV(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/issues/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

/* =======================
   REPORTS
======================= */

export async function getTopAssignees() {
  const res = await fetch(`${BASE_URL}/reports/top-assignees`);
  if (!res.ok) throw new Error("Failed to fetch top assignees");
  return res.json();
}

export async function getAvgResolution() {
  const res = await fetch(`${BASE_URL}/reports/latency`);
  if (!res.ok) throw new Error("Failed to fetch latency report");
  return res.json();
}
