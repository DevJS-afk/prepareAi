const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  const m = 'gemini-3.1-flash-lite';
  try {
    const res = await ai.models.generateContent({ model: m, contents: 'Test response' });
    console.log('SUCCESS:', res.text);
  } catch(e) {
    console.log('FAILED:', e.message);
  }
}
test();
