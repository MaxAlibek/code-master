UI/UX Design System & Specification (Premium EdTech)
1. Core Visual Identity (iOS/Apple Aesthetic)
Design Principle: High-density whitespace, organic motion, and "physical" depth.

Color Palette:

--c-bg: #F5F5F7 (Off-white iOS background)

--c-card: #FFFFFF (Solid white for standard components)

--c-glass: rgba(255, 255, 255, 0.7) with backdrop-filter: blur(20px)

--c-primary: #007AFF (Apple Blue) or #000000 (Premium Dark)

--c-accent: #34C759 (Success Green)

Geometry:

Container Radius: 24px

Standard Card Radius: 16px

Button/Tag Radius: 999px (Pill shape)

2. Typography & Grid
Font: Inter or SF Pro Display (Sans-serif).

Scale: Base 8px grid system. All margins/paddings MUST be multiples of 8 (e.g., 8, 16, 24, 32, 48, 64).

Heading Style: Bold, tracking -0.02em, tight line-height (1.1).

3. Component Specifications
Cards:

background: var(--c-card)

border: 1px solid rgba(0,0,0,0.05)

shadow: 0 10px 20px rgba(0,0,0,0.04) (Subtle elevation)

Buttons (.landing-btn):

padding: 14px 28px

transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

Badges/Tags (.landing-badge):

padding: 3px 10px

hover: border-color: var(--c-accent)

4. 3D & Animation Guidelines (The "Expensive" Look)
Animation Engine: Framer Motion.

Transition Type: Spring physics (stiffness: 260, damping: 20). No "linear" easing.

3D Integration: Use Spline-like depth. Objects should float with a slow Y-axis bobbing effect.

Scroll Behavior: Use "Reveal on Scroll" for all cards with a y: 20 offset and opacity: 0 initial state.

5. Implementation Rules for IDE (Senior Prompt)
Rule 1: Always check design.md before generating CSS/Tailwind classes.

Rule 2: Use Tailwind Arbitrary Values only if the 8px grid doesn't fit.

Rule 3: Maintain "Engineering-First" tone in code comments. No fluff.

Rule 4: Prioritize performance. Use CSS will-change for 3D/Transform heavy elements.