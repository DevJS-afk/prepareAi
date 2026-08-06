const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');

if (!code.includes("import { marked } from 'marked';")) {
    code = code.replace("import { useTranslation, Trans } from 'react-i18next';", "import { useTranslation, Trans } from 'react-i18next';\nimport { marked } from 'marked';");
}

const newFormatContent = `
        const formatContent = (text: any) => {
            if (!text) return '';
            return marked.parse(String(text), { async: false }) as string;
        };
`;

code = code.replace(
/const formatContent = \(text: any\) => \{\n            if \(!text\) return '';\n            const content = String\(text\);[\s\S]*?return html;\n        \};/g,
  newFormatContent.trim()
);

fs.writeFileSync('src/components/CVBuilder.tsx', code);
