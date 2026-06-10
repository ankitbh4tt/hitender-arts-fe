# hitender-arts-fe - Mobile App (Handoff)

> React Native + Expo (SDK, managed) + TypeScript. The native studio app for tattoo-studio staff.
> Portrait-locked, light theme, black + gold premium design. Talks to the same backend (`hitender-arts-bd`) as the web.
> Last work: **2026-06-10** - an in-progress accessibility / motion / responsiveness polish pass (see "RESUME HERE").

---

## What this repo is

A staff-facing tattoo-studio app. Navigation = bottom tabs (`src/navigation/CRMTabs.tsx`): **Today** (DayCalendar), **Clients** (list + detail), **Follow-Ups**, **Settings**. Plus form/flow screens: QuickAddAppointment, ScheduleAppointment, RescheduleAppointment, Inquiry, MobileNumberEntry.

- **State:** Zustand (`src/config/store.ts` for config, `src/config/settingsStore.ts` for studio settings + WhatsApp templates).
- **API:** axios client (`src/api/client.ts`) -> the Express backend; functions in `src/api/*.api.ts`. Errors surface via a global toast interceptor.
- **Design system:** `src/constants/theme.ts` (responsive scaling, black+gold palette, `STATUS_VISUALS`, `SHADOWS`, `ANIM` motion tokens, `HIT_SLOP`). Component library in `src/components/`.
- **Animations:** RN built-in `Animated` only (no heavy libs) - all use `useNativeDriver` so they run off the JS thread. `PressableScale` (spring press), `FadeInView` (staggered entrance), animated `SegmentedControl`.

### Run
```bash
cd hitender-arts-fe
npm install
npm start                # Expo
npx tsc --noEmit         # type check (CURRENTLY CLEAN)
npx expo export          # bundle check (see "remaining")
```
`.env`: `EXPO_PUBLIC_API_URL` (e.g. `http://10.0.2.2:4000` for Android emulator), `EXPO_PUBLIC_APP_API_KEY` (must match backend `APP_API_KEY`).

---

## Quality assessment (honest, as of today)

**Solid:** animations are native-driven and smooth; lightweight (no heavy deps -> EAS build stays fast); responsive scaling system with tablet clamp + `maxContentWidth`; safe-area + keyboard handling in containers; portrait-locked so scaling never goes stale.

**Was the big gap (being fixed today):** accessibility was nearly absent (only 3 components had any a11y props). The work below is closing that. **Not yet device-QA'd** on real hardware/emulator.

---

## What was done today (2026-06-10) - premium polish pass (IN PROGRESS)

Goal: make it a "perfect SaaS mobile app" - smooth, accessible, works on every device. Applied the design principles from the installed skills (motion timing, reduce-motion, full a11y) - those skills are web-oriented, so the RN equivalent (Animated + accessibility props) was used.

