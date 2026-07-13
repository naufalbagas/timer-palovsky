# Project Context: Palovsky (React + TypeScript + Vite)

This document provides a comprehensive overview of the Palovsky project structure and guidelines for agents modifying the codebase.

---

## Workspace Structure

```
.
├── .agents/                    # Workspace-level agent rules and skills
│   └── AGENTS.md               # Custom rules for AI agents
├── .clauderules                # Workspace-level rules for Claude AI
├── public/                     # Static assets
└── src/                        # Main application source code
    ├── assets/                 # SVGs and images (e.g., logo.svg)
    ├── components/             # Reusable UI Components
    │   ├── Button/             # Reusable Button components
    │   │   ├── Navigation/
    │   │   │   ├── NavigationButton.tsx
    │   │   │   └── NavigationButton.css
    │   │   └── Solid/
    │   │       ├── SolidButton.tsx
    │   │       └── SolidButton.css
    │   ├── Sidebar/            # Collapsible Sidebar navigation
    │   │   ├── Sidebar.tsx     # Sidebar component (Logo, NavLinks, ThemeToggle, SupportButton)
    │   │   └── Sidebar.css     # Sidebar layout, minimized state, button styles
    │   └── Toggle/             # Reusable Toggle component
    │       ├── Toggle.tsx
    │       └── Toggle.css
    ├── features/               # Feature-based modular components
    │   ├── scramble/           # Scramble Simulator and Visualizer
    │   │   ├── scramble.ts     # Minimal flat-array Rubik's Cube Simulator & Generator
    │   │   ├── ScrambleImage.tsx # 2D net render component
    │   │   └── ScrambleImage.css # 3D border system and grid styling
    │   └── storage/            # Internal localStorage persistence layer
    │       └── storage.ts      # Solve & session CRUD + stats computation (AO5, AO12, avgAll, best, worst)
    ├── pages/                  # Page route components
    │   ├── Home/               # Dashboard home page components & styles
    │   │   ├── Home.tsx        # Dashboard home page logic
    │   │   └── styles/
    │   │       └── Home.css    # Dashboard home page styling
    │   ├── Community.tsx       # Community hub placeholder page
    │   └── Timer/              # Rubik's Cube Speedcubing Timer page/logic
    │       ├── Timer.tsx       # Speedcubing Timer page component
    │       └── styles/         # Stylings split by component cards
    │           ├── Timer.css   # Main layout, modal, dropdown styles
    │           ├── ClockCard.css
    │           ├── OverviewCard.css
    │           └── SessionsCard.css
    ├── App.tsx                 # Main layout routing, state, and dashboard grid
    ├── App.css                 # Global layout styles & background decorations
    ├── index.css               # Design tokens (CSS custom properties), resets, typography
    └── main.tsx                # App entry point
```

---

## Core Components & Architecture

### 1. Unified Navigation Bar
- **Location**: `src/components/Navbar/Navbar.tsx`
- **Subcomponents**: Consists of `Logo`, `NavLinks`, `SupportButton`, `ThemeToggle`, and `HamburgerMenu` defined inside a single TSX file.
- **Styling**: Uses separate stylesheets located under `Navbar/styles/`.
- **Centering**: The `.desktop-nav` (navlinks) is configured as a direct child of the `.header-container` flexbox to be centered horizontally.

### 2. Speedcubing Timer & Simulator
- **Location**: `src/pages/Timer/Timer.tsx`
- **Logic**: Integrates spacebar timer holding, inspection toggles, and session stats logging. Leverages `src/features/scramble/scramble.ts` for robust move generation.
- **Visuals**: Uses `src/features/scramble/ScrambleImage.tsx` to render a 2D net of the generated scramble with a 3D border system.
- **Styling**: Broken down into specific CSS cards under `pages/Timer/styles/` to prevent styling conflicts and ensure modularity.

### 3. Page Components & Routing
- **Location**: `src/pages/`
- **Architecture**: Contains separate files/folders for each main route (`Home`, `Community`, `Timer`).
- **Routing**: `App.tsx` maps the active navbar page name to its page component dynamically using a lookup mapping without page router library overhead.

---

## Context Update Rules
This file is the single source of truth for the project structure. Any agent modifying the codebase must strictly adhere to updating this file.
