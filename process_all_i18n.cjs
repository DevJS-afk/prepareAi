const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

const filesToProcess = [
  'src/components/AdminDashboard.tsx',
  'src/components/AuthScreen.tsx',
  'src/components/CheckoutScreen.tsx',
  'src/components/CookieBanner.tsx',
  'src/components/CVBuilder.tsx',
  'src/components/EmailScreen.tsx',
  'src/components/EmotionTracker.tsx',
  'src/components/EndScreen.tsx',
  'src/components/InterviewerDashboard.tsx',
  'src/components/InterviewScreen.tsx',
  'src/components/InterviewSetup.tsx',
  'src/components/JobBoard.tsx',
  // 'src/components/LandingPage.tsx', // Might be partially done
  'src/components/LoginScreen.tsx',
  'src/components/MotivationLetter.tsx',
  'src/components/PaymentSuccessScreen.tsx',
  'src/components/PortfolioBuilder.tsx',
  'src/components/PricingScreen.tsx',
  'src/components/PrivacyPolicy.tsx',
  'src/components/ProfileScreen.tsx',
  'src/components/RegistrationScreen.tsx',
  'src/components/TermsOfService.tsx'
  // 'src/components/WelcomeScreen.tsx' // Might be partially done
];

async function processFile(filePath) {
  const componentName = path.basename(filePath, '.tsx');
  const code = fs.readFileSync(filePath, 'utf-8');
  
  const prompt = `
You are a React i18n transformer. I will provide you with a React component.
Your task is to:
1. Extract all user-facing English text (e.g. inside tags, buttons, placeholders, labels, alt text, title attributes).
2. Generate a JSON object containing these strings, nested under a key matching the component name (e.g. "${componentName}").
3. Rewrite the entire component code.
   - Import \`useTranslation, Trans\` from 'react-i18next'.
   - Add \`const { t } = useTranslation();\` inside the component. (If there are multiple components in the file, add it to all that need it).
   - Replace simple extracted strings with \`t('${componentName}.key')\`.
   - For strings with bold/italic tags or dynamic variables, use the \`<Trans>\` component. DO NOT use template literals inside translation JSON values.

Output MUST be exactly in this format, with no extra markdown outside the blocks:

\`\`\`json
{
  "${componentName}": {
    "key1": "Value 1"
  }
}
\`\`\`
---
\`\`\`tsx
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
// ... rest of the rewritten code EXACTLY as before, but with strings replaced
\`\`\`

Here is the component code:
${code}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    });
    
    const text = response.text;
    
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    const codeMatch = text.match(/```tsx\n([\s\S]*?)\n```/);
    
    if (jsonMatch && codeMatch) {
      const json = JSON.parse(jsonMatch[1]);
      const rewrittenCode = codeMatch[1];
      fs.writeFileSync(filePath, rewrittenCode);
      console.log('Processed', componentName);
      return json;
    } else {
      console.log('Failed to parse output for', componentName);
      return null;
    }
  } catch(e) {
    console.error('Error processing', componentName, e.message);
    return null;
  }
}

async function main() {
  const allTranslations = {};
  
  // To avoid hitting rate limits too hard, we process them in chunks or sequentially
  for (const file of filesToProcess) {
    if (!fs.existsSync(file)) continue;
    console.log('Processing', file);
    const res = await processFile(file);
    if (res) {
      Object.assign(allTranslations, res);
    }
    // sleep for a second
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('all_translations.json', JSON.stringify(allTranslations, null, 2));
  console.log('Done processing all components.');
}

main();
