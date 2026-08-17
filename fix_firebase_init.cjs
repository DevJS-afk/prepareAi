const fs = require('fs');
let code = fs.readFileSync('src/services/firebaseClient.ts', 'utf8');

code = code.replace(
  'export const db = getFirestore(firebaseApp);',
  'export const db = firebaseConfig.firestoreDatabaseId ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId) : getFirestore(firebaseApp);'
);

fs.writeFileSync('src/services/firebaseClient.ts', code);
console.log("Done");
