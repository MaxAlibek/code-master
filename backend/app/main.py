import os
import json
import random
from uuid import uuid4
from copy import deepcopy

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import Course, Difficulty, GenerateAssessmentRequest, GenerateAssessmentResponse, GeneratedAssessmentQuestion, Lesson, LessonCompletion, LessonCompletionRequest, ParaResources, PracticeTask, VerifyRequest, VerifyResponse

app = FastAPI(title="CodeMaster Learning API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COMPLETED_LESSONS_BY_USER: dict[str, set[str]] = {}
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

COURSES: list[Course] = [
    Course(
        id="python-core",
        title="Python Core",
        description="Master Python fundamentals with theory, showcase code, and three AI-reviewed practice tasks per lesson.",
        difficulty=Difficulty.beginner,
        technologies=["Python", "Clean Code", "PyTest"],
        deadline="2026-07-15",
        estimated_hours=72,
        lessons=[
            Lesson(
                id="python-variables-types",
                course_id="python-core",
                title="Python Variables & Types",
                summary="Build reliable mental models for names, values, and core Python types.",
                content_markdown="# Variables and Types\n\nPython variables are names bound to objects. Keep type conversions explicit and return values instead of printing directly.",
                estimated_minutes=120,
                order=1,
                para=ParaResources(projects=["Profile normalizer"], areas=["Python foundations"], resources=["Python data model"], archives=["Implicit conversion bugs"]),
                showcase_code="def build_user_profile(name: str, age: int) -> dict:\n    return {\"name\": name.strip().title(), \"age\": int(age)}",
                vscode_path="C:/Users/Hp/Desktop/project/practice/lesson_1_tasks.py",
                practice_tasks=[
                    PracticeTask(id="python-types-profile", title="Normalize a profile", description="Return a normalized profile dictionary.", starter_code="def normalize_profile(name, age, is_active):\n    pass\n", solution="def normalize_profile(name, age, is_active):\n    return {\"name\": name.strip().title(), \"age\": int(age), \"is_active\": bool(is_active)}\n", hints=["Return a dictionary", "Convert age explicitly"]),
                    PracticeTask(id="python-types-summary", title="Build a typed summary", description="Return a formatted user summary.", starter_code="def profile_summary(profile):\n    pass\n", solution="def profile_summary(profile):\n    status = \"active\" if profile[\"is_active\"] else \"inactive\"\n    return f\"{profile['name']} is {profile['age']} and {status}\"\n", hints=["Read dictionary values", "Return a string"]),
                    PracticeTask(id="python-types-validate", title="Validate profile data", description="Reject empty names and negative ages.", starter_code="def validate_profile(name, age):\n    pass\n", solution="def validate_profile(name, age):\n    if not name.strip():\n        return None\n    if int(age) < 0:\n        return None\n    return {\"name\": name.strip().title(), \"age\": int(age)}\n", hints=["Use guard clauses", "Return None for invalid input"]),
                ],
            ),
            Lesson(
                id="python-control-flow",
                course_id="python-core",
                title="Python Control Flow",
                summary="Use conditions and loops to make decisions without hiding business rules.",
                content_markdown="# Control Flow\n\nConditionals express decisions. Loops express repeated work. Keep branches readable and loop bodies small.",
                estimated_minutes=180,
                order=2,
                para=ParaResources(projects=["Score categorizer"], areas=["Decision logic"], resources=["Python control flow"], archives=["Nested branch refactors"]),
                showcase_code="def categorize_scores(scores: list[int]) -> dict:\n    result = {\"passed\": 0, \"failed\": 0}\n    for score in scores:\n        if score >= 70:\n            result[\"passed\"] += 1\n        else:\n            result[\"failed\"] += 1\n    return result",
                vscode_path="C:/Users/Hp/Desktop/project/practice/lesson_2_tasks.py",
                practice_tasks=[
                    PracticeTask(id="python-flow-grade", title="Grade a score", description="Return excellent, pass, or retry.", starter_code="def grade_score(score):\n    pass\n", solution="def grade_score(score):\n    if score >= 90:\n        return \"excellent\"\n    if score >= 70:\n        return \"pass\"\n    return \"retry\"\n", hints=["Use guard-style if statements"]),
                    PracticeTask(id="python-flow-filter", title="Filter active users", description="Return only active users.", starter_code="def active_users(users):\n    pass\n", solution="def active_users(users):\n    result = []\n    for user in users:\n        if user.get(\"is_active\"):\n            result.append(user)\n    return result\n", hints=["Use a result list", "Use a for loop"]),
                    PracticeTask(id="python-flow-streak", title="Calculate a streak", description="Count consecutive completed days.", starter_code="def current_streak(days):\n    pass\n", solution="def current_streak(days):\n    streak = 0\n    for completed in days:\n        if not completed:\n            return streak\n        streak += 1\n    return streak\n", hints=["Stop on first false value"]),
                ],
            ),
            Lesson(
                id="python-functions",
                course_id="python-core",
                title="Python Functions",
                summary="Design focused functions with clear inputs, outputs, and reviewable boundaries.",
                content_markdown="# Functions\n\nFunctions are the smallest architectural boundary in Python. A useful function has one reason to change.",
                estimated_minutes=240,
                order=3,
                para=ParaResources(projects=["Mastery unlock helper"], areas=["Function design"], resources=["Python functions"], archives=["Hidden state examples"]),
                showcase_code="def calculate_average_score(task_scores: list[int]) -> float:\n    if not task_scores:\n        return 0.0\n    return round(sum(task_scores) / len(task_scores), 2)",
                vscode_path="C:/Users/Hp/Desktop/project/practice/lesson_3_tasks.py",
                practice_tasks=[
                    PracticeTask(id="python-functions-average", title="Average task score", description="Return a rounded average.", starter_code="def average_score(scores):\n    pass\n", solution="def average_score(scores):\n    if not scores:\n        return 0\n    return round(sum(scores) / len(scores), 2)\n", hints=["Handle empty lists"]),
                    PracticeTask(id="python-functions-unlock", title="Unlock decision", description="Decide if next lesson unlocks.", starter_code="def can_unlock(scores):\n    pass\n", solution="def can_unlock(scores):\n    if not scores:\n        return False\n    return sum(scores) / len(scores) >= 4\n", hints=["Return a boolean"]),
                    PracticeTask(id="python-functions-report", title="Build a review report", description="Return average, task count, and status.", starter_code="def review_report(scores):\n    pass\n", solution="def review_report(scores):\n    average = round(sum(scores) / len(scores), 2) if scores else 0\n    return {\"average\": average, \"tasks\": len(scores), \"can_progress\": average >= 4}\n", hints=["Return a dictionary"]),
                ],
            ),
        ],
    ),
    Course(
        id="frontend",
        title="Frontend Development",
        description="Master modern frontend foundations and UI engineering.",
        difficulty=Difficulty.beginner,
        technologies=["HTML", "CSS", "JavaScript", "React", "TypeScript"],
        deadline="2026-07-31",
        estimated_hours=120,
        lessons=[
            Lesson(
                id="html-fundamentals",
                course_id="frontend",
                title="HTML Fundamentals",
                summary="Build semantic page structure with accessible HTML.",
                content_markdown="""# HTML Fundamentals

HTML is the structural layer of the web. It gives meaning to content before layout, color, or interaction are added.

## Learning outcomes

- Create a valid document structure.
- Use semantic elements for readability and accessibility.
- Connect headings, paragraphs, links, and forms into a coherent page.

## Reader workflow

Start with the document outline. Then add semantic sections. Finish by checking whether a screen reader could understand the page without CSS.
""",
                estimated_minutes=120,
                order=1,
                para=ParaResources(
                    projects=["Build a personal profile page"],
                    areas=["Accessibility", "Semantic structure"],
                    resources=["MDN HTML elements reference", "WebAIM headings guide"],
                    archives=["Legacy table-layout pages"],
                ),
            ),
            Lesson(
                id="css-styling",
                course_id="frontend",
                title="CSS Styling",
                summary="Apply layout, spacing, and visual hierarchy with CSS.",
                content_markdown="""# CSS Styling

CSS turns structure into a clear reading experience. Good styling starts with spacing, typography, and predictable layout rules.

## Core principles

- Use spacing tokens consistently.
- Separate layout rules from visual treatment.
- Prefer readable contrast and stable line length.

## Practice

Style the profile page from the HTML lesson with a card layout, responsive spacing, and a clear visual hierarchy.
""",
                estimated_minutes=180,
                order=2,
                para=ParaResources(
                    projects=["Style the personal profile page"],
                    areas=["Design systems", "Responsive layout"],
                    resources=["CSS Tricks flexbox guide", "MDN cascade layers"],
                    archives=["One-off color experiments"],
                ),
            ),
        ],
    ),
    Course(
        id="data-science",
        title="Data Science",
        description="Analyze data and build machine learning workflows.",
        difficulty=Difficulty.advanced,
        technologies=["Python", "SQL", "Pandas", "Machine Learning"],
        deadline="2026-09-30",
        estimated_hours=180,
        unlocks_after_course_id="frontend",
    ),
]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/courses", response_model=list[Course])
def list_courses() -> list[Course]:
    return COURSES


@app.get("/courses/{course_id}", response_model=Course)
def get_course(course_id: str) -> Course:
    for course in COURSES:
        if course.id == course_id:
            return course
    raise HTTPException(status_code=404, detail="Course not found")


@app.get("/lessons/{lesson_id}", response_model=Lesson)
def get_lesson(lesson_id: str, language: str = "en") -> Lesson:
    for course in COURSES:
        for lesson in course.lessons:
            if lesson.id == lesson_id:
                localized = localize_lesson_with_gemini(lesson, language)
                return localized or lesson
    raise HTTPException(status_code=404, detail="Lesson not found")


@app.post("/assessment/generate", response_model=GenerateAssessmentResponse)
def generate_assessment(payload: GenerateAssessmentRequest) -> GenerateAssessmentResponse:
    generated = generate_assessment_with_gemini(payload)
    if generated:
        return generated
    language = normalize_language(payload.language)

    track_topics = {
        "frontend": ["React state", "accessibility", "rendering", "layout"],
        "backend": ["FastAPI routing", "validation", "transactions", "idempotency"],
        "mobile": ["React Native navigation", "offline sync", "permissions", "performance"],
        "data-science": ["SQL aggregation", "data cleaning", "model validation", "feature leakage"],
    }
    topics = track_topics.get(payload.track_id, track_topics["frontend"])
    win_rate = payload.previous_correct / payload.previous_total if payload.previous_total else 0.5
    difficulties = ["hard" if win_rate >= 0.7 else "easy" if win_rate <= 0.35 else "medium"]
    difficulties.extend(random.choice(["easy", "medium", "hard"]) for _ in range(9))
    session_id = str(uuid4())
    questions: list[GeneratedAssessmentQuestion] = []

    for index, difficulty in enumerate(difficulties[:10]):
        topic = random.choice(topics)
        correct = localize_assessment_text("Use explicit, testable {topic} decisions", language, topic=topic)
        options = [
            correct,
            localize_assessment_text("Hide failure cases until production", language),
            localize_assessment_text("Rely on global mutable state", language),
            localize_assessment_text("Skip validation for speed", language),
        ]
        random.shuffle(options)
        questions.append(
            GeneratedAssessmentQuestion(
                id=f"{payload.track_id}-{session_id}-{index}",
                question=localize_assessment_text(
                    "{track_id}: unique scenario {index}. What is the strongest {difficulty} choice for {topic}?",
                    language,
                    track_id=payload.track_id,
                    index=index + 1,
                    difficulty=difficulty,
                    topic=topic,
                ),
                options=options,
                correct_answer=options.index(correct),
                difficulty=difficulty,
                category=payload.track_id,
            )
        )

    return GenerateAssessmentResponse(track_id=payload.track_id, session_id=session_id, questions=questions)


@app.post("/lessons/{lesson_id}/complete", response_model=LessonCompletion)
def complete_lesson(lesson_id: str, payload: LessonCompletionRequest) -> LessonCompletion:
    if not any(lesson.id == lesson_id for course in COURSES for lesson in course.lessons):
        raise HTTPException(status_code=404, detail="Lesson not found")

    completed = COMPLETED_LESSONS_BY_USER.setdefault(payload.user_id, set())
    completed.add(lesson_id)
    return LessonCompletion(
        lesson_id=lesson_id,
        completed=True,
        completed_lesson_ids=sorted(completed),
    )


@app.post("/verify", response_model=VerifyResponse)
def verify_solution(payload: VerifyRequest) -> VerifyResponse:
    if not any(lesson.id == payload.lesson_id for course in COURSES for lesson in course.lessons):
        raise HTTPException(status_code=404, detail="Lesson not found")

    verified = verify_with_gemini(payload)
    if verified:
        return verified

    code = payload.code.strip()
    language = normalize_language(payload.language)
    feedback: list[str] = []
    stars = 1

    if len(code) >= 80:
        stars += 1
        feedback.append(localize_text("Solution has enough substance to review architecture and intent.", language))
    else:
        feedback.append(localize_text("Add a complete implementation before relying on the grader.", language))

    if "def " in code or "class " in code:
        stars += 1
        feedback.append(localize_text("Code is organized around named units.", language))
    else:
        feedback.append(localize_text("Extract logic into clear functions or classes.", language))

    if any(token in code for token in ["if ", "for ", "while ", "return"]):
        stars += 1
        feedback.append(localize_text("Control flow is explicit enough to inspect.", language))
    else:
        feedback.append(localize_text("Make the solution logic explicit with control flow and return values.", language))

    if "#" not in code and "TODO" not in code.upper() and "print(" not in code:
        stars += 1
        feedback.append(localize_text("Clean Code signal is strong: low noise and no debug leftovers.", language))
    else:
        feedback.append(localize_text("Remove debug prints, TODO markers, and explanatory clutter before final submission.", language))

    stars = min(stars, 5)
    return VerifyResponse(
        lesson_id=payload.lesson_id,
        task_id=payload.task_id,
        stars=stars,
        passed=stars >= 3,
        feedback=feedback,
    )


def call_gemini_json(prompt: str) -> dict | None:
    if not GEMINI_API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"},
    }

    try:
        response = httpx.post(url, params={"key": GEMINI_API_KEY}, json=body, timeout=20)
        response.raise_for_status()
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except Exception:
        return None


