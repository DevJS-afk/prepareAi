const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function processFile(filePath) {
  const componentName = path.basename(filePath, '.tsx');
  const code = fs.readFileSync(filePath, 'utf-8');
  
  const prompt = `
You are a React i18n transformer. I will provide you with a React component.
Your task is to:
1. Extract all user-facing English text (e.g. inside tags, buttons, placeholders, etc.).
2. Generate a JSON object containing these strings, nested under a key matching the component name (e.g. "${componentName}").
3. Rewrite the entire component code.
   - Import \`useTranslation\` from 'react-i18next'.
   - Add \`const { t } = useTranslation();\` inside the component.
   - Replace the extracted strings with \`t('${componentName}.key')\`.

Output MUST be exactly in this format, with no extra markdown outside the blocks:

\`\`\`json
{
  "${componentName}": {
    "key1": "Value 1",
    "key2": "Value 2"
  }
}
\`\`\`
---
\`\`\`tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
// ... rest of the rewritten code
\`\`\`

Here is the component code:
${code}
`;

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
    console.log(text);
    return null;
  }
}

async function main() {
  const res = await processFile('src/components/AboutUs.tsx');
  if (res) {
    fs.writeFileSync('aboutus_i18n.json', JSON.stringify(res, null, 2));
  }
}

main().catch(console.error);
