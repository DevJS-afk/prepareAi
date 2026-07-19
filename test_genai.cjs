const { GoogleGenAI } = require('@google/genai');
async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Say hello'
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}
test();
