const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
    'const endInterview = useCallback(() => {\n    if (sessionRef.current) {',
    'const endInterview = useCallback(() => {\n    isSessionClosedRef.current = true;\n    if (sessionRef.current) {'
);

fs.writeFileSync('src/hooks/useInterview.ts', code);
