const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
    'const interruptIdRef = useRef(0);',
    'const interruptIdRef = useRef(0);\n  const isSessionClosedRef = useRef(false);'
);

fs.writeFileSync('src/hooks/useInterview.ts', code);
console.log("Patched useInterview.ts to add isSessionClosedRef");
