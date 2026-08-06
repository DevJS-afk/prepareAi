const fs = require('fs');

const content = `# prepareAI
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
- **AI Integration**: Google Gemini API (\`@google/genai\`), Web Speech API (for STT/TTS)
- **Payments**: Stripe (\`stripe\`, \`@stripe/stripe-js\`)

## ⚙️ Configuration and Setup

### 1. Environment Variables
Create a \`.env\` file in the root directory and configure the following variables:
\`\`\`env
# Gemini API Key (Required for AI features)
API_KEY=your_gemini_api_key_here

# Stripe Keys (Optional for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
\`\`\`

### 2. Firebase Setup
This project uses Firebase for authentication and database storage.

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Email/Password).
3. Enable **Firebase Storage**.
4. Register a web app and obtain your Firebase configuration. Replace the contents of \`firebase-applet-config.json\` with your actual project config.
5. Deploy the security rules by copying the contents of \`firestore.rules\` to your Firebase console or deploying via the Firebase CLI:
   \`\`\`bash
   firebase deploy --only firestore:rules
   \`\`\`

### 3. Admin Account Creation
Since admins have special privileges (viewing all interviews, changing roles), you must manually promote a user to admin:

1. Sign up for an account in the app.
2. Go to the Firebase Console -> Firestore Database.
3. Find the \`users\` collection, locate your user document (document ID matches your authentication UID).
4. Add or update the field \`role\` to be \`"admin"\` and \`isAdmin\` to be \`true\`.
5. Refresh the app to see the Admin Dashboard.

## 🚀 Production Deployment

This application is built as a unified full-stack app (Express + Vite). It builds a single Node.js script that serves both the static frontend assets and the backend API routes.

### Local Production Build

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
2. **Build the application**:
   \`\`\`bash
   npm run build
   \`\`\`
   This will run Vite to build the React frontend into \`dist/\`, and then bundle the Express server (\`backend/server.ts\`) into \`dist/server.cjs\`.
3. **Start the server**:
   \`\`\`bash
   npm start
   \`\`\`
   The app will run on port 3000 (or the port specified by the \`PORT\` environment variable).

### Hosting options

You can deploy this application to any Node.js hosting provider (e.g., Google Cloud Run, Render, Railway, Heroku).

#### Deploying to Google Cloud Run
1. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Authenticate: \`gcloud auth login\`
3. Initialize the project: \`gcloud config set project YOUR_PROJECT_ID\`
4. Deploy the source code directly:
   \`\`\`bash
   gcloud run deploy prepareai --source . --port 3000 --allow-unauthenticated
   \`\`\`
5. In the Cloud Run console, navigate to your deployed service -> **Edit & Deploy New Revision** -> **Variables & Secrets**, and add your \`API_KEY\` (and Stripe keys if using).

---
Built with passion by DevJs to help you land your dream job.
`

fs.writeFileSync('README.md', content);
