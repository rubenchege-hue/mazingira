# AGENTS.md — Mazingira ESG Platform

## Project Overview

**Mazingira** is a static ESG (Environmental, Social, Governance) and Green Finance reporting platform for Nairobi organizations. It provides interactive dashboards, emissions calculators, and gap analysis across GRI, TCFD, SASB, SDGs, and Green Bond/Loan frameworks.

**Project name origin**: "Mazingira" means "environment" in Swahili.

## Architecture

### File Structure
```
.
├── index.html                          # Landing page with animated globe
├── landing.html                        # Brand entry page
├── dashboard.js                        # Core application logic
├── animations.js                       # Shared animation utilities
├── animations.css                      # Shared animation styles
├── esg_reporting_platform_nairobi.html # Main dashboard
├── esg_emissions_calculator.html       # Scope 1/2/3 calculator
├── esg_ai_gap_analyser.html            # AI gap analysis
├── esg_gap_analyser_green_finance.html # Green finance framework analysis
└── mazingira-esg.html                  # Additional ESG page
```

### Technology Stack
- **Pure HTML/CSS/JavaScript** - No build tools, frameworks, or dependencies
- **ES6+ JavaScript** - Modern syntax, no transpilation required
- **Tabler Icons** - CDN-loaded icon library (v2.44.0)
- **Google Fonts** - Inter font family (weights 200-900)
- **Chart.js** - Loaded via CDN for bar/line charts (checked via `typeof Chart === 'undefined'`)
- **localStorage** - All persistence (no backend)

## Essential Commands

### Running the Application
No build step required. Open any HTML file directly in a browser:
```bash
# Option 1: Direct file open
open index.html

# Option 2: Local server (recommended for AJAX/fetch testing)
npx serve .
# or
python -m http.server 8080
```

### Testing
- Manual testing only - open HTML files in browser
- No automated test suite exists
- Check localStorage after interactions for data persistence

## Code Patterns & Conventions

### JavaScript Style
- **File naming**: `snake_case.js` (e.g., `dashboard.js`, `animations.js`)
- **Function naming**: `camelCase` (e.g., `animateCounter`, `showToast`)
- **Variable scope**: Function-scoped with `var` (legacy style, consistent throughout)
- **DOM selection**: `document.getElementById()`, `document.querySelector()`
- **Event handling**: Direct assignment, no delegation patterns

### CSS Architecture
- **File naming**: `animations.css` (shared module)
- **Custom properties**: Extensive use of CSS variables (`:root`)
- **BEM-like classes**: `.card`, `.metric-val`, `.prog-fill`
- **Utility-first**: Animation utility classes (`.animate-fadeIn`, `.d1` through `.d10`)

### HTML Structure
- **Semantic classes**: `.sr-only` for accessibility
- **Data attributes**: `data-animated="true"` for state tracking
- **Inline styles**: Acceptable for dynamic values (colors, widths)
- **SVG icons**: Inline SVG for score rings and charts

## Application Architecture

### Data Flow
```
User Interaction → localStorage (esg_form_data / esg_settings / esg_yearly_data) → UI Update
```

### Key Functions (dashboard.js)

| Function | Purpose |
|----------|---------|
| `updateDeadline()` | Countdown to Dec 31 reporting deadline |
| `showToast(msg, type)` | Global notifications (success/error/warn) |
| `animatePanel(id)` | Reveal panel children with stagger |
| `toggleCheck(el)` | Toggle checkbox state with visual feedback |
| `selectInstrument(el, type)` | Instrument selection (investment tools) |
| `saveAllFormData()` | Persist all form state to localStorage |
| `loadSavedData()` | Restore form state on page load |
| `saveSettings()` / `loadSettings()` | Company settings persistence |
| `scheduleAutoSave()` | 400ms debounce before saving |

### State Management
Three localStorage keys:
- `esg_form_data` - Current form values
- `esg_settings` - Company info (name, ticker, sector, year, etc.)
- `esg_yearly_data` - Year-by-year snapshots for trend analysis

### Animation System (animations.js)
- `animateCounter(el, target, duration)` - Number counting animation
- `initRevealObserver()` - Intersection Observer for scroll-triggered reveals
- Ripple effect on button clicks via event delegation

## ESG Framework Coverage

### Standards Implemented
1. **GRI (Global Reporting Initiative)** - 82% coverage
2. **TCFD (Task Force on Climate-related Financial Disclosures)** - 71% coverage
3. **SASB (Sustainability Accounting Standards Board)** - 65% coverage
4. **SDGs (Sustainable Development Goals)** - 53% coverage
5. **Green Finance** (ICMA GBP/GLP + CMA Kenya Taxonomy) - 48% coverage

### Gap Severity Levels
- **Critical** (red): Blocks report sign-off
- **Moderate** (amber): Reduces ESG score materially
- **Minor** (blue): Good-practice additions

## Non-Obvious Patterns

### Form Persistence
- All form data saves automatically 400ms after last input
- Yearly snapshots enable historical comparison
- Settings persist separately from form data

### Animation Utility Classes
- `.reveal` + `.show` for scroll-triggered animations
- `.d1` through `.d10` for stagger delays (80ms intervals)
- `.animate-*` classes for immediate animations

### Color System
Dark theme uses `--green-900` (#0D4A35) as primary background
Light theme uses `--surface` (#F7F5F0) for content areas
Semantic colors: `--green-500` (success), `--amber-500` (warning), `--red-500` (error)

### Instrument Selection Pattern
Clicking an `.instrument-card` adds `.selected` class
Only one can be selected at a time (exclusive selection)
Triggers both save and recalc

## Gotchas

1. **No build process**: Changes save directly; refresh to see updates
2. **localStorage keys**: Three separate keys; clearing one doesn't clear all
3. **Year pills**: Dynamically rendered from `esg_yearly_data`; requires `renderYearPills()` call
4. **Counter suffix**: Automatically detects `%` from existing text
5. **Ripple effect**: Requires `--rx` and `--ry` CSS variables set via inline styles
6. **Tabler Icons**: Loaded from CDN; offline viewing may show missing icons

## File-Specific Notes

### index.html / landing.html
- Heavy on CSS animations (globe rotation, tree sway, ambient glow)
- Uses canvas for starfield background (`#stars-canvas`)
- Animation timing: 25s globe rotation, 6s ambient pulse

### esg_reporting_platform_nairobi.html
- Full dashboard with sidebar navigation
- Uses Tabler Icons for nav items
- Dark theme sidebar ( `--green-900` background )

### esg_emissions_calculator.html
- Scope 1/2/3 emissions calculation interface
- Sidebar layout with fixed position elements
- Green/amber/red color coding for KPIs

### dashboard.js (full file)
- `recalc()` function - **must be implemented per page** for calculations
- `getCurrentYear()` returns year from `#s-year` dropdown
- `seedDefaultYearlyData()` auto-seeds 2020-2024 with sample ESG data
- Chart initialization: `getOrCreateChart()`, `initCharts()` - lazy-loads Chart.js
- Chart instances stored in `chartInstances` object for reuse

## Adding New Features

1. **New page**: Copy existing HTML, update content, link from index
2. **New form field**: Add to `saveAllFormData()` selectors if persistence needed
3. **New animation**: Add keyframes to `animations.css`, use `.animate-*` class
4. **New metric**: Follow `.metric` wrapper pattern with `.metric-label`/`.metric-val`

## Accessibility

- `.sr-only` class for screen reader text
- Semantic HTML structure (headings, labels)
- Color contrast: WCAG AA compliant on both themes
- Focus states on interactive elements