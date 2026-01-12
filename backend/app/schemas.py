from pydantic import BaseModel, Field
from typing import Optional, Any, List
from datetime import datetime

class LabelResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class LabelResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class IssueCreate(BaseModel):
    title: str
    description: str
    status: str = "OPEN"
    label_ids: List[int] = []
    assignee_id: Optional[int] = None


class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    version: int


class IssueResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    version: int
    created_at: datetime
    closed_at: Optional[datetime]
    assignee: Optional[UserResponse]
    labels: List[LabelResponse]
    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1)


class CommentResponse(BaseModel):
    id: int
    body: str
    created_at: datetime
    class Config:
        from_attributes = True


class IssueLabelsUpdate(BaseModel):
    label_ids: List[int]


class BulkIssueUpdate(BaseModel):
    issue_ids: List[int]
    status: Optional[str] = None
    label_ids: Optional[List[int]] = None


class AuditLogResponse(BaseModel):
    id: int
    issue_id: int
    action: str
    details: Optional[Any]
    created_at: datetime
    class Config:
        from_attributes = True


class CSVImportError(BaseModel):
    row: int
    error: str


class CSVImportResponse(BaseModel):
    created: int
    failed: int
    errors: List[CSVImportError]


class TopAssigneeResponse(BaseModel):
    user_id: int
    name: str
    issue_count: int


class AvgResolutionResponse(BaseModel):
    average_hours: float