def verify_with_gemini(payload: VerifyRequest) -> VerifyResponse | None:
    language = normalize_language(payload.language)
    prompt = f"""
You are a Senior DRM Lead code reviewer. Return only valid JSON:
{{"stars": 1-5, "passed": boolean, "feedback": ["short inline review comment", "..."]}}
Grade for clean code, correctness, explicit logic, maintainability, and production readiness.
All feedback MUST be in this language: {language}.
lesson_id: {payload.lesson_id}
task_id: {payload.task_id}
code:
{payload.code}
"""
    data = call_gemini_json(prompt)
    if not data:
        return None

    try:
        stars = max(1, min(5, int(data.get("stars", 1))))
        feedback = data.get("feedback") if isinstance(data.get("feedback"), list) else []
        return VerifyResponse(
            lesson_id=payload.lesson_id,
            task_id=payload.task_id,
            stars=stars,
            passed=bool(data.get("passed", stars >= 3)),
            feedback=[str(item) for item in feedback[:6]] or [localize_text("Gemini review completed.", language)],
        )
    except Exception:
        return None


def generate_assessment_with_gemini(payload: GenerateAssessmentRequest) -> GenerateAssessmentResponse | None:
    session_id = str(uuid4())
    language = normalize_language(payload.language)
    prompt = f"""
Generate a unique adaptive coding assessment. Return only valid JSON:
{{"questions":[{{"question":"...", "options":["A","B","C","D"], "correct_answer":0, "difficulty":"easy|medium|hard", "category":"..."}}]}}
Rules:
- exactly 10 questions
- each question must be non-empty
- each options array must contain exactly 4 non-empty strings
- correct_answer must be 0, 1, 2, or 3
Language rule: all question and option text must be written in {language}.
track_id: {payload.track_id}
previous_correct: {payload.previous_correct}
previous_total: {payload.previous_total}
"""
    data = call_gemini_json(prompt)
    raw_questions = data.get("questions") if data else None
    if not isinstance(raw_questions, list) or len(raw_questions) < 10:
        return None

    questions: list[GeneratedAssessmentQuestion] = []
    for index, item in enumerate(raw_questions[:10]):
        options = item.get("options")
        question = str(item.get("question", "")).strip()
        if not question or not isinstance(options, list) or len(options) != 4:
            return None

        questions.append(
            GeneratedAssessmentQuestion(
                id=f"{payload.track_id}-{session_id}-{index}",
                question=question,
                options=[str(option) for option in options],
                correct_answer=max(0, min(3, int(item.get("correct_answer", 0)))),
                difficulty=str(item.get("difficulty", "medium")),
                category=str(item.get("category", payload.track_id)),
            )
        )

    return GenerateAssessmentResponse(track_id=payload.track_id, session_id=session_id, questions=questions)


