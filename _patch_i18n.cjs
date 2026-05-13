const fs = require('fs');
let content = fs.readFileSync('src/i18n.ts', 'utf8');

// Add assessment keys to EN section (after lesson key block)
const enAssessment = `,
    assessment: { title: 'Knowledge Assessment', questionOf: 'Question {{current}} of {{total}}', timeLeft: 'Time left', difficulty: 'Difficulty', category: 'Category', back: 'Back', next: 'Next', finish: 'Finish', completed: 'Test Completed', completedSub: 'We assessed your level and picked a starting point.', correctAnswers: 'Correct answers', level: 'Level', recommendations: 'Recommendations', strengths: 'Strengths', improve: 'Areas to improve', goToLearning: 'Go to learning', levels: { senior: 'Senior', mid: 'Mid', junior: 'Junior' }, descriptions: { senior: 'Advanced level', mid: 'Solid foundation', junior: 'Starting level' }, recs: { senior: 'Start with advanced topics and real projects.', mid: 'Strengthen your knowledge with practice and move to harder tasks.', junior: 'Start with the basics and practice regularly.' }, strengthItems: { goodBase: 'Good knowledge base', logicOk: 'Decent logical thinking', readyToLearn: 'Ready to learn' }, improveItems: { advanced: 'Advanced topics', basics: 'Fundamentals', morePractice: 'More practice' } }`;

const ruAssessment = `,
    assessment: { title: '\u041E\u0446\u0435\u043D\u043A\u0430 \u0437\u043D\u0430\u043D\u0438\u0439', questionOf: '\u0412\u043E\u043F\u0440\u043E\u0441 {{current}} \u0438\u0437 {{total}}', timeLeft: '\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0432\u0440\u0435\u043C\u0435\u043D\u0438', difficulty: '\u0421\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C', category: '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F', back: '\u041D\u0430\u0437\u0430\u0434', next: '\u0414\u0430\u043B\u0435\u0435', finish: '\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C', completed: '\u0422\u0435\u0441\u0442 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D', completedSub: '\u041C\u044B \u043E\u0446\u0435\u043D\u0438\u043B\u0438 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0438 \u043F\u043E\u0434\u043E\u0431\u0440\u0430\u043B\u0438 \u0441\u0442\u0430\u0440\u0442.', correctAnswers: '\u0412\u0435\u0440\u043D\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432', level: '\u0423\u0440\u043E\u0432\u0435\u043D\u044C', recommendations: '\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438', strengths: '\u0421\u0438\u043B\u044C\u043D\u044B\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B', improve: '\u0427\u0442\u043E \u043F\u043E\u0434\u0442\u044F\u043D\u0443\u0442\u044C', goToLearning: '\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044E', levels: { senior: 'Senior', mid: 'Mid', junior: 'Junior' }, descriptions: { senior: '\u041F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C', mid: '\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u0430\u044F \u0431\u0430\u0437\u0430', junior: '\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C' }, recs: { senior: '\u041D\u0430\u0447\u043D\u0438 \u0441 \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u0445 \u0442\u0435\u043C \u0438 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432.', mid: '\u0417\u0430\u043A\u0440\u0435\u043F\u0438 \u0437\u043D\u0430\u043D\u0438\u044F \u043D\u0430 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0435 \u0438 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0438 \u043A \u0431\u043E\u043B\u0435\u0435 \u0441\u043B\u043E\u0436\u043D\u044B\u043C \u0437\u0430\u0434\u0430\u043D\u0438\u044F\u043C.', junior: '\u041D\u0430\u0447\u043D\u0438 \u0441 \u043E\u0441\u043D\u043E\u0432 \u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u0439\u0441\u044F.' }, strengthItems: { goodBase: '\u0425\u043E\u0440\u043E\u0448\u0430\u044F \u0431\u0430\u0437\u0430', logicOk: '\u041D\u0435\u043F\u043B\u043E\u0445\u043E\u0435 \u043F\u043E\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u043B\u043E\u0433\u0438\u043A\u0438', readyToLearn: '\u0413\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u044C \u0443\u0447\u0438\u0442\u044C\u0441\u044F' }, improveItems: { advanced: '\u041F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u0435 \u0442\u0435\u043C\u044B', basics: '\u041E\u0441\u043D\u043E\u0432\u044B', morePractice: '\u0411\u043E\u043B\u044C\u0448\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438' } }`;

const uzAssessment = `,
    assessment: { title: 'Bilimlarni baholash', questionOf: 'Savol {{current}} / {{total}}', timeLeft: 'Qolgan vaqt', difficulty: 'Qiyinlik', category: 'Kategoriya', back: 'Orqaga', next: 'Keyingi', finish: 'Tugatish', completed: 'Test tugadi', completedSub: 'Biz darajangizni baholadik va boshlang\u02BBich nuqtani tanladik.', correctAnswers: 'To\u02BBg\u02BBri javoblar', level: 'Daraja', recommendations: 'Tavsiyalar', strengths: 'Kuchli tomonlar', improve: 'Yaxshilash kerak', goToLearning: 'O\u02BBqishga o\u02BBtish', levels: { senior: 'Senior', mid: 'Mid', junior: 'Junior' }, descriptions: { senior: 'Yuqori daraja', mid: 'Ishonchli asos', junior: 'Boshlang\u02BBich daraja' }, recs: { senior: 'Murakkab mavzular va real loyihalardan boshlang.', mid: 'Bilimlarni amaliyotda mustahkamlang va murakkabroq topshiriqlarga o\u02BBting.', junior: 'Asoslardan boshlang va muntazam mashq qiling.' }, strengthItems: { goodBase: 'Yaxshi bilim bazasi', logicOk: 'Mantiqiy tafakkur yaxshi', readyToLearn: 'O\u02BBrganishga tayyor' }, improveItems: { advanced: 'Murakkab mavzular', basics: 'Asoslar', morePractice: 'Ko\u02BBproq amaliyot' } }`;

// Insert assessment after lesson in EN section
content = content.replace(
  /(\s*lesson:\s*\{[^}]*paraTipText:[^}]*\}[^}]*\}\s*)\n(\s*\} \})/,
  (match, lessonBlock, closing) => {
    // This regex is too complex. Let's use a simpler approach.
    return match;
  }
);

// Simpler: insert before the closing of each translation section
// EN: find `paraTip: 'PARA tip', paraTipText: 'Promote reusable...verification.' }` then after that add assessment
content = content.replace(
  "paraTipText: 'Promote reusable patterns from Projects into Resources after verification.' }\n  } }",
  "paraTipText: 'Promote reusable patterns from Projects into Resources after verification.' }" + enAssessment + "\n  } }"
);

// RU: find the RU paraTipText closing
content = content.replace(
  /paraTipText: '.*Projects \u0432 Resources\.'\s*\}\n(\s*\} \},\n\s*uz:)/,
  (match, after) => {
    const base = match.replace(after, '');
    return base.trim() + ruAssessment + "\n  } },\n  uz:";
  }
);

// UZ: find the UZ paraTipText closing  
content = content.replace(
  /paraTipText: 'Tekshiruvdan keyin.*Resources\u02BBga o\u02BBtkazing\.'\s*\}\n(\s*\} \}\n\} as const)/,
  (match, after) => {
    const base = match.replace(after, '');
    return base.trim() + uzAssessment + "\n  } }\n} as const";
  }
);

fs.writeFileSync('src/i18n.ts', content, 'utf8');
console.log('OK: patched assessment keys into i18n.ts');
