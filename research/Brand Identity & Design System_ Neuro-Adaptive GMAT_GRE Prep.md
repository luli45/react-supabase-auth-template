# Brand Identity & Design System: Neuro-Adaptive GMAT/GRE Prep

**Prepared by:** The Brand & Design Syndicate (Manus AI)
**Date:** January 21, 2026
**Target Audience:** Alex Chen (Problem Aware Avatar) – Neurodivergent High Achievers

---

## 1. Brand Strategy: The "Unmasked" Narrative

### 1.1 Brand Positioning
The brand positions itself as the **"Neuro-Adaptive Bridge"** between the rigid, neurotypical demands of standardized testing and the unique cognitive architecture of ADHD and Autistic learners. Unlike traditional prep companies that focus on "discipline" and "repetition," we focus on **"Friction Reduction"** and **"Cognitive Alignment."**

### 1.2 Brand Voice & Tone
The voice is that of a **"Knowledgeable Peer"**—someone who understands the "Wall of Awful" and the "ADHD Tax" because they’ve lived it. It is empathetic, non-judgmental, and intellectually stimulating without being overwhelming.

| Dimension | Brand Tone Description |
| :--- | :--- |
| **Authority** | Expert but accessible; avoids academic "fluff" and dry, authoritative lecturing. |
| **Empathy** | Deeply understands executive dysfunction; validates the struggle without being patronizing. |
| **Clarity** | High signal-to-noise ratio; uses direct, punchy language to maintain focus. |
| **Energy** | Calm and grounding; avoids high-pressure "hustle culture" marketing. |

### 1.3 The Core Narrative
> "Your brain isn't broken; the test is just built for a different operating system. We don't ask you to change your brain to fit the test. We change the test content to fit your brain."

---

## 2. Visual Identity: Sensory-Friendly Design

### 2.1 Color Theory (The "Calm Focus" Palette)
The palette is designed to minimize sensory overwhelm while maintaining enough contrast for readability and focus. We avoid high-vibrancy "neon" colors that can trigger sensory sensitivity.

| Role | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary** | Deep Slate Blue | `#2C3E50` | Grounding, professional, high contrast for text. |
| **Secondary** | Sage Green | `#829B89` | Calming, associated with growth and "low-stress" progress. |
| **Accent** | Soft Amber | `#FFBF00` | Used sparingly for "Quick Wins" and important calls to action. |
| **Background** | Off-White / Cream | `#F9F7F2` | Reduces eye strain compared to pure white (#FFFFFF). |
| **Error** | Muted Terracotta | `#C0392B` | Communicates errors without being "alarming" or aggressive. |

### 2.2 Typography
We prioritize **readability** and **scannability**. The choice of typefaces reflects a balance between technical precision and human accessibility.

*   **Headings:** *Inter* (Bold) – A clean, modern sans-serif that is highly legible at various sizes.
*   **Body Text:** *Atkinson Hyperlegible* – Specifically designed to increase character recognition and improve readability for low-vision and neurodivergent readers.
*   **Monospace (for Data/Logic):** *JetBrains Mono* – Used for quantitative reasoning sections to provide clear character distinction (e.g., distinguishing `1`, `l`, and `I`).

---

## 3. UI/UX Component System

### 3.1 The "Low-Friction" Dashboard
The dashboard is designed to prevent "Task Paralysis" by offering a single, clear "Next Step" rather than a cluttered list of options.

*   **The "One-Click Start" Button:** A prominent, soft-amber button that resumes the last session or starts a 15-minute "Micro-Study" block.
*   **Progress Visualization:** Uses "Growth Rings" (similar to Apple Watch) rather than linear bars, which feel less like a "deadline" and more like a cumulative achievement.

### 3.2 Component Accessibility Standards
| Component | Design Requirement | Neuro-Inclusive Benefit |
| :--- | :--- | :--- |
| **Buttons** | Minimum 44x44px touch target; clear tactile/visual feedback on hover/click. | Accommodates motor-control variability and provides sensory confirmation. |
| **Forms** | Inline validation; no "disappearing" labels; clear error descriptions. | Reduces cognitive load and prevents "form anxiety." |
| **Audio Player** | Variable speed control (0.5x to 2.5x); 10s skip back/forward; transcript sync. | Essential for ADHD learners who need to speed up or re-listen to content. |
| **Content Scraper** | Automatic "TL;DR" summaries; key terms highlighted in bold. | Helps with "Signal vs. Noise" filtering for Autistic learners. |

---

## 4. Technical Implementation & Design Tokens

### 4.1 Design Tokens (JSON Structure)
To ensure consistency across web and mobile platforms, we use a centralized token system.

```json
{
  "color": {
    "brand": {
      "primary": "#2C3E50",
      "secondary": "#829B89",
      "accent": "#FFBF00"
    },
    "background": {
      "default": "#F9F7F2",
      "surface": "#FFFFFF"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "typography": {
    "fontFamily": {
      "heading": "Inter, sans-serif",
      "body": "Atkinson Hyperlegible, sans-serif"
    }
  }
}
```

### 4.2 Accessibility Compliance (WCAG 2.1 Level AA)
*   **Contrast Ratios:** All text-to-background ratios must exceed 4.5:1.
*   **Motion Reduction:** The app must respect the `prefers-reduced-motion` media query, disabling non-essential animations for users prone to vestibular issues or distraction.
*   **Focus States:** Highly visible focus rings for keyboard navigation (essential for users who prefer keyboards over mice for tactile reasons).

---

## 5. References & Sources
1. [Atkinson Hyperlegible Font - Braille Institute](https://brailleinstitute.org/freefont) [1]
2. [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/TR/WCAG21/) [2]
3. [Designing for Neurodiversity - Microsoft Design](https://design.microsoft.com/designing-for-neurodiversity/) [3]
4. [The ADHD Tax: The Hidden Cost of Being Neurodivergent](https://www.additudemag.com/adhd-tax-financial-cost-symptoms/) [4]

---

**End of Document**
