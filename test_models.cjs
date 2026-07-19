const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  const models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-3.1-flash-lite', 'gemini-pro-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'];
  for (const m of models) {
    try {
      await ai.models.generateContent({ model: m, contents: 'hi' });
      console.log(m + ' SUCCESS');
      return;
    } catch(e) {
      console.log(m + ' FAILED: ' + e.message);
    }
  }
}
test();
