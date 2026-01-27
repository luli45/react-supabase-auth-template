# Project Vision: Neuro-Adaptive GMAT/GRE Prep Platform

Based on the files in the `research` directory, this project aims to build a study platform tailored for neurodivergent high achievers (ADHD/Autistic).

## Core Philosophy
- **"Friction Reduction" & "Cognitive Alignment"**: Moving away from discipline-heavy approaches.
- **"Unmasking" the Exam**: Making content accessible without sensory overwhelm.

## Key Features to Implement
1.  **Audio Study Mode**: Converting dense text into "neuro-adaptive podcasts" (likely using text-to-speech with specific pacing).
2.  **Low-Friction Dashboard**:
    -   "One-Click Start" button (Soft Amber).
    -   "Growth Rings" for progress (avoiding linear pressure).
3.  **High-Signal Content**: Scraper/Filter to remove fluff from study materials (Reddit/Web).
4.  **Sensory-Friendly UI**:
    -   **Colors**: Deep Slate Blue (`#2C3E50`), Sage Green (`#829B89`), Soft Amber (`#FFBF00`), Off-White (`#F9F7F2`).
    -   **Typography**: *Atkinson Hyperlegible* (Body), *Inter* (Headings), *JetBrains Mono* (Data).
    -   **Accessibility**: Reduced motion, high contrast.

## Current Codebase Status
-   **Template**: `react-supabase-auth-template` (Vite, React, Supabase).
-   **Existing capabilities**: Authentication, Protected Routes, BlockSuite (Rich Text).
-   **Gap**: The current UI and features generally do not yet reflect the "Neuro-Adaptive" specific requirements (colors, audio mode, specific dashboard layout).

## Next Steps Proposal
Transfrom the current generic template into the "Neuro-Adaptive" platform:
1.  **Design System Update**: Implement the `index.css` with the specific color palette and fonts.
2.  **Dashboard Refactor**: Create the "Low-Friction" dashboard with "One-Click Start".
3.  **Audio Player**: Implement the "Audio Study Mode" interface (mockup level or functional if APIs available).
