const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');

const newFormatContent = `
        const formatContent = (text: any) => {
            if (!text) return '';
            const content = String(text);
            
            let html = content.split('\\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                
                let processedLine = trimmed;
                
                let isBullet = false;
                if (processedLine.startsWith('- ') || processedLine.startsWith('• ') || processedLine.startsWith('* ')) {
                    isBullet = true;
                    processedLine = processedLine.substring(2).trim();
                } else if (processedLine.startsWith('-') || processedLine.startsWith('•')) {
                    isBullet = true;
                    processedLine = processedLine.substring(1).trim();
                }
                
                // Handle bold
                processedLine = processedLine.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                // Handle italic (careful not to match bullet points)
                processedLine = processedLine.replace(/(?:^|[^\\*])\\*(?!\\*)(.*?)\\*(?!\\*)/g, (match, p1) => match.replace('*' + p1 + '*', '<em>' + p1 + '</em>'));
                
                if (isBullet) {
                    return \`<li>\${processedLine}</li>\`;
                }
                return \`<p>\${processedLine}</p>\`;
            }).join('');
            
            // Wrap consecutive <li>s in <ul>
            html = html.replace(/(<li>.*?<\\/li>)+/g, match => \`<ul style="margin: 0 0 10px 0; padding-left: 20px;">\${match}</ul>\`);
            
            return html;
        };
`;

code = code.replace(
/        const formatContent = \(text: any\) => \{\n            if \(!text\) return '';\n            const content = String\(text\);\n            return content\.split\('\\n'\)\.map\(line => \{\n                const trimmed = line\.trim\(\);\n                if \(!trimmed\) return '';\n                if \(trimmed\.startsWith\('-'\) \|\| trimmed\.startsWith\('•'\) \|\| trimmed\.startsWith\('\*'\)\) \{\n                    return \`<li>\$\{trimmed\.substring\(1\)\.trim\(\)\}<\/li>\`;\n                \}\n                return \`<p>\$\{line\}<\/p>\`;\n            \}\)\.join\(''\);\n        \};/g,
  newFormatContent.trim()
);

fs.writeFileSync('src/components/CVBuilder.tsx', code);
