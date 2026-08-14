const fs = require('fs');

const files = [
  'src/components/EndScreen.tsx',
  'src/components/ProfileScreen.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/CheckoutScreen.tsx',
  'src/components/MotivationLetter.tsx',
  'src/components/PortfolioBuilder.tsx',
  'src/components/CVBuilder.tsx',
  'src/components/InterviewerDashboard.tsx',
  'src/components/InterviewSetup.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("import { toast } from 'sonner'")) {
    code = "import { toast } from 'sonner';\n" + code;
  }
  
  // Replace success alerts with toast.success
  code = code.replace(/alert\(.*successfully.*?\)/gi, match => {
    return match.replace(/alert\(/, "toast.success(");
  });
  
  code = code.replace(/alert\(.*success.*?\)/gi, match => {
    return match.replace(/alert\(/, "toast.success(");
  });
  
  code = code.replace(/alert\(.*copied.*?\)/gi, match => {
    return match.replace(/alert\(/, "toast.success(");
  });

  // Replace remaining alerts with toast.error
  code = code.replace(/alert\(/g, "toast.error(");
  
  fs.writeFileSync(file, code);
}
console.log("Fixed all alerts to use toast");
