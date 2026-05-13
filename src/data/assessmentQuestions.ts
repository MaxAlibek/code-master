import { AssessmentQuestion } from '../types'

export const assessmentQuestions: AssessmentQuestion[] = [
  // Programming Fundamentals
  {
    id: '1',
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyper Transfer Markup Language',
      'Home Tool Markup Language'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'fundamentals'
  },
  {
    id: '2',
    question: 'Which of the following is NOT a JavaScript data type?',
    options: [
      'undefined',
      'number',
      'boolean',
      'array'
    ],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'javascript'
  },
  {
    id: '3',
    question: 'What is the purpose of CSS?',
    options: [
      'To structure web content',
      'To add interactivity to web pages',
      'To style and layout web pages',
      'To store data in the browser'
    ],
    correctAnswer: 2,
    difficulty: 'easy',
    category: 'css'
  },
  
  // Intermediate Questions
  {
    id: '4',
    question: 'What is the output of: console.log(typeof [])?',
    options: [
      'array',
      'object',
      'undefined',
      'null'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    category: 'javascript'
  },
  {
    id: '5',
    question: 'Which CSS property is used to create space between elements?',
    options: [
      'padding',
      'margin',
      'spacing',
      'gap'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    category: 'css'
  },
  {
    id: '6',
    question: 'What does API stand for?',
    options: [
      'Application Programming Interface',
      'Advanced Programming Instruction',
      'Automated Program Interaction',
      'Application Process Integration'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: 'fundamentals'
  },
  
  // Advanced Questions
  {
    id: '7',
    question: 'What is a closure in JavaScript?',
    options: [
      'A function that has access to its outer function scope',
      'A way to close a web page',
      'A method to terminate a program',
      'A type of loop in JavaScript'
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: 'javascript'
  },
  {
    id: '8',
    question: 'What is the difference between == and === in JavaScript?',
    options: [
      '== compares values, === compares values and types',
      '=== compares values, == compares values and types',
      'They are identical',
      '== is for numbers, === is for strings'
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: 'javascript'
  },
  {
    id: '9',
    question: 'What is the purpose of the virtual DOM in React?',
    options: [
      'To improve performance by minimizing direct DOM manipulation',
      'To create virtual reality applications',
      'To store data temporarily',
      'To handle form validation'
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: 'react'
  },
  
  // Framework-specific Questions
  {
    id: '10',
    question: 'Which hook is used to perform side effects in React?',
    options: [
      'useState',
      'useEffect',
      'useContext',
      'useReducer'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    category: 'react'
  },
  {
    id: '11',
    question: 'What is JSX?',
    options: [
      'JavaScript XML',
      'Java Syntax Extension',
      'JavaScript Extension',
      'Java XML'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: 'react'
  },
  {
    id: '12',
    question: 'Which method is used to update state in React?',
    options: [
      'this.setState()',
      'this.updateState()',
      'this.modifyState()',
      'this.changeState()'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'react'
  },
  
  // Backend Questions
  {
    id: '13',
    question: 'What is Node.js?',
    options: [
      'A JavaScript runtime built on Chrome\'s V8 engine',
      'A frontend framework',
      'A database management system',
      'A CSS preprocessor'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'nodejs'
  },
  {
    id: '14',
    question: 'What does REST stand for?',
    options: [
      'Representational State Transfer',
      'Remote Execution State Transfer',
      'Resource State Transfer',
      'Rapid Execution System Transfer'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: 'backend'
  },
  {
    id: '15',
    question: 'Which HTTP method is used to create resources?',
    options: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    category: 'backend'
  },
  
  // Database Questions
  {
    id: '16',
    question: 'What is SQL?',
    options: [
      'Structured Query Language',
      'Simple Question Language',
      'System Query Logic',
      'Structured Question Logic'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'database'
  },
  {
    id: '17',
    question: 'What is the difference between SQL and NoSQL databases?',
    options: [
      'SQL is relational, NoSQL is non-relational',
      'NoSQL is relational, SQL is non-relational',
      'They are the same',
      'SQL is for small data, NoSQL for big data'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: 'database'
  },
  {
    id: '18',
    question: 'What is database normalization?',
    options: [
      'The process of organizing data to reduce redundancy',
      'The process of backing up data',
      'The process of encrypting data',
      'The process of deleting old data'
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: 'database'
  },
  
  // Advanced Concepts
  {
    id: '19',
    question: 'What is a promise in JavaScript?',
    options: [
      'An object representing the eventual completion of an asynchronous operation',
      'A function that returns immediately',
      'A type of variable',
      'A way to handle synchronous operations'
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: 'javascript'
  },
  {
    id: '20',
    question: 'What is the event loop in JavaScript?',
    options: [
      'A mechanism that handles asynchronous operations',
      'A type of for loop',
      'A way to handle events in the DOM',
      'A debugging tool'
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: 'javascript'
  }
]