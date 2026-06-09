# Issues Improvements

This document tracks proposed improvements to GitHub issues for better definition and clarity.

## Reviewed Issues

### #46 - Add demo data for completed appointments

**Current Title:** Dati demo appuntamenti conclusi

**Proposed Title:** Add demo data for completed appointments

**Proposed Description:**
```
## Problem
The demo data currently lacks examples of completed appointments, 
making it difficult to test the UI/features related to concluded appointments.

## What needs to be done
- Add a set of demo appointments marked as "completed" or "concluded"
- Ensure they display properly in the calendar and list views
- Include various completion scenarios (on-time, late, cancelled, etc.)
```

---

### #45 - Add structured parser for appointment entry (ICS-compatible format)

**Current Title:** Parser senza ai per inserimento appuntamenti

**Proposed Title:** Add structured parser for appointment entry (ICS-compatible format)

**Proposed Description:**
```
## Problem
Currently, appointment entry relies on AI parsing. We need a deterministic parser 
that can handle structured appointment data without AI processing, allowing users 
to import/save appointments reliably.

## What needs to be done
- Define a structured field order for appointment data (aligned with ICS format)
- Create a mechanical parser that reads this structured format
- This allows appointments to be saved/imported without requiring AI processing
- Parser should handle standard appointment fields in consistent order (matching ICS object structure)

## Benefits
- Faster, deterministic appointment import/export
- No AI token consumption
- Users can manually prepare appointment data in known format
```

---

### #44 - Remove or clean up 4-week navigation limit code

**Current Title:** Visualizzazione calendario non limita a +/- 4 settimane

**Proposed Title:** Remove or clean up 4-week navigation limit code

**Proposed Description:**
```
## Problem
The calendar was designed with a ±4 week navigation limit, but this feature 
was never properly tested or removed. The boundary may still exist in the codebase 
as residual code, and the UI text references this outdated limitation.

## What needs to be done
- Verify if the 4-week boundary code is still present in the codebase
- Remove any residual code related to the ±4 week limit
- Update calendar header text to remove the "±4 weeks" reference
- Test that calendar navigation works freely without boundaries
```

---

### #43 - Display month indicator on day cards in calendar

**Current Title:** Inserire mese nella visualizzazione calendario

**Proposed Title:** Display month indicator on day cards in calendar

**Proposed Description:**
```
## Problem
The day cards in the calendar view don't indicate which month they belong to,
making it confusing when viewing days from adjacent months.

## What needs to be done
- Add month indicator/label to day cards
- Make it visible but not obtrusive
- Ensure clarity when days from different months are displayed together
```

---

### #42 - Implement appointment editing functionality

**Current Title:** Modifica appuntamenti

**Proposed Title:** Implement appointment editing functionality

**Proposed Description:**
```
## Problem
Users currently cannot modify existing appointments after creation.
We need to implement a complete edit workflow for appointments.

## What needs to be done
- Create an edit dialog/form for existing appointments
- Allow modification of appointment details (date, time, location, notes, etc.)
- Save changes back to the database/storage
- Provide clear feedback on successful edits
```

---

### #41 - Replace structured debriefing form with freeform text entry

**Current Title:** Debriefing troppo strutturato

**Proposed Title:** Replace structured debriefing form with freeform text entry

**Proposed Description:**
```
## Problem
The debriefing form is overly structured and rigid, constraining how users can 
capture their notes and observations.

## What needs to be done
- Replace the structured form with a single freeform text entry field
- Allow users to write debriefing notes naturally without form constraints
- AI can structure the freeform text as needed in the future

## Benefits
- Faster, more natural note-taking during debriefing
- Flexibility for users to capture information in their preferred format
```

---

### #40 - Remove quick filter/text search from today (oggi) view

**Current Title:** Filtro rapido e ricerca testuale

**Proposed Title:** Remove quick filter/text search from today (oggi) view

**Proposed Description:**
```
## Problem
The quick filter and text search feature was implemented in the today (oggi) view,
but it doesn't make sense in this context. The feature is more useful in the 
summary view where users browse multiple appointments.

## What needs to be done
- Remove the quick filter/text search functionality from the today (oggi) tab
- Keep the feature in the summary/calendar views where it's useful
```

---

### #39 - Replace journey start settings with lightweight location-based planning cards

**Current Title:** Impostazioni inizio viaggio occupano molto spazio visivo

**Proposed Title:** Replace journey start settings with lightweight location-based planning cards

**Proposed Description:**
```
## Problem
The journey start settings take up significant visual space and are redundant 
with app settings. This complexity is rarely needed for the core planning mission.

## Solution
Replace verbose journey start settings with lightweight organizational cards for 
location context (e.g., departure points like "hotel", "office"). These cards 
are **planning aids only** and support core route optimization.

## What needs to be done
- Remove the verbose journey start settings UI
- Create lightweight organizational cards (departure locations) that:
  - Display contextual metadata (address, booking reference)
  - Have distinct visual style (color) for quick identification
  - Integrate with route calculation (affect first/last leg logic)
  - Are excluded from exports and visit counters (organizational metadata only)

## Benefits
- Cleaner UI with less visual clutter
- Better support for "Pianificazione Giornaliera Ottimizzata" (optimized daily planning)
- Flexible handling of rare edge cases (multi-base operations, hotel departures)
- Stays within mission boundaries (planning aids only, no CRM/inventory scope)
```

---

## Next Steps

- Review these proposed improvements in GitHub issues
- Post comments with the suggested changes for discussion
- Update issue titles and descriptions accordingly
- Continue with remaining issues (#38, #37, etc.)
