from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from .models import Issue, Comment, Label, AuditLog, User


# =========================
# LABELS
# =========================

def get_all_labels(db: Session):
    return db.query(Label).all()


def get_labels_by_ids(db: Session, label_ids: list[int]):
    if not label_ids:
        return []
    return db.query(Label).filter(Label.id.in_(label_ids)).all()


def replace_issue_labels(db: Session, issue: Issue, labels: list[Label]):
    issue.labels = labels
    db.commit()
    db.refresh(issue)
    return issue


# =========================
# COMMENTS
# =========================

def create_comment(db: Session, issue_id: int, body: str):
    comment = Comment(issue_id=issue_id, body=body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_comments_by_issue(db: Session, issue_id: int):
    return (
        db.query(Comment)
        .filter(Comment.issue_id == issue_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


# =========================
# ISSUES
# =========================

def create_issue(
    db: Session,
    title: str,
    description: str,
    status: str = "OPEN",
    label_ids: list[int] | None = None,
    assignee_id: int | None = None,
):
    issue = Issue(
        title=title,
        description=description,
        status=status,
        assignee_id=assignee_id,
    )

    if label_ids:
        issue.labels = get_labels_by_ids(db, label_ids)

    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


def get_issue_by_id(db: Session, issue_id: int):
    return db.query(Issue).filter(Issue.id == issue_id).first()


def update_issue(db: Session, issue: Issue, data: dict):
    if "status" in data:
        if data["status"] == "CLOSED" and issue.closed_at is None:
            issue.closed_at = datetime.utcnow()
        if data["status"] != "CLOSED":
            issue.closed_at = None

    for key, value in data.items():
        setattr(issue, key, value)

    issue.version += 1
    db.commit()
    db.refresh(issue)
    return issue


def list_issues(
    db: Session,
    status: str | None = None,
    label_ids: list[int] | None = None,
):
    query = db.query(Issue)

    if status:
        query = query.filter(Issue.status == status)

    if label_ids:
        query = (
            query.join(Issue.labels)
            .filter(Label.id.in_(label_ids))
            .distinct()
        )

    return query.order_by(Issue.created_at.desc()).all()


# =========================
# AUDIT LOGS
# =========================

def create_audit_log(
    db: Session,
    issue_id: int,
    action: str,
    details: dict | None = None,
):
    log = AuditLog(issue_id=issue_id, action=action, details=details)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_audit_logs_for_issue(db: Session, issue_id: int):
    return (
        db.query(AuditLog)
        .filter(AuditLog.issue_id == issue_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def get_issues_by_ids(db: Session, issue_ids: list[int]):
    return db.query(Issue).filter(Issue.id.in_(issue_ids)).all()


# =========================
# CSV IMPORT
# =========================

def create_issue_from_csv(
    db: Session,
    title: str,
    description: str,
    status: str,
):
    issue = Issue(
        title=title,
        description=description,
        status=status or "OPEN",
    )
    db.add(issue)
    return issue


# =========================
# REPORTS
# =========================

def get_top_assignees(db: Session):
    return (
        db.query(
            User.id.label("user_id"),
            User.name,
            func.count(Issue.id).label("issue_count"),
        )
        .join(Issue, Issue.assignee_id == User.id)
        .group_by(User.id)
        .order_by(func.count(Issue.id).desc())
        .all()
    )


def get_avg_resolution_time(db: Session):
    result = (
        db.query(
            func.avg(
                (func.extract("epoch", Issue.closed_at) -
                 func.extract("epoch", Issue.created_at)) / 3600
            )
        )
        .filter(Issue.closed_at.isnot(None))
        .scalar()
    )

    return result or 0.0
