# Dorm Marketplace Capstone

Small Day 1 prototype for a campus marketplace with safe claim-state handling.

## Run
1. Open `index.html` directly in browser, or
2. Use VS Code Live Server / any static file server.

## Included MVP
- Create listing (title, category, optional price, pickup note)
- View all listings with visible state
- Claim lifecycle handling (claim, expire, confirm handoff, seller override)

## Required Scenarios Coverage
- **Concurrency collision:** only first claim on an available item succeeds; later claims fail.
- **Ghost buyer:** claim automatically expires after 60 seconds and item returns to available.
- **Hallway sale:** seller can instantly close listing with Mark as Sold or Force Remove.