def normalize_language(language: str | None) -> str:
    lang = (language or "en").strip().lower()
    return lang if lang in {"en", "ru", "uz"} else "en"


def localize_text(text: str, language: str) -> str:
    if language == "ru":
        translations = {
            "Solution has enough substance to review architecture and intent.": "Решение достаточно содержательное для оценки архитектуры и замысла.",
            "Add a complete implementation before relying on the grader.": "Добавьте полную реализацию перед отправкой на проверку.",
            "Code is organized around named units.": "Код организован вокруг именованных сущностей.",
            "Extract logic into clear functions or classes.": "Вынесите логику в понятные функции или классы.",
            "Control flow is explicit enough to inspect.": "Поток управления достаточно явный для ревью.",
            "Make the solution logic explicit with control flow and return values.": "Сделайте логику решения явной с помощью ветвлений и возвращаемых значений.",
            "Clean Code signal is strong: low noise and no debug leftovers.": "Сигнал Clean Code сильный: мало шума и нет отладочных остатков.",
            "Remove debug prints, TODO markers, and explanatory clutter before final submission.": "Удалите debug-print, TODO-метки и лишние пояснения перед финальной отправкой.",
            "Gemini review completed.": "Проверка Gemini завершена."
        }
        return translations.get(text, text)
    if language == "uz":
        translations = {
            "Solution has enough substance to review architecture and intent.": "Yechim arxitektura va niyatni ko'rib chiqish uchun yetarlicha mazmunli.",
            "Add a complete implementation before relying on the grader.": "Baholagichga yuborishdan oldin to'liq implementatsiya qo'shing.",
            "Code is organized around named units.": "Kod nomlangan birliklar asosida tashkil qilingan.",
            "Extract logic into clear functions or classes.": "Mantiqni aniq funksiyalar yoki klasslarga ajrating.",
            "Control flow is explicit enough to inspect.": "Boshqaruv oqimi tekshiruv uchun yetarlicha aniq.",
            "Make the solution logic explicit with control flow and return values.": "Yechim mantiqini shartlar va return qiymatlari bilan aniq ko'rsating.",
            "Clean Code signal is strong: low noise and no debug leftovers.": "Clean Code signali kuchli: ortiqcha shovqin va debug qoldiqlari yo'q.",
            "Remove debug prints, TODO markers, and explanatory clutter before final submission.": "Yakuniy topshirishdan oldin debug printlar, TODO belgilar va ortiqcha izohlarni olib tashlang.",
            "Gemini review completed.": "Gemini tekshiruvi yakunlandi."
        }
        return translations.get(text, text)
    return text


