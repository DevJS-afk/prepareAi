const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  // Replace console.error(...) with a check if it contains a quota error string
  code = code.replace(
    /console\.error\(err\);/g,
    `const errStrConsoleSetup = String(err) + " " + JSON.stringify(err, Object.getOwnPropertyNames(err || {}));\n          if (!(errStrConsoleSetup.includes("429") || errStrConsoleSetup.toLowerCase().includes("quota"))) {\n              console.error(err);\n          }`
  );
  
  code = code.replace(
    /console\.error\("Parsing failed", error\);/g,
    `const errStrConsoleCV = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n          if (!(errStrConsoleCV.includes("429") || errStrConsoleCV.toLowerCase().includes("quota"))) {\n              console.error("Parsing failed", error);\n          }`
  );
  
  code = code.replace(
    /console\.error\(error\);/g,
    `const errStrConsoleCV2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n        if (!(errStrConsoleCV2.includes("429") || errStrConsoleCV2.toLowerCase().includes("quota"))) {\n            console.error(error);\n        }`
  );
  
  code = code.replace(
    /console\.error\("ATS Scan failed", e\);/g,
    `const errStrConsoleCV3 = String(e) + " " + JSON.stringify(e, Object.getOwnPropertyNames(e || {}));\n          if (!(errStrConsoleCV3.includes("429") || errStrConsoleCV3.toLowerCase().includes("quota"))) {\n              console.error("ATS Scan failed", e);\n          }`
  );
  
  fs.writeFileSync(filepath, code);
}

patchFile('src/components/InterviewSetup.tsx');
patchFile('src/components/CVBuilder.tsx');

