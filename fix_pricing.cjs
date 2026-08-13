const fs = require('fs');

let code = fs.readFileSync('src/components/PricingScreen.tsx', 'utf8');

code = code.replace(/const PlanCard = \(\{ tier, price, name, features, popular = false \}[\s\S]*?\)\s*=>\s*\{[\s\S]*?let sub = "Perfect for trying PrepareAI";[\s\S]*?if \(tier === 'recruiter'\) sub = "For teams & organizations";[^\n]*\n/, `const PlanCard = ({ tier, price, name, features, popular = false }: { tier: SubscriptionTier, price: string, name: string, features: string[], popular?: boolean }) => {
    let sub = "Perfect for trying PrepareAI";
    if (tier === 'pro') sub = "For serious preparation";
    if (tier === 'recruiter') sub = "For teams & organizations";\n`);

fs.writeFileSync('src/components/PricingScreen.tsx', code);
console.log('Fixed PricingScreen.tsx');
