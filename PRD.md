# Dorm Marketplace PRD (Day 1 MVP)

## 1) Scope Cut
1. **Online payments and escrow** are intentionally excluded because secure money handling, refunds, and disputes are beyond a Day 1 prototype.
2. **In-app live chat** is intentionally excluded because real-time messaging infrastructure increases complexity without being required to validate item claiming behavior.
3. **Advanced search and recommendation system** is intentionally excluded because ranking/filter tuning is optimization work, not core workflow validation.

## 2) MVP Features
1. **Create listing:** A student can post an item with title, category, optional price, and dorm pickup note.
2. **Browse available items:** Students can view all currently available listings with clear status labels.
3. **Claim lifecycle management:** A student can claim an item, claims expire if handoff is not confirmed, and sellers can force close listings.

## 3) Acceptance Criteria (Claim Item Flow)
1. **Given** an item is `available`, **when** a student clicks `Claim Item`, **then** the item becomes `claimed`, stores the claimer name, and starts a claim-expiry timer.
2. **Given** an item is already `claimed` by another student, **when** a second student clicks `Claim Item`, **then** the claim is rejected and the UI shows the item is no longer available.
3. **Given** an item is `claimed` and the expiry time passes without `Confirm Handoff`, **when** the timer elapses, **then** the claim is cancelled and the item returns to `available`.
