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

#### [NEW] [DashboardPage.tsx](file:///Users/luli/Documents/apps/note app/src/pages/DashboardPage.tsx)
*(Refactor existing)*
-   Implement the "Low-Friction" layout.
-   **Hero Section**:
    -   Greeting (e.g., "Ready to focus, Alex?")
    -   **One-Click Start Button**: Distinct visual style using `--color-accent`.
-   **Progress Section**:
    -   "Growth Rings" visual (using SVG or CSS radial gradients).

## Phase 2: Intelligence Features (From Learngraph/Sankofa)
*To be implemented after Design System & Dashboard.*

### Audio Study Mode (ElevenLabs)
-   **Port Logic**: Adapt `app/api/audio/route.ts` from Sankofa to a Supabase Edge Function (or client-side service if local).
-   **UI Component**: Create `AudioPlayer.tsx` with speed controls (0.5x - 2.5x) for Neuro-Adaptive learning.

### Mindmap Visualization
-   **Library**: Install `reactflow` and `elkjs` (graph layout).
-   **Component**: Adapt `MindMap.tsx` from Sankofa to visualize note connections.

### Web Scraping (Hyperbrowser/Firecrawl)
-   **Service**: Use user's preferred scraping tool (Hyperbrowser key if available, or alternative).
-   **Integration**: Create a "Research" tab in the dashboard to ingest URLs.

## Verification Plan

### Manual Verification
-   Check `index.html` loads fonts correctly.
-   Verify CSS variables are active in browser dev tools.
-   Visually check the Dashboard page matches the "Calm Focus" aesthetic (Off-white bg, Deep Slate Blue text).
-   Verify accessibility:
    -   Contrast ratios (Deep Slate Blue on Off-White is > 4.5:1).
    -   Tab navigation focus rings.

## Phase 5: Editor Intelligence (AFFiNE-like Features)
*Enhancing manual note taking with AI.*

### AI Copilot Sidebar
-   **Component**: `EditorAISidebar.tsx`
-   **Integration**: Resides inside `DocumentEditorPage.tsx`.
-   **Capabilities**:
    -   **Context Awareness**: Reads the current BlockSuite doc content.
    -   **Actions**: "Summarize Note", "Fix Grammar", "Continue Writing".
    -   **Insertion**: Button to "Insert at Cursor" (appending to doc).

### Editor Enhancements
-   **Layout**: Full-width "Scree-like" mode (Distraction Free).
-   **Slash Commands**: Verify basic slash menu functionality.

