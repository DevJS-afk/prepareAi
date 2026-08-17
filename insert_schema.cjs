const fs = require('fs');
let readme = fs.readFileSync('README.md', 'utf8');

const schemaText = `
### 3. Database Schema Description (Firestore Collections)

The application uses Firebase Firestore as its NoSQL database. Below is the schema describing the core collections and their fields:

#### \`profiles\`
Stores user account information and subscription details.
- \`id\` (string): Unique user identifier (matches Firebase Auth UID).
- \`email\` (string): User's email address.
- \`full_name\` (string): User's full name.
- \`role\` (string): User's role (\`user\`, \`candidate\`, \`admin\`, \`interviewer\`).
- \`is_admin\` (boolean): Admin flag for special privileges.
- \`subscription_tier\` (string): Current plan (\`free\`, \`pro\`, \`recruiter\`).
- \`tokens\` (number): Remaining interview tokens for free users.
- \`created_at\` (timestamp): Account creation date.

#### \`interviews\`
Stores the history and results of AI interview sessions.
- \`id\` (string): Unique interview session ID.
- \`user_id\` (string): Reference to the \`profiles\` collection.
- \`config\` (object): The interview configuration (domain, difficulty, persona).
- \`transcription\` (array): Array of conversation turns (\`speaker\`, \`text\`).
- \`feedback\` (array): Real-time AI feedback on candidate's answers.
- \`report\` (object): Final comprehensive evaluation report (metrics, strengths, weaknesses, advice).
- \`created_at\` (timestamp): Date of the interview.

#### \`invites\`
Stores recruiter invitations sent to candidates.
- \`id\` (string): Unique invite ID.
- \`interviewer_id\` (string): Reference to the recruiter's \`profiles\` document.
- \`candidate_id\` (string): Reference to the candidate's \`profiles\` document (once accepted).
- \`email\` (string): Target candidate email.
- \`token\` (string): Unique invitation token/link.
- \`config\` (object): Pre-configured interview settings assigned by the recruiter.
- \`status\` (string): \`pending\` or \`accepted\`.

#### \`job_offers\`
Stores job postings created by recruiters on the internal Job Board.
- \`id\` (string): Unique job offer ID.
- \`recruiter_id\` (string): Reference to the recruiter's \`profiles\` document.
- \`title\` (string), \`company\` (string), \`location\` (string), \`salary\` (string): Job details.
- \`description\` (string), \`experienceLevel\` (string), \`jobType\` (string): Job requirements.
- \`url\` (string): External application link.

#### \`cvs\`, \`motivation_letters\`, \`portfolios\`
Stores AI-generated career documents for candidates.
- \`id\` (string): Unique document ID.
- \`user_id\` (string): Reference to the candidate's \`profiles\` document.
- \`title\` (string): Document title.
- \`content\` (string): Rendered HTML/Markdown content.
- \`data\` (object): Raw parsed data used to generate the document.
- \`created_at\` (timestamp): Document creation date.

`;

if (!readme.includes('### 3. Database Schema Description')) {
  readme = readme.replace('### 3. Admin Account Creation', schemaText + '### 4. Admin Account Creation');
  fs.writeFileSync('README.md', readme);
  console.log('Schema added to README');
} else {
  console.log('Schema already exists in README');
}