### DONE
**Foundation**
- NEW `src/hooks/useReducedMotion.ts` - tracks the OS "Reduce Motion" setting (live).
- `FadeInView` + `FAB` + `SegmentedControl` slider now **respect reduce-motion** (appear/move instantly when enabled).
- `Typography` - was `allowFontScaling={false}` (a real a11y bug); now **allows OS font scaling capped at 1.3x** (`maxFontSizeMultiplier`), and auto-sets `accessibilityRole="header"` for display/h1/h2/h3.
- `FAB` `accessibilityLabel` is now a **required prop** (it's icon-only) - so every FAB must describe itself.

**Components - accessibility added** (`src/components/`)
- `Button` (label defaults to title, hint, `accessibilityState {disabled, busy}`), `Card` (button role + label/hint when pressable), `Input` (label association + error -> hint), `SegmentedControl` (tab role + selected state per segment), `SearchableSelect` (trigger role/label/value/hint, Close label, search-field label, option role + selected), `Header` (back button "Go back"), `DateTimePicker` (trigger role/label/value/hint).

**Screens - accessibility added** (`src/screens/`)
- `DayCalendar` - FULLY done: FAB, prev/next day steppers, client-press, WhatsApp btn, Complete btn, More btn, "Today" pill, payment-method radios (role + selected).
- `ClientsList` - client Card label + FAB label.
- `FollowUpsList` - client-press, "Send Reminder" WhatsApp btn, "Mark Done" btn.
- `ClientDetail` - the reusable `QuickAction` / `SheetOption` / `DetailRow` helpers (covers Call/WhatsApp/Schedule/Inquiry actions + the action sheet), back button, edit (pencil) button, FAB.

State left clean: **`npx tsc --noEmit` passes.**

---

## ⏯️ RESUME HERE - what's LEFT on the mobile polish pass

Ordered by priority. None of this is currently broken (tsc is green); this is remaining polish.

### 1. Finish ClientDetail accessibility (MEDIUM) - `src/screens/ClientDetail.tsx`
- **Modal close buttons** (Edit modal ~line 492, Gender modal ~line 510): icon-only `<TouchableOpacity>` with an X `Ionicons` - add `accessibilityRole="button" accessibilityLabel="Close"`. (Highest of these - icon-only = no SR text.)
- Appointment action buttons (~454-457: Complete/Reschedule/No Show/Cancel) - they have visible text so SR reads them, but add `accessibilityRole="button"` + `accessibilityState={{ disabled }}`. (LOW)
- Gender option rows (~512) - add role + `accessibilityState={{ selected }}`. Complete-modal payment buttons (~550) - same. (LOW)

### 2. Form screens (LOW-MEDIUM) - QuickAddAppointment, ScheduleAppointment, RescheduleAppointment, Inquiry, Settings
These are built mostly from the shared `Button` / `Input` / `DateTimePicker` / `SearchableSelect` components, which are NOW accessible - so they are **largely covered already**. Do a quick scan in each for any RAW `TouchableOpacity` / `PressableScale` with an icon and no text (e.g. **duration preset chips**, **payment-method chips**, "Clear Form" icons) and add `accessibilityRole="button"` + `accessibilityLabel` (+ `accessibilityState.selected` for chips).

### 3. MobileNumberEntry (LOW) - `src/screens/MobileNumberEntry.tsx`
Not reviewed yet. Quick pass: ensure the phone input has a label and the verify button is labeled (it likely uses the shared `Button`/`Input`, so probably already fine - just confirm).

### 4. Verify the build (REQUIRED before calling it done)
```bash
npx tsc --noEmit          # confirm still clean
npx expo export           # confirm it still BUNDLES (no native deps were added, so it should)
```
The original premium redesign was confirmed to `expo export` successfully; re-confirm after these edits.

### 5. Optional premium upgrades (NOT done - decide if wanted)
- **Skeleton loaders** instead of the centered `ActivityIndicator` on list screens (DayCalendar, ClientsList, FollowUpsList) for a higher-end loading feel.
- **Haptics** (`expo-haptics`) on key actions (complete, mark done). Deliberately skipped to keep the EAS build dependency-free - adding it is a native module, test the build after.
- A reduce-motion check on any remaining bespoke `Animated` usage (e.g. ClientDetail's collapsing header at the top of the file uses `Animated` scroll interpolation - that's scroll-driven so it's fine, but worth a glance).

---

## Other notes

- Photos: the **web** app has full Cloudinary photo upload UI; the **mobile** app does NOT yet (schema/API support both `referencePhotoUrl`/`completedPhotoUrl`). Adding an `expo-image-picker` + upload flow here is a future item (would add a native dep - test the build).
- The shared backend currently has **45 demo clients seeded** (flagged `[DEMO]`). If you run the app against it you'll see lots of data; rollback script is in `../hitender-arts-bd/README-HANDOFF.md`.
- All em/en dashes were replaced with hyphens today (owner preference) - keep using plain `-`.

See `../WEB-PLATFORM.md` and the sibling `README-HANDOFF.md` files for the backend + web context.
