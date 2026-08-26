# prepareAI
**Powered by DevJs**

## About The Project
prepareAI is an advanced, interactive platform designed to help candidates ace their job interviews and empower recruiters to evaluate talent efficiently. Powered by Google's cutting-edge Gemini API, React, and Firebase, this application provides a realistic, real-time interview experience using your camera and microphone.

Whether you're a junior developer preparing for your first technical screen, a product manager ready for behavioral rounds, or a recruiter looking for a streamlined pre-screening tool, prepareAI adapts to your specific needs. It leverages real-time speech recognition, generative AI responses, and advanced analytics to create an immersive practice environment.

## 🚀 Key Features

### 🎙️ AI-Powered Interview Experience
- **Realistic Voice Interaction**: Converse naturally with an AI interviewer that listens, speaks, and responds in real-time.
- **Dynamic Personas**: Choose from different interviewer styles (Friendly Recruiter, Stern Technical Lead, Curious Hiring Manager).
- **Domain-Specific Scenarios**: Practice for roles in Software Engineering, Product Management, UX Design, Data Science, and more.
- **Adaptive Difficulty**: Select from Junior, Mid-Level, or Senior difficulty tiers to match your career stage.
- **Real-Time Feedback**: Receive instant, actionable feedback on your answers during the interview.

### 📊 Performance Analytics & Reporting
- **Executive Summaries**: Get AI-generated comprehensive reports detailing your performance.
- **Skill Metrics**: Visualize your strengths and areas for improvement with detailed skill meters (Clarity, Pacing, Technical Accuracy).
- **Actionable Advice**: Receive tailored recommendations and curated learning resources to overcome your weaknesses.
- **Job Opportunities**: Explore relevant job openings automatically matched to your role and skill level upon finishing.
- **Multilingual Support**: Translate your interview reports into 15+ languages instantly.

### 🛠️ Career Document Builders
- **CV Builder**: Craft professional, ATS-friendly resumes using AI optimization.
- **Motivation Letter Generator**: Automatically generate personalized cover letters based on your target company and role.
- **Portfolio Builder**: Compile your past projects and skills into a sleek, shareable portfolio.

### 👥 Role-Based Access Control
- **Admin**: Full control over user management, subscription tiers, and system monitoring via an intuitive dashboard.
- **Interviewer / Recruiter**: Access a dedicated unified dashboard to generate unique invite links, deploy customized interview configs to candidates, and review candidate performance reports.
- **Candidate**: Restricted access tailored for users who join via recruiter invite links to complete pre-configured assessments.
- **User**: Standard users who can access free-tier features or upgrade for unlimited sessions.

### 💳 Stripe Payment Integration
- **Flexible Tiers**: Choose between Free, Pro (Unlimited AI sessions, advanced analytics), and Recruiter (Team dashboard, candidate invites).
- **Secure Processing**: Integrated with Stripe Checkout for secure, seamless subscription management.

## 🏗️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, TypeScript
- **Backend & Database**: Node.js/Express (Full-stack setup), Firebase (Firestore, Authentication, Storage)
- **AI Integration**: Google Gemini API (`@google/genai`), Web Speech API (for STT/TTS)
- **Payments**: Stripe (`stripe`, `@stripe/stripe-js`)

## ⚙️ Configuration and Setup

### 1. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
# Gemini API Key (Required for AI features)
API_KEY=your_gemini_api_key_here

# Stripe Keys (Optional for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 2. Firebase Setup
This project uses Firebase for authentication, database storage, and file storage. Please follow these detailed steps to set up your Firebase project:

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click **Add project** (or **Create a project**).
   - Enter a project name (e.g., `prepareAI`) and click **Continue**.
   - (Optional) Enable Google Analytics for the project, then click **Create project**.
   - Once the project is ready, click **Continue**.

2. **Enable Authentication**:
   - In the Firebase Console, go to **Build** > **Authentication** in the left sidebar.
   - Click **Get started**.
   - Go to the **Sign-in method** tab.
   - Click **Email/Password**, enable it, and click **Save**.

3. **Enable Firestore Database**:
   - Go to **Build** > **Firestore Database** in the left sidebar.
   - Click **Create database**.
   - Select a location (e.g., `nam5 (us-central)`).
   - Start in **Production mode** (we will deploy security rules later).
   - Click **Create**.

4. **Enable Firebase Storage**:
   - Go to **Build** > **Storage** in the left sidebar.
   - Click **Get started**.
   - Start in **Production mode**.
   - Click **Next**, choose your Cloud Storage location, and click **Done**.

5. **Register a Web App & Get Configuration**:
   - Go to the Project Overview page (click the gear icon > **Project settings**).
   - In the "Your apps" section, click the **Web** icon (`</>`).
   - Register the app with a nickname (e.g., `prepareAI Web App`).
   - You don't need to check Firebase Hosting right now. Click **Register app**.
   - You will see a `firebaseConfig` object. Copy the JSON part inside `firebaseConfig`.
   - In your project's root directory, open `firebase-applet-config.json` and replace its contents with your actual configuration (make sure it's valid JSON format).

