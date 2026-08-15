const fs = require('fs');

const files = [
  'src/components/PortfolioBuilder.tsx',
  'src/components/ProfileScreen.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/toast\.error\("Configuration Error: The 'portfolio-images' storage bucket does not exist\. Please run the Storage Setup SQL script in README\.md\."\);/g, 'toast.error("Error: Could not upload image to Firebase Storage.");');
    content = content.replace(/toast\.error\("Configuration Error: The 'avatars' storage bucket does not exist\. Please run the STORAGE SETUP SQL script found in README\.md\."\);/g, 'toast.error("Error: Could not upload avatar to Firebase Storage.");');
    
    fs.writeFileSync(file, content);
  }
});

console.log("Done");
