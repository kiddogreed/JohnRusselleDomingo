# John Russelle Domingo — Developer Portfolio

> **Live site:** [kiddogreed.github.io/JohnRusselleDomingo](https://kiddogreed.github.io/JohnRusselleDomingo/)  
> **Repository:** [github.com/kiddogreed/JohnRusselleDomingo](https://github.com/kiddogreed/JohnRusselleDomingo)

A modern, single-page developer portfolio built with vanilla **HTML5 / CSS3 / JavaScript** — no frameworks, no build step. Designed to showcase projects, skills, and personality while staying lightweight enough to run entirely from GitHub Pages.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
   - [Space Impact Mini Game](#space-impact-mini-game)
   - [Dark / Light Mode](#dark--light-mode)
   - [RGB Particle Effect on Hover](#rgb-particle-effect-on-hover)
   - [Auto-Shuffling Profile Photo](#auto-shuffling-profile-photo)
   - [GitHub Repository Showcase](#github-repository-showcase)
### Space Impact Mini Game

At the very top of the site, visitors are greeted with a fully playable **Space Impact-inspired mini game** built in vanilla JavaScript and Canvas. This game is a fun, interactive showcase of both coding and design skills.

**Game features:**
- Classic side-scrolling shooter gameplay (move, shoot, dodge)
- Multiple enemy waves and a boss fight every level
- Boss changes shape (rectangle → glowing circle) at level 2+
- Level cycling: after defeating the boss, the game gets harder
- Keyboard controls (arrow keys/WASD + space to shoot)
- Game over auto-scrolls to your profile

**Cosmic background details:**
- Animated parallax starfield
- Solar system: sun, orbiting earth, and multiple planets
- Animated asteroid belt
- Milky Way band (soft, subtle)
- Swirling black hole (top right)
- All background elements have reduced opacity for depth

**Files involved:** `index.html` (section at top), `style.css` (game area styles), `script.js` (all game logic and rendering)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Sections](#sections)
6. [Showcased Repositories](#showcased-repositories)
7. [Skills Covered](#skills-covered)
8. [Local Development](#local-development)
9. [Deployment (GitHub Pages)](#deployment-github-pages)
10. [Ideas & Roadmap](#ideas--roadmap)

---

## Project Overview

This portfolio was built to present John Russelle Domingo — Software Engineer at WSI Metro Bank, Makati, Philippines — as a complete professional profile in a single scrollable page. The goal was to:

- Pull in real GitHub project data and present it visually
- Add interactive, eye-catching effects without relying on heavy libraries
- Support both dark and light themes with smooth transitions
- Be fully responsive across desktop and mobile

---

## Features

### Dark / Light Mode

**How it works:**
- A toggle button in the navigation bar switches between dark mode (default) and light mode.
- The active preference is saved to `localStorage` and restored on the next visit.
- If no saved preference exists, the browser's system preference (`prefers-color-scheme`) is respected.
- All colors are driven by **CSS custom properties** (`--c-bg`, `--c-cyan`, `--c-text`, etc.) defined in `:root` for dark and overridden inside `body.light` for light.
- The canvas particle network **smoothly interpolates** its color between the two themes using a per-frame lerp function (see [RGB Particle Effect](#rgb-particle-effect-on-hover)), so there is no jarring instant color jump.

**Theme palettes:**

| Token | Dark Mode | Light Mode |
|---|---|---|
| `--c-bg` | `#0a192f` (deep navy) | `#f0f4f8` (soft off-white) |
| `--c-surface` | `#112240` | `#ffffff` |
| `--c-cyan` | `#64ffda` (teal) | `#0077cc` (blue) |
| `--c-text` | `#ccd6f6` | `#1a202c` |
| `--c-muted` | `#8892b0` | `#4a5568` |

**Files involved:** `style.css` (`:root`, `body.light`), `script.js` (`initTheme()`)

---

### RGB Particle Effect on Hover

The hero section background is a **live Canvas particle network** — floating dots connected by lines that react to the mouse cursor.

**Normal behavior (both modes):**
- Dots drift slowly across the canvas, bouncing off edges.
- Nearby dots are connected with semi-transparent lines.
- Moving the mouse over the canvas draws additional lines from nearby particles to the cursor.

**RGB rainbow effect (dark mode only, triggered by mouse hover):**
- When the user hovers in dark mode, every particle, connecting line, and mouse-spoke changes from the default teal colour to a **cycling HSL rainbow**.
- The hue advances 1.4° per animation frame, so the whole canvas slowly rotates through the full colour wheel.
- Each dot gets a slight hue offset based on its `(x, y)` position, creating a scattered, flowing rainbow look instead of a single flat colour.
- Each line between particles and each mouse-spoke gets an independent hue offset based on its index, producing a burst-of-colour effect around the cursor.
- When the mouse leaves the canvas, the hue stops advancing and the particle colours remain wherever they were (they do not reset back to teal until the next hover).

**Smooth theme transition:**
- Two target colour objects (`THEME_DARK`, `THEME_LIGHT`) define the RGB values and opacity levels for each theme.
- A `cur` object holds the current interpolated values.
- Every animation frame, `lerpColors()` moves `cur` 4% closer to the active target (`t = 0.04`), producing a ~1.5 s smooth crossfade when the toggle is clicked.

**Files involved:** `script.js` (`initCanvas()`, `Particle.prototype.draw()`, `drawLines()`, `lerpColors()`, `loop()`)

---

### Auto-Shuffling Profile Photo

The **About** section displays a 3D flip card that automatically alternates between two photos every **5 seconds**:

| Face | Image | Label |
|---|---|---|
| Front (default) | `1000065235.png` — personal photo (man in suit) | 📸 Personal |
| Back | GitHub avatar (`avatars.githubusercontent.com`) | 👤 GitHub |

**Implementation:**
- CSS `transform-style: preserve-3d` and `backface-visibility: hidden` create genuine 3D perspective depth.
- A `transition: transform 0.85s cubic-bezier(0.4, 0.0, 0.2, 1)` produces a smooth, weighted flip.
- A JavaScript `setInterval` fires every 5000 ms, toggling the `is-flipped` class on the flipper element and updating the badge label below the photo.
- There is no hover trigger — the flip is entirely time-driven, so it works on touch/mobile too.

**Files involved:** `index.html` (`.photo-flipper`, `.photo-face--front/back`, `#photoBadge`), `style.css` (`.photo-wrapper`, `.photo-flipper`, `.photo-face--back`, `is-flipped`), `script.js` (`initPhotoFlip()`)

---

### GitHub Repository Showcase

Seven project cards are displayed in a responsive CSS grid in the **Projects** section. Each card shows:

- Project name and short description
- Live demo link and source code link (where available)
- Technology tag pills (e.g., `Java`, `Flutter`, `Spring Boot`)

All projects are pulled from the real GitHub account **kiddogreed** and represent pinned or notable repositories.

See [Showcased Repositories](#showcased-repositories) for the full list.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic sections) |
| Styling | CSS3 — custom properties, Grid, Flexbox, 3D transforms |
| Scripting | Vanilla JavaScript (ES6+, no dependencies) |
| Graphics | Canvas API (particle network, mouse interaction) |
| Icons | Font Awesome 6.5.0 (CDN) |
| Fonts | Google Fonts — Inter (body), Fira Code (monospace accents) |
| Hosting | GitHub Pages (main branch, `/root`) |

---


## Project Structure

```
JohnRusselleDomingo/
├── index.html        # Single-page markup — all sections (includes Space Impact game section at top)
├── style.css         # All styles, theming, animations, responsive rules (includes game area)
├── script.js         # All interactivity — theme, canvas, typing, nav, reveal, and all game logic
├── 1000065235.png    # Personal photo (used on front face of flip card)
└── README.md         # This file
```

---

## Sections

| # | Section | Description |
|---|---|---|
| 1 | **Hero** | Full-viewport intro with Canvas particle background, name, animated subtitle (typing effect), and CTA buttons |
| 2 | **About** | Two-column layout — auto-flipping photo card + bio summary with quick-stat pills |
| 3 | **Skills** | Categorised skill bars: Languages, Frameworks, Mobile, AI/ML, Databases, DevOps |
| 4 | **Projects** | 3-column responsive card grid with live + source links |
| 5 | **Contact** | Social link cards — Email, GitHub, LinkedIn, Twitter |

---

## Showcased Repositories

| Project | Description | Stack |
|---|---|---|
| **ADC Knowledge Base** | Internal knowledge management system | Java, Spring Boot, MySQL |
| **P3 Program Generator** | Desktop program schedule generator | Java, JavaFX, SQLite |
| **Dating App** | Full-stack social matching app | TypeScript, React, Node.js |
| **BundyClock** | Employee time-in/out system | Java, Spring Boot, Angular |
| **JRRD Wallet** | Personal finance tracker | Java, Spring Boot, Vue.js |
| **ProgramGeneratorMobile** | Mobile port of P3 — Flutter Android app, offline-capable with PDF export (v1.1.0+3) | Flutter, Dart, SQLite |
| **Spring Boot Blog REST API** | RESTful blog backend with full CRUD | Java, Spring Boot, H2 |

---

## Skills Covered

**Languages:** Java · TypeScript · C# · SQL · Dart · PHP · Python · Node.js  
**Frameworks:** Spring Boot · Angular · React · Vue.js · .NET · AdonisJs  
**Mobile:** Flutter · Dart · Android · SQLite  
**AI/ML:** TensorFlow · Python · scikit-learn · Pandas  
**Databases:** MySQL · Snowflake · PostgreSQL · MongoDB · Redis  
**DevOps & Tools:** Docker · Kubernetes · GitHub Actions · AWS · n8n · jBPM · Postman  

---

## Local Development

No build step required. Open the project in any static file server.

**Option A — VS Code Live Server:**
```bash
# Install the "Live Server" extension, then right-click index.html → Open with Live Server
```

**Option B — Python:**
```bash
cd c:/projects/2026/JohnRusselleDomingo
python -m http.server 8080
# Open http://localhost:8080
```

**Option C — Node http-server:**
```bash
npx http-server . -p 8080
# Open http://localhost:8080
```

---

## Deployment (GitHub Pages)

The site is deployed automatically from the `main` branch root:

1. Push changes to `main`
2. GitHub Pages rebuilds within ~30 seconds
3. Live at `https://kiddogreed.github.io/JohnRusselleDomingo/`

**Settings path:** GitHub repo → Settings → Pages → Source: Deploy from branch `main` / `/ (root)`

---

## Ideas & Roadmap

The following ideas have been discussed or planned for future development:

### Implemented ✅
- [x] Dark / Light mode toggle with `localStorage` persistence
- [x] Canvas particle network — interactive mouse-follow lines
- [x] RGB rainbow particle effect when hovering in dark mode
- [x] Smooth lerp colour crossfade when toggling themes
- [x] 3D flip card — personal photo ↔ GitHub avatar, auto-swap every 5 s
- [x] Typing animation in hero subtitle cycling through roles
- [x] Scroll reveal animations (IntersectionObserver)
- [x] Animated skill bars triggered on scroll
- [x] Scroll spy — highlights active section in nav
- [x] Mobile hamburger nav
- [x] All pinned GitHub repos showcased as project cards
- [x] ProgramGeneratorMobile repo card + Flutter/Dart skills added
- [x] LinkedIn, GitHub, Twitter, Email contact cards

### Planned / Ideas 💡
- [ ] **Resume / CV download button** — Add a prominent "Download CV" button in the hero or about section linking to a hosted PDF
- [ ] **GitHub contribution graph embed** — Embed the GitHub contribution heatmap (using an SVG service or `github-readme-stats`) in the About section
- [ ] **Mobile RGB touch trigger** — Currently the RGB effect only fires on mouse hover; extend it to fire on `touchmove` events so mobile visitors see the effect too
- [ ] **Project filter tabs** — Add filter buttons (All / Frontend / Backend / Mobile / AI) above the projects grid to let visitors narrow down by category
- [ ] **Blog / Articles section** — Pull in latest dev.to or Hashnode articles via their public APIs and display them as cards
- [ ] **Testimonials / Recommendations** — A section displaying short quotes from colleagues or LinkedIn recommendations
- [ ] **Multi-language support (i18n)** — Add a language toggle (English / Filipino) for accessibility and reach
- [ ] **Animated counters** — Count-up numbers in the About section (e.g., "4+ years experience", "10+ projects")
- [ ] **Easter egg mode** — A secret key combination that triggers a full-screen Matrix rain or retro CRT scanline effect over the canvas
- [ ] **Dark mode auto-switch by time** — Automatically switch to dark mode after sunset and light mode after sunrise using the Geolocation API
- [ ] **Repo card live stats** — Show real-time star count, fork count, and last-commit date by calling the GitHub REST API at page load
- [ ] **Custom domain** — Point a personal domain (e.g., `johnrusselle.dev`) to the GitHub Pages site via a CNAME record

---

*Built and designed by John Russelle Domingo — © 2026*

