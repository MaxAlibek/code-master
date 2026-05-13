from datetime import date
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, Field


class Difficulty(StrEnum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Lesson(BaseModel):
    id: str
    course_id: str
    title: str
    summary: str
    content_markdown: str
    estimated_minutes: Annotated[int, Field(ge=1)]
    order: Annotated[int, Field(ge=1)]
    is_required: bool = True
    para: "ParaResources" = Field(default_factory=lambda: ParaResources())
    showcase_code: str | None = None
    vscode_path: str | None = None
    practice_tasks: list["PracticeTask"] = Field(default_factory=list)


class PracticeTask(BaseModel):
    id: str
    title: str
    description: str
    starter_code: str
    solution: str
    hints: list[str] = Field(default_factory=list)


class Course(BaseModel):
    id: str
    title: str
    description: str
    difficulty: Difficulty
    technologies: list[str]
    deadline: date
    estimated_hours: Annotated[int, Field(ge=1)]
    lessons: list[Lesson] = Field(default_factory=list)
    unlocks_after_course_id: str | None = None


class ParaResources(BaseModel):
    projects: list[str] = Field(default_factory=list)
    areas: list[str] = Field(default_factory=list)
    resources: list[str] = Field(default_factory=list)
    archives: list[str] = Field(default_factory=list)


class LessonCompletionRequest(BaseModel):
    user_id: str = "local"


class LessonCompletion(BaseModel):
    lesson_id: str
    completed: bool
    completed_lesson_ids: list[str]


class VerifyRequest(BaseModel):
    lesson_id: str
    code: str
    task_id: str | None = None
    language: str = "en"


class VerifyResponse(BaseModel):
    lesson_id: str
    task_id: str | None = None
    stars: Annotated[int, Field(ge=1, le=5)]
    passed: bool
    feedback: list[str]


class GeneratedAssessmentQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    correct_answer: Annotated[int, Field(ge=0, le=3)]
    difficulty: str
    category: str


class GenerateAssessmentRequest(BaseModel):
    track_id: str
    previous_correct: int = 0
    previous_total: int = 0
    language: str = "en"


class GenerateAssessmentResponse(BaseModel):
    track_id: str
    session_id: str
    questions: list[GeneratedAssessmentQuestion]
