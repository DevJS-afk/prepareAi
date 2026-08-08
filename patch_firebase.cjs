const fs = require('fs');
let code = fs.readFileSync('src/services/firebaseClient.ts', 'utf8');

const oldCode = `// Firebase credentials from firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0172497386",
  appId: "1:779554654367:web:cecad1fb189a14a283faaa",
  apiKey: "AIzaSyD05COAiGqXYrgngi6mJ270eiDHD70pSWs",
  authDomain: "gen-lang-client-0172497386.firebaseapp.com",
  storageBucket: "gen-lang-client-0172497386.firebasestorage.app",
  messagingSenderId: "779554654367"
};`;

const newCode = `// Firebase credentials from firebase-applet-config.json
import firebaseConfig from '../../firebase-applet-config.json';`;

if (code.includes(oldCode)) {
    code = code.replace(oldCode, newCode);
    console.log("Patched firebase config");
} else {
    console.log("Could not find oldCode");
}

fs.writeFileSync('src/services/firebaseClient.ts', code);
