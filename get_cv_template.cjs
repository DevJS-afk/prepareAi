const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');
const index = code.indexOf('TemplateType');
if (index !== -1) {
  console.log(code.substring(index - 500, index + 2000));
}
