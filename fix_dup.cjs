const fs = require('fs');

let content = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

const regex = /const progressData = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[interviews\]\);/g;
let matchCount = 0;

content = content.replace(regex, (match) => {
    matchCount++;
    if (matchCount === 1) {
        return match; // Keep the first one
    } else {
        return ''; // Remove the second one
    }
});

fs.writeFileSync('src/components/ProfileScreen.tsx', content);
console.log('Removed duplicate progressData');
