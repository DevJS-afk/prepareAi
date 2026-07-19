const fs = require('fs');

const files = [
  'src/components/MotivationLetter.tsx',
  'src/components/PortfolioBuilder.tsx',
  'src/components/CVBuilder.tsx',
  'src/components/InterviewSetup.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // Regex replacement approach: find where we call ai.models.generateContent and look at its catch block.
  // Actually, let's just string-replace the specific console.error/alert blocks.
  
  // CVBuilder:
  // console.error("Parsing failed", error);
  // alert("Failed to analyze resume. Please ensure the file is readable.");
  content = content.replace(
    /console\.error\("Parsing failed", error\);\n\s*alert\("Failed to analyze resume\. Please ensure the file is readable\."\);/g,
    `console.error("Parsing failed", error);\n          const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n              alert("We have temporarily exceeded our AI service quota. Please try again later.");\n          } else {\n              alert("Failed to analyze resume. Please ensure the file is readable.");\n          }`
  );
  
  // console.error(error);
  // alert("Failed to generate CV. Please try again.");
  content = content.replace(
    /console\.error\(error\);\n\s*alert\("Failed to generate CV\. Please try again\."\);/g,
    `console.error(error);\n        const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n            alert("We have temporarily exceeded our AI service quota. Please try again later.");\n        } else {\n            alert("Failed to generate CV. Please try again.");\n        }`
  );
  
  // console.error("ATS Scan failed", e);
  // alert("Scan failed: " + e.message);
  content = content.replace(
    /console\.error\("ATS Scan failed", (e|error|err)\);\n\s*alert\("Scan failed: " \+ \1\.message\);/g,
    `console.error("ATS Scan failed", $1);\n          const errStr = String($1) + " " + JSON.stringify($1, Object.getOwnPropertyNames($1 || {}));\n          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n              alert("We have temporarily exceeded our AI service quota. Please try again later.");\n          } else {\n              alert("Scan failed: " + $1.message);\n          }`
  );

  // MotivationLetter & PortfolioBuilder:
  // console.error(error);
  // alert("Failed to generate letter. Please try again.");
  content = content.replace(
    /console\.error\(error\);\n\s*alert\("Failed to generate letter\. Please try again\."\);/g,
    `console.error(error);\n        const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n            alert("We have temporarily exceeded our AI service quota. Please try again later.");\n        } else {\n            alert("Failed to generate letter. Please try again.");\n        }`
  );

  // PortfolioBuilder:
  // console.error("Import failed", error);
  // alert("Failed to analyze resume data.");
  content = content.replace(
    /console\.error\("Import failed", error\);\n\s*alert\("Failed to analyze resume data\."\);/g,
    `console.error("Import failed", error);\n          const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n              alert("We have temporarily exceeded our AI service quota. Please try again later.");\n          } else {\n              alert("Failed to analyze resume data.");\n          }`
  );
  
  // console.error(error);
  // alert("Failed to generate portfolio. Please try again.");
  content = content.replace(
    /console\.error\(error\);\n\s*alert\("Failed to generate portfolio\. Please try again\."\);/g,
    `console.error(error);\n        const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n            alert("We have temporarily exceeded our AI service quota. Please try again later.");\n        } else {\n            alert("Failed to generate portfolio. Please try again.");\n        }`
  );

  // InterviewSetup:
  // console.error(err);
  // alert("Failed to analyze resume.");
  content = content.replace(
    /console\.error\(err\);\n\s*alert\("Failed to analyze resume\."\);/g,
    `console.error(err);\n          const errStr = String(err) + " " + JSON.stringify(err, Object.getOwnPropertyNames(err || {}));\n          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n              alert("We have temporarily exceeded our AI service quota. Please try again later.");\n          } else {\n              alert("Failed to analyze resume.");\n          }`
  );

  fs.writeFileSync(file, content);
});

console.log('Fixed frontend AI errors');
