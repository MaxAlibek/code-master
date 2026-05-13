const fs = require('fs');
let content = fs.readFileSync('src/i18n.ts', 'utf8');

const enPlan = `,
    learningPlan: { title: 'Learning Plan', pathLabel: 'Path', done: 'Done', totalModules: 'Total modules', hoursEstimate: 'Hours (estimate)', level: 'Level', modulesTitle: 'Modules', hours: 'h', aiScore: 'AI score', requires: 'Requires', btnDone: 'Done', btnLocked: 'Locked', btnStart: 'Start', ruleHint: '4/5 Rule: first get average AI-score \u2265 4.0 in lesson {{lessons}}', changePath: '\u2190 Change path', dashboard: 'Dashboard \u2192' }`;

const ruPlan = `,
    learningPlan: { title: '\u041F\u043B\u0430\u043D \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F', pathLabel: '\u041F\u0443\u0442\u044C', done: '\u0413\u043E\u0442\u043E\u0432\u043E', totalModules: '\u0412\u0441\u0435\u0433\u043E \u043C\u043E\u0434\u0443\u043B\u0435\u0439', hoursEstimate: '\u0427\u0430\u0441\u043E\u0432 (\u043E\u0446\u0435\u043D\u043A\u0430)', level: '\u0423\u0440\u043E\u0432\u0435\u043D\u044C', modulesTitle: '\u041C\u043E\u0434\u0443\u043B\u0438', hours: '\u0447', aiScore: 'AI score', requires: '\u041D\u0443\u0436\u043D\u043E', btnDone: '\u0413\u043E\u0442\u043E\u0432\u043E', btnLocked: '\u0417\u0430\u043A\u0440\u044B\u0442\u043E', btnStart: '\u041D\u0430\u0447\u0430\u0442\u044C', ruleHint: '4/5 Rule: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u043E\u043B\u0443\u0447\u0438 \u0441\u0440\u0435\u0434\u043D\u0438\u0439 AI-score \u2265 4.0 \u0432 \u0443\u0440\u043E\u043A\u0435 {{lessons}}', changePath: '\u2190 \u0421\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0443\u0442\u044C', dashboard: 'Dashboard \u2192' }`;

const uzPlan = `,
    learningPlan: { title: 'O\u02BBquv rejasi', pathLabel: 'Yo\u02BBl', done: 'Tayyor', totalModules: 'Jami modullar', hoursEstimate: 'Soat (taxmin)', level: 'Daraja', modulesTitle: 'Modullar', hours: 'soat', aiScore: 'AI score', requires: 'Kerak', btnDone: 'Tayyor', btnLocked: 'Yopiq', btnStart: 'Boshlash', ruleHint: '4/5 qoidasi: avval {{lessons}} darsida o\u02BBrtacha AI-score \u2265 4.0 oling', changePath: '\u2190 Yo\u02BBlni almashtirish', dashboard: 'Dashboard \u2192' }`;

// EN: insert before the assessment key
content = content.replace(
  /,\n    assessment: \{ title: 'Knowledge Assessment'/,
  enPlan + `,\n    assessment: { title: 'Knowledge Assessment'`
);

// RU: insert before the RU assessment key
content = content.replace(
  /,\n    assessment: \{ title: '\u041E\u0446\u0435\u043D\u043A\u0430 \u0437\u043D\u0430\u043D\u0438\u0439'/,
  ruPlan + `,\n    assessment: { title: '\u041E\u0446\u0435\u043D\u043A\u0430 \u0437\u043D\u0430\u043D\u0438\u0439'`
);

// UZ: insert before the UZ assessment key
content = content.replace(
  /,\n    assessment: \{ title: 'Bilimlarni baholash'/,
  uzPlan + `,\n    assessment: { title: 'Bilimlarni baholash'`
);

fs.writeFileSync('src/i18n.ts', content, 'utf8');
console.log('OK: patched learningPlan keys');
