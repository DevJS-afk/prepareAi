const fs = require('fs');
let code = fs.readFileSync('src/services/firebaseClient.ts', 'utf8');

code = code.replace(
  /  insert\(values: any\): any \{\n    const colRef = collection\(db, this\.collectionName\);\n    const docId = values\.id \|\| doc\(colRef\)\.id;\n    const docRef = doc\(db, this\.collectionName, docId\);\n    const dataToSave = \{ \.\.\.values, id: docId, created_at: values\.created_at \|\| new Date\(\)\.toISOString\(\) \};/g,
  `  insert(values: any): any {\n    const singleValue = Array.isArray(values) ? values[0] : values;\n    const colRef = collection(db, this.collectionName);\n    const docId = singleValue.id || doc(colRef).id;\n    const docRef = doc(db, this.collectionName, docId);\n    const dataToSave = { ...singleValue, id: docId, created_at: singleValue.created_at || new Date().toISOString() };`
);

code = code.replace(
  /  upsert\(values: any\): any \{\n    const colRef = collection\(db, this\.collectionName\);\n    const docId = values\.id \|\| doc\(colRef\)\.id;\n    const docRef = doc\(db, this\.collectionName, docId\);\n    const dataToSave = \{ \.\.\.values, id: docId, updated_at: new Date\(\)\.toISOString\(\) \};/g,
  `  upsert(values: any): any {\n    const singleValue = Array.isArray(values) ? values[0] : values;\n    const colRef = collection(db, this.collectionName);\n    const docId = singleValue.id || doc(colRef).id;\n    const docRef = doc(db, this.collectionName, docId);\n    const dataToSave = { ...singleValue, id: docId, updated_at: new Date().toISOString() };`
);

fs.writeFileSync('src/services/firebaseClient.ts', code);
