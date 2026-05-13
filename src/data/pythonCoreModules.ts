import { LearningModule } from '../types'

export const pythonCoreModules: LearningModule[] = [
  {
    id: 'python-variables-types',
    title: 'Python Variables & Types',
    description: 'Build reliable mental models for names, values, and core Python types.',
    content: `# Variables and Types

## Theory
Python variables are names bound to objects. A name can point to a string, number, boolean, list, dictionary, or any custom object. Strong foundations start with knowing what value shape you are passing through the program.

## Engineering checklist
- Choose names that describe intent.
- Keep type conversions explicit.
- Prefer small functions that return values instead of printing directly.
- Validate input before transforming it.`,
    showcaseCode: `def build_user_profile(name: str, age: int, is_active: bool) -> dict:
    return {
        "name": name.strip().title(),
        "age": int(age),
        "is_active": bool(is_active),
        "label": f"{name.strip().title()} ({age})"
    }

profile = build_user_profile("ada", 28, True)`,
    vscodePath: 'C:/Users/Hp/Desktop/project/practice/lesson_1_tasks.py',
    exercises: [
      {
        id: 'python-types-profile',
        title: 'Normalize a profile',
        description: 'Create a function that accepts name, age, and active status, then returns a normalized dictionary.',
        language: 'python',
        starterCode: 'def normalize_profile(name, age, is_active):\n    pass\n',
        solution: 'def normalize_profile(name, age, is_active):\n    return {"name": name.strip().title(), "age": int(age), "is_active": bool(is_active)}\n',
        hints: ['Return a dictionary', 'Use strip and title for the name', 'Convert age explicitly'],
        difficulty: 'easy',
        validation: { type: 'includes', allOf: ['def ', 'return', 'int('] }
      },
      {
        id: 'python-types-summary',
        title: 'Build a typed summary',
        description: 'Return a formatted string that combines a user name, age, and account status.',
        language: 'python',
        starterCode: 'def profile_summary(profile):\n    pass\n',
        solution: 'def profile_summary(profile):\n    status = "active" if profile["is_active"] else "inactive"\n    return f"{profile[\"name\"]} is {profile[\"age\"]} and {status}"\n',
        hints: ['Read values from the dictionary', 'Use an if expression', 'Return the formatted string'],
        difficulty: 'easy',
        validation: { type: 'includes', allOf: ['def ', 'return', 'if'] }
      },
      {
        id: 'python-types-validate',
        title: 'Validate profile data',
        description: 'Reject empty names and negative ages before returning a normalized object.',
        language: 'python',
        starterCode: 'def validate_profile(name, age):\n    pass\n',
        solution: 'def validate_profile(name, age):\n    if not name.strip():\n        return None\n    if int(age) < 0:\n        return None\n    return {"name": name.strip().title(), "age": int(age)}\n',
        hints: ['Guard invalid data early', 'Return None for invalid input', 'Keep conversion explicit'],
        difficulty: 'medium',
        validation: { type: 'includes', allOf: ['if ', 'return', 'None'] }
      }
    ],
    prerequisites: [],
    estimatedTime: 2
  },
  {
    id: 'python-control-flow',
    title: 'Python Control Flow',
    description: 'Use conditions and loops to make decisions without hiding business rules.',
    content: `# Control Flow

## Theory
Control flow is where code becomes behavior. Conditionals express decisions. Loops express repeated work. Senior-quality Python keeps branches readable and loop bodies small.

## Engineering checklist
- Put guard clauses before the main happy path.
- Keep loop bodies focused.
- Return structured results.
- Avoid deeply nested branches.`,
    showcaseCode: `def categorize_scores(scores: list[int]) -> dict:
    result = {"passed": 0, "failed": 0}
    for score in scores:
        if score >= 70:
            result["passed"] += 1
        else:
            result["failed"] += 1
    return result`,
    vscodePath: 'C:/Users/Hp/Desktop/project/practice/lesson_2_tasks.py',
    exercises: [
      {
        id: 'python-flow-grade',
        title: 'Grade a score',
        description: 'Return excellent, pass, or retry based on a numeric score.',
        language: 'python',
        starterCode: 'def grade_score(score):\n    pass\n',
        solution: 'def grade_score(score):\n    if score >= 90:\n        return "excellent"\n    if score >= 70:\n        return "pass"\n    return "retry"\n',
        hints: ['Use guard-style if statements', 'Return strings', 'Avoid unnecessary else nesting'],
        difficulty: 'easy',
        validation: { type: 'includes', allOf: ['if ', 'return'] }
      },
      {
        id: 'python-flow-filter',
        title: 'Filter active users',
        description: 'Loop through users and return only active profile dictionaries.',
        language: 'python',
        starterCode: 'def active_users(users):\n    pass\n',
        solution: 'def active_users(users):\n    result = []\n    for user in users:\n        if user.get("is_active"):\n            result.append(user)\n    return result\n',
        hints: ['Create a result list', 'Use a for loop', 'Check the is_active value'],
        difficulty: 'medium',
        validation: { type: 'includes', allOf: ['for ', 'if ', 'return'] }
      },
      {
        id: 'python-flow-streak',
        title: 'Calculate a streak',
        description: 'Count consecutive completed days until the first missed day.',
        language: 'python',
        starterCode: 'def current_streak(days):\n    pass\n',
        solution: 'def current_streak(days):\n    streak = 0\n    for completed in days:\n        if not completed:\n            return streak\n        streak += 1\n    return streak\n',
        hints: ['Stop on the first false value', 'Increment a counter', 'Return the final count'],
        difficulty: 'medium',
        validation: { type: 'includes', allOf: ['for ', 'if ', 'return'] }
      }
    ],
    prerequisites: ['python-variables-types'],
    estimatedTime: 3
  },
  {
    id: 'python-functions',
    title: 'Python Functions',
    description: 'Design focused functions with clear inputs, outputs, and reviewable boundaries.',
    content: `# Functions

## Theory
Functions are the smallest architectural boundary in Python. A useful function has one reason to change, accepts explicit inputs, and returns a predictable output.

## Engineering checklist
- Name functions with verbs.
- Keep parameters intentional.
- Return values instead of mutating hidden state.
- Compose small helpers into larger behavior.`,
    showcaseCode: `def calculate_average_score(task_scores: list[int]) -> float:
    if not task_scores:
        return 0.0
    return round(sum(task_scores) / len(task_scores), 2)

def can_unlock_next(task_scores: list[int]) -> bool:
    return calculate_average_score(task_scores) >= 4.0`,
    vscodePath: 'C:/Users/Hp/Desktop/project/practice/lesson_3_tasks.py',
    exercises: [
      {
        id: 'python-functions-average',
        title: 'Average task score',
        description: 'Create a function that returns the rounded average from a list of scores.',
        language: 'python',
        starterCode: 'def average_score(scores):\n    pass\n',
        solution: 'def average_score(scores):\n    if not scores:\n        return 0\n    return round(sum(scores) / len(scores), 2)\n',
        hints: ['Handle empty lists', 'Use sum and len', 'Return a rounded number'],
        difficulty: 'easy',
        validation: { type: 'includes', allOf: ['def ', 'return', 'sum'] }
      },
      {
        id: 'python-functions-unlock',
        title: 'Unlock decision',
        description: 'Use an average score helper to decide if the next lesson unlocks.',
        language: 'python',
        starterCode: 'def can_unlock(scores):\n    pass\n',
        solution: 'def can_unlock(scores):\n    if not scores:\n        return False\n    return sum(scores) / len(scores) >= 4\n',
        hints: ['Return a boolean', 'Compare the average with 4', 'Handle empty input'],
        difficulty: 'medium',
        validation: { type: 'includes', allOf: ['def ', 'return', '>= 4'] }
      },
      {
        id: 'python-functions-report',
        title: 'Build a review report',
        description: 'Return a dictionary with average score, task count, and progression status.',
        language: 'python',
        starterCode: 'def review_report(scores):\n    pass\n',
        solution: 'def review_report(scores):\n    average = round(sum(scores) / len(scores), 2) if scores else 0\n    return {"average": average, "tasks": len(scores), "can_progress": average >= 4}\n',
        hints: ['Calculate the average once', 'Return a dictionary', 'Include can_progress'],
        difficulty: 'hard',
        validation: { type: 'includes', allOf: ['def ', 'return', 'can_progress'] }
      }
    ],
    prerequisites: ['python-control-flow'],
    estimatedTime: 4
  }
]
