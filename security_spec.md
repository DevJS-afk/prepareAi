# Security Specification: Zero-Trust Firestore Rules

## 1. Data Invariants

1. **Profile Integrity**: A user profile can only be created by the matching authenticated user (where document ID matches `request.auth.uid`). Users can never assign themselves the `admin` role or `subscription_tier` on registration.
2. **Resource Ownership**: Documents in `cvs`, `motivation_letters`, `portfolios`, and `interviews` must be owned by the user who created them (verifying `user_id == request.auth.uid`).
3. **Immutability of Core Identities**: The `user_id` on any document can never be changed after creation.
4. **Length and Format Safeguards**: String fields (titles, text contents, custom sections) must respect strict size constraints to prevent Denials of Wallet/Storage attacks.
5. **Invite Safety**: An invitation (`invites`) is created by a recruiter and can only be updated to `status = 'accepted'` if the candidate's authenticated email matches the invitation's destination email.
6. **Terminal State Locking**: Once an interview reaches the `Finished` state, it becomes locked and cannot be edited by the client (with an override escape hatch for `admin` role).

---

## 2. The "Dirty Dozen" Malicious Payloads

The following adversarial actions must be strictly blocked by our Firestore Security Rules, returning `PERMISSION_DENIED`:

### Identity & Privilege Escalation
1. **Malicious Profile Insertion (Identity Spoofing)**: Trying to write a user profile with document ID `victim_uid_123` but authenticated as `attacker_uid_456`.
2. **Self-Assigned Admin privileges (Privilege Escalation)**: Creating/updating own user profile with `is_admin = true` or `role = 'admin'`.
3. **Email Spoofing (Unverified access)**: Attempting to read/write admin resources while authenticated with an unverified email (`email_verified = false`) that claims to match the administrator's email.

### Resource Hijacking & Data Tampering
4. **ID Poisoning (Resource Poisoning)**: Creating a document with a massive 10KB string full of corrupted characters as the Document ID (e.g., `/{massive_junk}`).
5. **CV Theft (Authorization Bypass)**: Authenticated user `attacker_uid` trying to read/delete a CV owned by `victim_uid` at `/cvs/victim_cv_789`.
6. **CV Owner Hijacking (Ownership Spoofing)**: Updating a CV to change `user_id` from `victim_uid` to `attacker_uid`.

### Size Validation & Schema Breaking
7. **DoS Title Injection (Denial of Wallet)**: Inserting a CV or motivation letter with an extremely long title (> 200 characters) to bloat database queries.
8. **Immutability Breach**: Updating a CV's `created_at` timestamp to a backdated value.

### Workflow & State Shortcutting
9. **Shortcutting State (Interview Flow)**: Skipping status checks to mark an interview as `Finished` before any dialog transcription has occurred.
10. **Post-Finished Modification (Terminal State Locking)**: Attempting to modify transcription dialog entries or reports of an interview that has already reached the `Finished` status.

### Recruiter & Invite Fraud
11. **Invite Stealing (Invite Bypass)**: Registering a user as a `candidate` and marking an invite status to `accepted` for a target email that does not match the candidate's logged-in email.
12. **Blind Collection Scans (Query Scraping)**: Running an open query on `/cvs` or `/interviews` without a `user_id` filtering clause to scrap metadata of other users.

---

## 3. The Test Specs

Our tests are designed to mock the authenticated states (signed out, authenticated normal user, unverified candidate, administrator) and perform basic operations to verify the impenetrable nature of our rules.
All the "Dirty Dozen" malicious flows are tested to confirm they fail with `PERMISSION_DENIED`.
