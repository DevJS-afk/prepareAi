const fs = require('fs');

const files = [
  'src/components/PortfolioBuilder.tsx',
  'src/components/CVBuilder.tsx',
  'src/components/MotivationLetter.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the specific catch blocks
    content = content.replace(/if \(err\.code === 'PGRST205' \|\| err\.message\?\.includes\('does not exist'\) \|\| err\.code === '42P01'\) \{[\s\S]*?\} else \{([\s\S]*?)\}/g, '$1');
    content = content.replace(/if \(err\.code === 'PGRST205' \|\| err\.message\?\.includes\('does not exist'\) \|\| err\.code === '42P01'\) \{[\s\S]*?\} else \{/g, '{');
    content = content.replace(/toast\.error\("Configuration Error: The '[^']+' table does not exist[^"]+"\);/g, '');
    
    fs.writeFileSync(file, content);
  }
});

console.log("Done");
