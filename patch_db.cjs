const fs = require('fs');
let code = fs.readFileSync('src/services/firebaseClient.ts', 'utf8');

code = code.replace(
    /export const db = initializeFirestore\(firebaseApp, \{\}, "[^"]+"\);/,
    'import { getFirestore } from "firebase/firestore";\nexport const db = getFirestore(firebaseApp);'
);

fs.writeFileSync('src/services/firebaseClient.ts', code);
console.log("Patched db init");
