const fs = require('fs');
const path = require('path');

const dir = 'src/components/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  
  content = content.replace(/(?<!dark:)placeholder-gray-600/g, 'placeholder-slate-400 dark:placeholder-gray-600');
  content = content.replace(/(?<!dark:)placeholder-gray-500/g, 'placeholder-slate-400 dark:placeholder-gray-500');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
});

console.log('Fixed all placeholders');
