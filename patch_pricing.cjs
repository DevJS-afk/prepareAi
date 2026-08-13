const fs = require('fs');
let code = fs.readFileSync('src/components/PricingScreen.tsx', 'utf8');

code = code.replace(
    /features=\{\[\s*"1 active event",\s*"10 AI calls per day",\s*"Basic curriculum generation",\s*"Flashcards & quizzes",\s*"Success probability score"\s*\]\}/,
    'features={[\n                    "5 free tokens included",\n                    "3 tokens per interview",\n                    "Basic curriculum generation",\n                    "Flashcards & quizzes",\n                    "Success probability score"\n                ]}'
);

fs.writeFileSync('src/components/PricingScreen.tsx', code);
console.log("Patched PricingScreen.tsx correctly");
