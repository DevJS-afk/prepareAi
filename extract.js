const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./migrated_prompt_history/prompt_2026-01-28T13:30:38.379Z.json', 'utf8'));
const entry = data.find(item => item.payload && item.payload.text && item.payload.text.includes('CREATE TABLE'));
if (entry) {
  fs.writeFileSync('schema.sql', entry.payload.text);
  console.log('Done');
} else {
  console.log('Not found');
}
