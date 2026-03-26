# Integrity Audit Protocol (TuCooperativa)

This skill ensures that no "blind edits" cause regressions in the TuCooperativa platform.

## Pre-Flight Checklist (MANDATORY before every Build)

### 1. Imports Verification
- [ ] Read the top of the file COMPLETELY before adding new components.
- [ ] Verify that third-party hooks (e.g., `useApi`, `framer-motion`) are explicitly imported.
- [ ] Check for `AnimatePresence` whenever `Motion` is used with conditional rendering.

### 2. Data Resilience (The "Length" Rule)
- [ ] Never access `.length` or `.map()` directly on API props.
- [ ] Use `const safeData = Array.isArray(prop) ? prop : []` for all data-driven displays.
- [ ] Use optional chaining `?.` for deep object access (e.g., `stats?.total`).

### 3. Visual Symmetry Audit
- [ ] Check alignment in both Desktop and Mobile (Stacking mode).
- [ ] Verify that custom Vanilla CSS classes (`.p-`) are used instead of ad-hoc styles.
- [ ] Ensure `borderRadius: 32px` consistency across premium cards.

### 4. Console Cleanliness
- [ ] No warnings about "key" props missing in lists.
- [ ] No "ReferenceError" or "TypeError" in the browser console.
