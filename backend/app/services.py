import csv
import io
from datetime import datetime
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from .crud import (
    create_issue,
    get_issue_by_id,
    update_issue,
    create_comment,
    get_comments_by_issue,
    get_all_labels,
    get_labels_by_ids,
    replace_issue_labels,
    list_issues,
    create_audit_log,
    get_audit_logs_for_issue,
    get_issues_by_ids,
    create_issue_from_csv,
    get_top_assignees,
    get_avg_resolution_time,
)
from .schemas import CSVImportResponse, CSVImportError

VALID_STATUSES = {"OPEN", "IN_PROGRESS", "CLOSED"}

# =====================================================
# CSV IMPORT
# =====================================================

def import_issues_from_csv(db: Session, file: UploadFile) -> CSVImportResponse:
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    created = 0
    errors = []

    for index, row in enumerate(reader, start=2):
        title = row.get("title", "").strip()
        description = row.get("description", "").strip()
        status = row.get("status", "OPEN").strip()

        if not title:
            errors.append(CSVImportError(row=index, error="Missing title"))
            continue

        if not description:
            errors.append(CSVImportError(row=index, error="Missing description"))
            continue

        if status not in VALID_STATUSES:
            errors.append(CSVImportError(row=index, error="Invalid status"))
            continue

        try:
            create_issue_from_csv(db, title, description, status)
            created += 1
        except Exception as e:
            errors.append(CSVImportError(row=index, error=str(e)))

    db.commit()

    return CSVImportResponse(
        created=created,
        failed=len(errors),
        errors=errors,
    )

# =====================================================
# ISSUES
# =====================================================

def list_issues_service(
    db: Session,
    status: str | None,
    label_ids: list[int] | None,
):
    return list_issues(db, status, label_ids)


def get_issue_service(db: Session, issue_id: int):
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


def create_issue_service(
    db: Session,
    title: str,
    description: str,
    status: str,
    label_ids: list[int] | None,
    assignee_id: int | None,
):
    issue = create_issue(
        db=db,
        title=title,
        description=description,
        status=status,
        label_ids=label_ids,
        assignee_id=assignee_id,
    )

    create_audit_log(
        db,
        issue.id,
        action="CREATE_ISSUE",
        details={"title": title},
    )

    return issue



def update_issue_service(db: Session, issue_id: int, payload):
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # 🔒 Optimistic locking
    if issue.version != payload.version:
        raise HTTPException(status_code=409, detail="Version conflict")

    updates = payload.dict(exclude={"version"}, exclude_unset=True)

    before = {
        "title": issue.title,
        "description": issue.description,
        "status": issue.status,
    }

    updated = update_issue(db, issue, updates)

    create_audit_log(
        db,
        issue_id,
        action="UPDATE",
        details={
            "before": before,
            "after": updates,
        },
    )

    return updated

# =====================================================
# LABELS
# =====================================================

def get_labels_service(db: Session):
    return get_all_labels(db)


def update_issue_labels_service(db: Session, issue_id: int, label_ids: list[int]):
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    before = [l.id for l in issue.labels]

    labels = get_labels_by_ids(db, label_ids)
    issue = replace_issue_labels(db, issue, labels)

    create_audit_log(
        db,
        issue_id,
        action="LABEL_UPDATE",
        details={
            "before": before,
            "after": label_ids,
        },
    )

    return issue

# =====================================================
# COMMENTS
# =====================================================

def get_comments_service(db: Session, issue_id: int):
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return get_comments_by_issue(db, issue_id)


def create_comment_service(db: Session, issue_id: int, body: str):
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    comment = create_comment(db, issue_id, body)

    create_audit_log(
        db,
        issue_id,
        action="COMMENT",
        details={"comment_id": comment.id},
    )

    return comment

# =====================================================
# AUDIT LOGS
# =====================================================

def get_audit_logs_by_issue(db: Session, issue_id: int):
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    return get_audit_logs_for_issue(db, issue_id)

# =====================================================
# BULK UPDATE
# =====================================================

def bulk_update_issues_service(
    db: Session,
    issue_ids: list[int],
    status: str | None,
    label_ids: list[int] | None,
):
    issues = get_issues_by_ids(db, issue_ids)

    if len(issues) != len(issue_ids):
        raise HTTPException(400, "Some issues not found")

    labels = None
    if label_ids is not None:
        labels = get_labels_by_ids(db, label_ids)
        if len(labels) != len(label_ids):
            raise HTTPException(400, "Invalid label id")

    for issue in issues:
        if status:
            issue.status = status
        if labels is not None:
            issue.labels = labels
        issue.version += 1

    db.commit()
    return {"updated": len(issues)}

# =====================================================
# REPORTS
# =====================================================

def top_assignees_service(db: Session):
    return get_top_assignees(db)


def avg_resolution_service(db: Session):
    return get_avg_resolution_time(db)

def get_labels_service(db: Session):
    return get_all_labels(db)
