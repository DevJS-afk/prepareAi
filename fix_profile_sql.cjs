const fs = require('fs');

const file = 'src/components/ProfileScreen.tsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/console\.error\("Critical DB Error: Infinite recursion in 'profiles' policy\. Run the fix SQL script\."\);/g, 'console.error("Critical DB Error: Infinite recursion or permission denied in profiles.");');
    content = content.replace(/setError\("Database Config Error: Infinite recursion detected\. Please run the FIX SQL script located in README\.md"\);/g, 'setError("Database Error: Could not fetch profile due to permissions.");');
    
    fs.writeFileSync(file, content);
}
console.log("Done");
