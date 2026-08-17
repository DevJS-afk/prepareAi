To implement the strict "Invited/Candidate" role and allow recruiters to view their candidates' results, we need to:

1.  **Update the Database (RLS)**: Allow recruiters to query the interview records of users they have invited.
2.  **Update Registration**: Link the specific `candidate_id` to the invitation record when they sign up.
3.  **Update Candidate Dashboard**: Hide all unrelated tools (CV Builder, Practice Mode) so they only see their assigned interview.
4.  **Update Recruiter Dashboard**: Add a "View Report" feature to see the candidate's performance.

### 1. Database Updates (Required)

Run this SQL in your Supabase SQL Editor to enable the new features.

**Copy this into `README.md` and run it in Supabase:**

```sql
-- 1. Allow Interviewers to view interviews of candidates they invited
create policy "Interviewers can view candidate interviews" on interviews
  for select
  using (
    exists (
      select 1 from invites
      where invites.candidate_id = interviews.user_id
      and invites.interviewer_id = auth.uid()
    )
  );

-- 2. Allow Candidates to view their own invites (Existing, but ensuring it matches)
create policy "Candidates can view own invites by email" on invites
  for select
  using ( email = auth.jwt() ->> 'email' );

-- 3. Allow Candidates to update invites (to accept them)
create policy "Candidates can update invites to accept" on invites
  for update
  using ( email = auth.jwt() ->> 'email' );
```

### 2. Code Changes

