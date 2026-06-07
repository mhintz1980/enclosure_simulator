# UI Improvements Implementation Plan

## Project Context
- **Stack**: React 19 + TypeScript + Vite + Tailwind CSS
- **Current State**: Single `App.tsx` (574 lines) with all logic inline
- **Goal**: Modularize components, add charts/visualization, improve interactions, responsive layout, unit toggle, design system

---

## Phase 1: Component Split (Immediate - High Priority)

### 1.1 Create Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Card.tsx              # Reusable card wrapper
│   │   ├── Input.tsx             # Styled input with label
│   │   ├── Slider.tsx            # Styled range slider
│   │   ├── Select.tsx            # Styled select dropdown
│   │   ├── Collapsible.tsx       # Expandable help sections
│   │   ├── StatusBadge.tsx       # OPTIMAL/WARNING/CRITICAL badge
│   │   └── Tooltip.tsx           # Hover tooltip wrapper
│   ├── panels/
│   │   ├── ParameterPanel.tsx    # Core parameters (heat, airflow, temp, optimization)
│   │   ├── DuctConfigPanel.tsx   # Intake/Discharge config (reusable for both)
│   │   ├── DiagnosticsPanel.tsx  # System live diagnostics
│   │   ├── ChatPanel.tsx         # AI Co-Pilot chat
│   │   └── RoadblockSolver.tsx   # Collapsible roadblock section
│   ├── charts/
│   │   ├── AttenuationChart.tsx  # Octave band attenuation curves
│   │   ├── PressureDropChart.tsx # Pressure drop vs duct height
│   │   ├── VelocityChart.tsx     # Face/interstitial velocity trends
│   │   └── DuctCrossSection.tsx  # Visual duct geometry
│   └── layout/
│       ├── Header.tsx            # Top header with status
│       ├── Sidebar.tsx           # Left parameter panel (collapsible on mobile)
│       └── MainContent.tsx       # Right content area
├── hooks/
│   ├── useCalculations.ts        # Extracted calculation logic
│   ├── useChat.ts                # Chat state management
│   ├── useUnitSystem.ts          # Unit toggle (SI/Imperial)
│   └── useLocalStorage.ts        # Persist preferences
├── utils/
│   ├── calculations.ts           # Pure calculation functions
│   ├── units.ts                  # Unit conversion utilities
│   └── formatters.ts             # Number formatting
├── types/
│   ├── index.ts                  # Existing types.ts content
│   └── ui.ts                     # New UI-specific types
└── App.tsx                       # Simplified root component
```

### 1.2 Extract Calculation Logic
- Move `designMetrics` useMemo to `useCalculations` hook
- Move `calculateDuctMetrics` to `utils/calculations.ts`
- Keep silencer profiles in `utils/constants.ts`

### 1.3 Refactor App.tsx
- Import and compose panels
- Manage global state (chat, roadblock, help)
- Pass calculated metrics as props

---

## Phase 2: Charts & Visualization (Immediate - High Priority)

### 2.1 Add Dependencies
```bash
npm install recharts
npm install -D @types/recharts
```

### 2.2 Chart Components
| Chart | Data Source | Purpose |
|-------|-------------|---------|
| `AttenuationChart` | `selectedProfile.octaveAttenuation` | Show dB reduction per octave band (63Hz-8kHz) |
| `PressureDropChart` | Sweep duct heights | Curve showing ΔP vs height for current profile |
| `VelocityChart` | Face/interstitial velocities | Bar chart with risk thresholds (10/15 m/s lines) |
| `DuctCrossSection` | Baffle thickness, airway width | SVG visual of silencer geometry |

### 2.3 Integration
- Add charts to `DiagnosticsPanel` as tabs or accordion
- Show intake/discharge comparison side-by-side
- Real-time updates on parameter change

---

## Phase 3: Interaction Improvements (Immediate - Medium Priority)

### 3.1 Keyboard Shortcuts
- `Cmd/Ctrl + K` → Command palette (search actions)
- `Arrow Up/Down` on focused slider → Increment/decrement
- `Enter` on number input → Confirm
- `Escape` → Close modals/collapsibles

### 3.2 Drag-to-Adjust Inputs
- Click + drag horizontally on number inputs
- Sensitivity: 0.1 per 10px drag
- Visual feedback during drag

### 3.3 Parameter Presets
```typescript
// src/utils/presets.ts
export const PRESETS = {
  'Small Generator': { heatLoad: 50, combustionAirflow: 5, targetEnclosureTemp: 45 },
  'Industrial': { heatLoad: 200, combustionAirflow: 20, targetEnclosureTemp: 42 },
  'Data Center': { heatLoad: 350, combustionAirflow: 35, targetEnclosureTemp: 38 },
  'Custom': null
}
```
- Dropdown in ParameterPanel
- "Save as Preset" option

### 3.4 Undo/Redo
- Use `useReducer` with history stack (max 50 states)
- Toolbar buttons + `Cmd/Ctrl+Z` / `Cmd/Ctrl+Shift+Z`

---

## Phase 4: Responsive Layout (Immediate - Medium Priority)

### 4.1 Breakpoint Strategy
```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### 4.2 Layout Changes
| Screen | Layout |
|--------|--------|
| `< md` | Stacked: Header → Sidebar (collapsible) → Main |
| `md - lg` | Sidebar (w-80) + Main (flex-1) |
| `> lg` | Current 12-col grid (xl:col-span-4/8) |

