const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');
if(code.indexOf('CV Style Theme') !== -1) {
    console.log("Replaced");
}
