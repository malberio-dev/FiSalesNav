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

## Next Steps

- Review these proposed improvements in GitHub issues
- Post comments with the suggested changes for discussion
- Update issue titles and descriptions accordingly
- Continue with remaining issues (#42, #41, #40, etc.)
