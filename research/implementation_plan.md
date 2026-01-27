# Implementation Plan - Design System & Dashboard

## Goal
Transform the generic template into the "Neuro-Adaptive GMAT/GRE Prep Platform" by implementing the specific Brand Identity (colors, fonts) and the Key "Low-Friction" Dashboard.

## Proposed Changes

### Design System (Vanilla CSS with Variables)
We will use CSS Variables to define the "Calm Focus" palette and design tokens.

#### [MODIFY] [index.html](file:///Users/luli/Documents/apps/note app/index.html)
-   Add Google Fonts links for:
    -   `Inter` (Headers)
    -   `Atkinson Hyperlegible` (Body)
    -   `JetBrains Mono` (Data/Code)

#### [MODIFY] [index.css](file:///Users/luli/Documents/apps/note app/src/index.css)
-   Define CSS Variables in `:root`:
    -   `--color-primary`: `#2C3E50` (Deep Slate Blue)
    -   `--color-secondary`: `#829B89` (Sage Green)
    -   `--color-accent`: `#FFBF00` (Soft Amber)
    -   `--color-bg-default`: `#F9F7F2` (Off-White)
    -   `--color-surface`: `#FFFFFF`
    -   `--font-heading`: `'Inter', sans-serif`
    -   `--font-body`: `'Atkinson Hyperlegible', sans-serif`
    -   `--font-mono`: `'JetBrains Mono', monospace`
-   Apply global resets and accessibility defaults (reduced motion).

### Dashboard Component

#### [NEW] [Dashboard.tsx](file:///Users/luli/Documents/apps/note app/src/pages/Dashboard.tsx)
*(Or modify existing if present)*
-   Implement the "Low-Friction" layout.
-   **Hero Section**:
    -   Greeting (e.g., "Ready to focus, Alex?")
    -   **One-Click Start Button**: Distinct visual style using `--color-accent`.
-   **Progress Section**:
    -   "Growth Rings" visual (using SVG or CSS radial gradients).

## Verification Plan

### Manual Verification
-   Check `index.html` loads fonts correctly.
-   Verify CSS variables are active in browser dev tools.
-   Visually check the Dashboard page matches the "Calm Focus" aesthetic (Off-white bg, Deep Slate Blue text).
-   Verify accessibility:
    -   Contrast ratios (Deep Slate Blue on Off-White is > 4.5:1).
    -   Tab navigation focus rings.