### 4.3 Mobile Sidebar
- Hamburger menu in header
- Slide-over panel with `fixed inset-y-0 left-0 z-50 w-80`
- Backdrop overlay on open

---

## Phase 5: Unit Toggle - SI/Imperial (Immediate - High Priority)

### 5.1 Unit System Hook
```typescript
// src/hooks/useUnitSystem.ts
type UnitSystem = 'SI' | 'Imperial';

interface UnitConfig {
  system: UnitSystem;
  units: {
    heatLoad: { SI: 'kW', Imperial: 'BTU/hr' };
    airflow: { SI: 'm³/s', Imperial: 'CFM' };
    temperature: { SI: '°C', Imperial: '°F' };
    pressure: { SI: 'Pa', Imperial: 'inH₂O' };
    velocity: { SI: 'm/s', Imperial: 'ft/min' };
    length: { SI: 'm', Imperial: 'ft' };
    area: { SI: 'm²', Imperial: 'ft²' };
  };
}
```

### 5.2 Conversion Utilities
```typescript
// src/utils/units.ts
const CONVERSIONS = {
  kW_to_BTUhr: 3412.14,
  m3s_to_CFM: 2118.88,
  C_to_F: (c: number) => c * 9/5 + 32,
  Pa_to_inH2O: 0.00401463,
  mps_to_fpm: 196.85,
  m_to_ft: 3.28084,
  m2_to_ft2: 10.7639,
};
```

### 5.3 UI Integration
- Toggle in header (next to status badge)
- Persist to localStorage
- All inputs display in selected unit
- Internal calculations remain in SI
- Convert on input/output only

---

## Phase 6: Design System (Immediate - Medium Priority)

### 6.1 Tailwind Config Enhancement
```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
          sky: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7' },
          rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
          emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
        },
        surface: {
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
```

### 6.2 Add Fonts
- Add `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap')` to index.css

### 6.3 Component Standardization
- Consistent padding: `p-4` for cards, `p-2` for compact
- Consistent radius: `rounded-lg` (8px) for cards, `rounded` (4px) for inputs
- Consistent shadows: `shadow-lg` for elevated, none for flat

---

## Later Phase (Deferred)

### Accessibility & UX (Partial)
- [ ] ARIA labels on all interactive elements
- [ ] Focus visible outlines
- [ ] Tooltips with engineering context
- [ ] Loading skeletons for AI responses
- [ ] Error boundaries

### Advanced Features
- [ ] Export/Import configuration (JSON)
- [ ] PDF Report Generation
- [ ] Comparison Mode (side-by-side variants)
- [ ] Fan Curve Overlay

### State Management
- [ ] Web Worker for calculations
- [ ] Zustand for global state
- [ ] localStorage persistence

---

## Implementation Order

1. **Phase 1** - Component split (foundational)
2. **Phase 6** - Design system (enables consistent styling)
3. **Phase 5** - Unit toggle (affects all inputs)
4. **Phase 2** - Charts (new components)
5. **Phase 3** - Interactions (enhance existing)
6. **Phase 4** - Responsive (layout adjustments)

---

## Testing Strategy
- Run `npm run build` after each phase
- Manual test on mobile/tablet/desktop
- Verify calculations unchanged after refactor
- Check unit conversions accuracy

---

## Dependencies to Add
```json
{
  "dependencies": {
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/recharts": "^2.12.0"
  }
}
```