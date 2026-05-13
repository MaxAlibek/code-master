import { LearningPath } from '../types'

export const learningPaths: LearningPath[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Master modern frontend technologies including HTML, CSS, JavaScript, and popular frameworks like React, Vue, and Angular',
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'TypeScript'],
    difficulty: 'beginner',
    estimatedDuration: 120,
    icon: 'code',
    deadlineISO: '2026-07-31'
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Learn server-side programming with Node.js, Python, Java, and C#. Build robust APIs and database systems',
    technologies: ['Node.js', 'Python', 'Java', 'C#', 'SQL', 'NoSQL', 'REST APIs'],
    difficulty: 'intermediate',
    estimatedDuration: 150,
    icon: 'server',
    deadlineISO: '2026-08-30'
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    description: 'Create cross-platform and native mobile applications with React Native, Flutter, Swift, and Kotlin',
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
    difficulty: 'intermediate',
    estimatedDuration: 140,
    icon: 'smartphone',
    deadlineISO: '2026-08-15'
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Dive into data analysis, machine learning, and statistical programming with Python, R, and SQL',
    technologies: ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
    difficulty: 'advanced',
    estimatedDuration: 180,
    icon: 'chart',
    deadlineISO: '2026-09-30'
  }
]