def localize_lesson_with_gemini(lesson: Lesson, language: str) -> Lesson | None:
    language = normalize_language(language)
    if language == "en":
        return lesson

    prompt = f"""
You are localizing a coding lesson for students.
Return only valid JSON:
{{
  "title": "...",
  "summary": "...",
  "content_markdown": "...",
  "practice_tasks": [
    {{"id":"...", "title":"...", "description":"...", "hints":["..."]}}
  ]
}}
Rules:
- Keep meaning, pedagogy, and technical correctness unchanged.
- Keep markdown structure readable.
- Translate everything to {language}.
- Keep task ids unchanged and preserve task count.
lesson:
{lesson.model_dump_json()}
"""
    data = call_gemini_json(prompt)
    if not data:
        return None

    try:
        localized = deepcopy(lesson)
        localized.title = str(data.get("title", lesson.title))
        localized.summary = str(data.get("summary", lesson.summary))
        localized.content_markdown = str(data.get("content_markdown", lesson.content_markdown))

        tasks = data.get("practice_tasks")
        if isinstance(tasks, list) and len(tasks) == len(localized.practice_tasks):
            for index, task in enumerate(localized.practice_tasks):
                incoming = tasks[index] if isinstance(tasks[index], dict) else {}
                task.title = str(incoming.get("title", task.title))
                task.description = str(incoming.get("description", task.description))
                hints = incoming.get("hints")
                if isinstance(hints, list):
                    task.hints = [str(item) for item in hints[:5]]

        return localized
    except Exception:
        return None


