from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session

from .db import SessionLocal
from .schemas import (
    IssueCreate,
    IssueResponse,
    IssueUpdate,
    CommentCreate,
    CommentResponse,
    LabelResponse,
    IssueLabelsUpdate,
    AuditLogResponse,
    BulkIssueUpdate,
    CSVImportResponse,
    TopAssigneeResponse,
    AvgResolutionResponse,
)
from .services import (
    create_issue_service,
    get_issue_service,
    update_issue_service,
    create_comment_service,
    get_comments_service,
    get_labels_service,
    update_issue_labels_service,
    list_issues_service,
    get_audit_logs_by_issue,
    bulk_update_issues_service,
    import_issues_from_csv,
    top_assignees_service,
    avg_resolution_service,
)

from .models import User

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/issues", response_model=IssueResponse)
def create_issue(issue: IssueCreate, db: Session = Depends(get_db)):
    return create_issue_service(
        db=db,
        title=issue.title,
        description=issue.description,
        status=issue.status,
        label_ids=issue.label_ids,
        assignee_id=issue.assignee_id,
    )


@router.get("/issues/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    return get_issue_service(db, issue_id)


@router.patch("/issues/{issue_id}", response_model=IssueResponse)
def update_issue(issue_id: int, payload: IssueUpdate, db: Session = Depends(get_db)):
    return update_issue_service(db, issue_id, payload)


@router.get("/issues", response_model=list[IssueResponse])
def list_issues(
    status: str | None = None,
    label_ids: list[int] | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_issues_service(db, status, label_ids)


@router.post("/issues/{issue_id}/comments", response_model=CommentResponse)
def add_comment(issue_id: int, payload: CommentCreate, db: Session = Depends(get_db)):
    return create_comment_service(db, issue_id, payload.body)


@router.get("/issues/{issue_id}/comments", response_model=list[CommentResponse])
def get_comments(issue_id: int, db: Session = Depends(get_db)):
    return get_comments_service(db, issue_id)


@router.put("/issues/{issue_id}/labels", response_model=IssueResponse)
def update_issue_labels(
    issue_id: int,
    payload: IssueLabelsUpdate,
    db: Session = Depends(get_db),
):
    return update_issue_labels_service(db, issue_id, payload.label_ids)


@router.get("/issues/{issue_id}/audit-logs", response_model=list[AuditLogResponse])
def get_audit_logs(issue_id: int, db: Session = Depends(get_db)):
    return get_audit_logs_by_issue(db, issue_id)


@router.post("/issues/bulk-update")
def bulk_update_issues(payload: BulkIssueUpdate, db: Session = Depends(get_db)):
    return bulk_update_issues_service(
        db, payload.issue_ids, payload.status, payload.label_ids
    )


@router.post("/issues/import", response_model=CSVImportResponse)
def import_issues(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return import_issues_from_csv(db, file)


@router.get("/reports/top-assignees", response_model=list[TopAssigneeResponse])
def top_assignees(db: Session = Depends(get_db)):
    return top_assignees_service(db)


@router.get("/reports/latency", response_model=AvgResolutionResponse)
def avg_latency(db: Session = Depends(get_db)):
    return {"average_hours": avg_resolution_service(db)}


@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/labels", response_model=list[LabelResponse])
def list_labels(db: Session = Depends(get_db)):
    return get_labels_service(db)