6. **Deploy Security Rules**:
   - To ensure your database and storage are secure, you need to deploy the provided rules.
   - You can copy the contents of `firestore.rules` and paste it into the **Rules** tab of Firestore in the Firebase Console and click **Publish**.
   - Alternatively, if you have the Firebase CLI installed, run:
     ```bash
     firebase deploy --only firestore:rules
   ```


### 3. Database Schema Description (Firestore Collections)

The application uses Firebase Firestore as its NoSQL database. Below is the schema describing the core collections and their fields:

#### `profiles`
Stores user account information and subscription details.
- `id` (string): Unique user identifier (matches Firebase Auth UID).
- `email` (string): User's email address.
- `full_name` (string): User's full name.
- `role` (string): User's role (`user`, `candidate`, `admin`, `interviewer`).
- `is_admin` (boolean): Admin flag for special privileges.
- `subscription_tier` (string): Current plan (`free`, `pro`, `recruiter`).
- `tokens` (number): Remaining interview tokens for free users.
- `created_at` (timestamp): Account creation date.

#### `interviews`
Stores the history and results of AI interview sessions.
- `id` (string): Unique interview session ID.
- `user_id` (string): Reference to the `profiles` collection.
- `config` (object): The interview configuration (domain, difficulty, persona).
- `transcription` (array): Array of conversation turns (`speaker`, `text`).
- `feedback` (array): Real-time AI feedback on candidate's answers.
- `report` (object): Final comprehensive evaluation report (metrics, strengths, weaknesses, advice).
- `created_at` (timestamp): Date of the interview.

#### `invites`
Stores recruiter invitations sent to candidates.
- `id` (string): Unique invite ID.
- `interviewer_id` (string): Reference to the recruiter's `profiles` document.
- `candidate_id` (string): Reference to the candidate's `profiles` document (once accepted).
- `email` (string): Target candidate email.
- `token` (string): Unique invitation token/link.
- `config` (object): Pre-configured interview settings assigned by the recruiter.
- `status` (string): `pending` or `accepted`.

#### `job_offers`
Stores job postings created by recruiters on the internal Job Board.
- `id` (string): Unique job offer ID.
- `recruiter_id` (string): Reference to the recruiter's `profiles` document.
- `title` (string), `company` (string), `location` (string), `salary` (string): Job details.
- `description` (string), `experienceLevel` (string), `jobType` (string): Job requirements.
- `url` (string): External application link.

#### `cvs`, `motivation_letters`, `portfolios`
Stores AI-generated career documents for candidates.
- `id` (string): Unique document ID.
- `user_id` (string): Reference to the candidate's `profiles` document.
- `title` (string): Document title.
- `content` (string): Rendered HTML/Markdown content.
- `data` (object): Raw parsed data used to generate the document.
- `created_at` (timestamp): Document creation date.

### 4. Admin Account Creation
Since admins have special privileges (viewing all interviews, changing roles), you must manually promote a user to admin:

1. Sign up for an account in the app.
2. Go to the Firebase Console -> Firestore Database.
3. Find the `users` collection, locate your user document (document ID matches your authentication UID).
4. Add or update the field `role` to be `"admin"` and `isAdmin` to be `true`.
5. Refresh the app to see the Admin Dashboard.

## 🚀 Production Deployment

This application is built as a unified full-stack app (Express + Vite). It builds a single Node.js script that serves both the static frontend assets and the backend API routes.

### Local Production Build

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Build the application**:
   ```bash
   npm run build
   ```
   This will run Vite to build the React frontend into `dist/`, and then bundle the Express server (`backend/server.ts`) into `dist/server.cjs`.
3. **Start the server**:
   ```bash
   npm start
   ```
   The app will run on port 3000 (or the port specified by the `PORT` environment variable).

### Hosting options

You can deploy this application to any Node.js hosting provider (e.g., Google Cloud Run, Render, Railway, Heroku, Vercel).

#### Deploying the Backend to Vercel
If you prefer to host your Express backend on Vercel (serverless functions), you can do so by creating a `api/index.js` or configuring `vercel.json` to route requests to your `server.ts`. 
To connect your frontend to the Vercel-hosted backend:
1. Deploy your backend to Vercel and get your deployment URL (e.g., `https://prepareai-backend.vercel.app`).
2. In your frontend hosting environment (or local `.env`), add an environment variable to point to your backend:
   ```env
   VITE_API_URL=https://prepareai-backend.vercel.app
   ```
3. Update your frontend API calls to use this URL instead of relative paths (e.g., `fetch(\`${import.meta.env.VITE_API_URL}/api/endpoint\`)`).

#### Deploying to Google Cloud Run
1. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Authenticate: `gcloud auth login`
3. Initialize the project: `gcloud config set project YOUR_PROJECT_ID`
4. Deploy the source code directly:
   ```bash
   gcloud run deploy prepareai --source . --port 3000 --allow-unauthenticated
   ```
5. In the Cloud Run console, navigate to your deployed service -> **Edit & Deploy New Revision** -> **Variables & Secrets**, and add your `API_KEY` (and Stripe keys if using).

---
Built with passion by DevJs to help you land your dream job.
