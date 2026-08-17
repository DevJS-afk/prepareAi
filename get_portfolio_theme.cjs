const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioBuilder.tsx', 'utf8');
const index = code.indexOf('Theme & Layout Editor Section');
if (index !== -1) {
  console.log(code.substring(index, index + 2000));
}