def localize_assessment_text(template: str, language: str, **kwargs) -> str:
    rendered = template.format(**kwargs)
    if language == "ru":
        translations = {
            "Hide failure cases until production": "Скрывать сбои до продакшена",
            "Rely on global mutable state": "Полагаться на глобальное изменяемое состояние",
            "Skip validation for speed": "Пропускать валидацию ради скорости",
        }
        if template == "Use explicit, testable {topic} decisions":
            return f"Используйте явные и проверяемые решения для {kwargs.get('topic', '')}"
        if template == "{track_id}: unique scenario {index}. What is the strongest {difficulty} choice for {topic}?":
            return f"{kwargs.get('track_id', '')}: уникальный сценарий {kwargs.get('index', 1)}. Какое {kwargs.get('difficulty', 'medium')} решение для {kwargs.get('topic', '')} самое сильное?"
        return translations.get(rendered, rendered)
    if language == "uz":
        translations = {
            "Hide failure cases until production": "Nosozlik holatlarini productiongacha yashirish",
            "Rely on global mutable state": "Global o'zgaruvchan holatga tayanish",
            "Skip validation for speed": "Tezlik uchun validatsiyani o'tkazib yuborish",
        }
        if template == "Use explicit, testable {topic} decisions":
            return f"{kwargs.get('topic', '')} uchun aniq va testlanadigan qarorlarni qo'llang"
        if template == "{track_id}: unique scenario {index}. What is the strongest {difficulty} choice for {topic}?":
            return f"{kwargs.get('track_id', '')}: noyob ssenariy {kwargs.get('index', 1)}. {kwargs.get('topic', '')} uchun eng kuchli {kwargs.get('difficulty', 'medium')} tanlov qaysi?"
        return translations.get(rendered, rendered)
    return rendered
