const fs = require('fs');

let content = fs.readFileSync('backend/server.ts', 'utf8');

// 1. Extract confidenceTrend from req.body
content = content.replace(
    'const { transcription, feedback, config } = req.body;',
    'const { transcription, feedback, config, confidenceTrend } = req.body;'
);

// 2. Remove confidenceTrend from the Gemini prompt
const oldPrompt = `      4. "confidenceTrend": Provide a timeline of the candidate's confidence level (0-100) throughout the interview. Return an array of objects with 'time' (e.g., '00:00', '01:00') and 'confidence' (e.g., 85).\`;`;
const newPrompt = `      4. Analyze the candidate's communication and provide actionable feedback based on their real responses.\`;`;
content = content.replace(oldPrompt, newPrompt);

// 3. Remove confidenceTrend from the JSON schema
const oldSchema = `              confidenceTrend: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          time: { type: Type.STRING, description: "Time string, e.g., '00:00', '02:30'" },
                          confidence: { type: Type.INTEGER, description: "Confidence score 0-100" }
                      },
                      required: ['time', 'confidence']
                  },
                  description: "Timeline array tracking confidence levels throughout the interview (at least 4 data points)."
              },`;
content = content.replace(oldSchema, '');

// 4. Remove confidenceTrend from required array
content = content.replace(
    `'detectedKeywords', 'confidenceTrend', 'coreCompetencies']`,
    `'detectedKeywords', 'coreCompetencies']`
);

// 5. Inject the real confidenceTrend into the parsed report
const reportInjection = `      const summaryText = summaryResult.text || "{}";
      const report = JSON.parse(summaryText.trim());
      
      // Inject the real confidence data captured during the interview
      report.confidenceTrend = confidenceTrend || [];`;
content = content.replace(
    `      const summaryText = summaryResult.text || "{}";\n      const report = JSON.parse(summaryText.trim());`,
    reportInjection
);

fs.writeFileSync('backend/server.ts', content);
console.log('Fixed server.ts report generation');
