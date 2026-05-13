# CodeMaster Gradient Design Guidelines

## 1. Концепция
- Градиент: линейный переход от `#FFFFFF` к `#FF8C42` (опционально `#FF6B35`).
- Направление по умолчанию: слева-направо (`90deg`).
- Анимация: мягкий сдвиг `background-position` с `transition-duration: 3s` и `animation: 8s`.
- Fallback: сначала задаётся `background-color: #FFFFFF`, затем префиксные и стандартные `linear-gradient`.

## 2. Цветовые спецификации

### Основные цвета
- `#FFFFFF`
  - RGB: `255, 255, 255`
  - HSL: `0, 0%, 100%`
  - CMYK: `0, 0, 0, 0`
- `#FF8C42`
  - RGB: `255, 140, 66`
  - HSL: `24, 100%, 63%`
  - CMYK: `0, 45, 74, 0`
- `#FF6B35`
  - RGB: `255, 107, 53`
  - HSL: `16, 100%, 60%`
  - CMYK: `0, 58, 79, 0`
- `#111111` (основной текст)
  - RGB: `17, 17, 17`
  - HSL: `0, 0%, 7%`
  - CMYK: `0, 0, 0, 93`

## 3. Контраст и доступность (WCAG 2.1)
- Основной текст на градиенте: `#111111`.
- Вторичный текст: `#2A2A2A`.
- Контраст проверять минимум как `AAA` для обычного текста (цель: `>= 7:1`).
- Кнопки должны иметь явное состояние `:focus-visible` (контур минимум 3px).
- Для пользователей с `prefers-reduced-motion: reduce` отключать анимацию градиента.

## 4. Типографика
- Базовый стек: `Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif`.
- H1:
  - Вес: `800`
  - Размер: `clamp(32px, 5vw, 56px)`
  - Межстрочный: `1.1`
- Body Large:
  - Вес: `500`
  - Размер: `clamp(16px, 2.3vw, 20px)`
  - Межстрочный: `1.6`
- Body Base:
  - Вес: `400`
  - Размер: `16px`
  - Межстрочный: `1.6`

## 5. Grid-сетка (12 колонок)
- Desktop (`>= 1280px`):
  - Колонки: `12`
  - Gutter: `24px`
  - Margin: `24px`
- Tablet (`768px - 1279px`):
  - Колонки: `12`
  - Gutter: `16px`
  - Margin: `16px`
- Mobile (`320px - 767px`):
  - Колонки: `4`
  - Gutter: `12px`
  - Margin: `12px`

## 6. Анимация и тени
- Рекомендуемая анимация:
  - `transition: background-position 3s ease`
  - `animation: landingGradientShift 8s ease-in-out infinite alternate`
- Box shadow:
  - Карточки: `0 14px 40px rgba(17,17,17,0.16)`
  - Вторичные блоки: `0 8px 24px rgba(17,17,17,0.12)`

## 7. Кросс-браузерность
- Обязательно задавать:
  - `background: #FFFFFF;`
  - `background: -webkit-linear-gradient(...);`
  - `background: -moz-linear-gradient(...);`
  - `background: linear-gradient(...);`
- Тестировать в:
  - Chrome (актуальный)
  - Firefox (актуальный)
  - Safari (актуальный)
  - Edge (актуальный)

## 8. Production checklist
- Проверить контраст текста на 5 контрольных точках градиента.
- Проверить responsive в диапазоне `320px → 1920px`.
- Проверить производительность анимации (FPS, CPU) на средних мобильных устройствах.
- Проверить состояния hover/focus/active/disabled.
- Включить visual regression snapshots для ключевых брейкпоинтов.

## 9. Файлы в проекте
- CSS: `src/styles/landing-gradient.css`
- SCSS: `src/styles/landing-gradient.scss`
- Figma tokens: `design/figma/tokens.json`
- Sketch tokens: `design/sketch/tokens.json`
