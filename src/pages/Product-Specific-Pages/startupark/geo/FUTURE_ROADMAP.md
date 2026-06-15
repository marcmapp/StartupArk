# Geo Search – Future Roadmap

## ✅ IMPLEMENTED
- Option A: Role-aware entity switching
  - User/Student role → searches for nearby startups
  - Startup role → searches for nearby users/clients
  - Same engine, same radar, same API — entity param only difference

---

## 🔵 OPTION B – Market Density Analytics (Planned)
**Target:** Startup users only
**What it does:** Instead of showing individual user cards, shows aggregate
market intelligence for a startup's area.

Display on radar:
  - Total users registered within X km
  - Total students within X km
  - Active events happening nearby
  - Bookings from nearby users this month

Implementation notes:
  - New backend endpoint: GET /api/geo/density?lat=&lng=&radius=
  - Aggregation queries against User, EventAttendees, Bookings collections
  - Frontend: RadarDensityView component (no cards, just stats overlay on radar)
  - Trigger: toggle button on the Nearby page for startup role
  - No new schema changes needed

Effort estimate: 2-3 days backend + 1 day frontend

---

## 🔵 OPTION C – Startup Collaboration Discovery (Planned)
**Target:** Startup users only
**What it does:** Startups find nearby startups in COMPLEMENTARY industries
for potential partnerships, not competition.

Schema additions needed:
  - StartupArk_Startup_Profile.openToCollaboration: Boolean
  - StartupArk_Startup_Profile.collaborationTypes: [String]
    enum: ['co-founder', 'partner', 'vendor', 'investor', 'advisor']
  - StartupArk_Startup_Profile.complementaryIndustries: [String]

Backend additions:
  - Filter in geoSearchEngine: exclude same industry when searching startups
  - New match filter: openToCollaboration: true

Frontend additions:
  - "Open to Collaboration" toggle in startup profile edit
  - Collaboration tag badges on NearbyStartupCard
  - Filter chip: "Show collaboration-ready only"

Effort estimate: 2 days schema + routes + 1 day frontend

---

## IMPLEMENTATION PRIORITY
Option B → implement when startup analytics dashboard is being built
Option C → implement as part of the Projects/Marketplace module (natural fit)
