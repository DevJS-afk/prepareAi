const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

code = code.replace(
    'return res.json({ url: "/payment-success" });',
    `
        console.log("Mocking database update for missing Stripe key...");
        if (userId && planId && supabase) {
          try {
            await supabase
              .from("users")
              .update({
                subscription_tier: planId,
              })
              .eq("id", userId);
            console.log(\`Updated user \${userId} to plan \${planId} (MOCK)\`);
          } catch (dbError) {
            console.error("Error updating user subscription (MOCK):", dbError);
          }
        }
        return res.json({ url: "/payment-success" });`
);

fs.writeFileSync('backend/server.ts', code);
console.log("Patched server.ts checkout mock db update");
