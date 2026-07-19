const fs = require('fs');
let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

content = content.replace(/>Log In</g, ">{t('landing.login')}<");
content = content.replace(/>\s*Get Started\s*</g, ">{t('landing.getStarted')}<");

content = content.replace(/Interview practice <br \/>/g, "{t('landing.heroTitle1')} <br />");
content = content.replace(/>reimagined\.<\/span>/g, ">{t('landing.heroTitle2')}</span>");

const subtitleRegex = /Master your next technical or behavioral interview with an AI that listens, reacts, and coaches you in real-time\. No scripts, just conversation\./g;
content = content.replace(subtitleRegex, "{t('landing.heroSubtitle')}");

content = content.replace(/>\s*Start Practicing Free\s*</g, ">{t('landing.startFree')}<");
content = content.replace(/>\s*How it Works\s*</g, ">{t('landing.howItWorks')}<");

fs.writeFileSync('src/components/LandingPage.tsx', content);
console.log('Patched LandingPage.tsx text');
