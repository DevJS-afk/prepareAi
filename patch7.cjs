const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

code = code.replace(
  /<button onClick=\{onManagePlan\} className="hover:text-slate-900 dark:text-white underline text-\[10px\] ml-1">Manage<\/button>/g,
  `<button onClick={onManagePlan} className="hover:text-slate-900 dark:text-white underline text-[10px] ml-1">{profile.subscription_tier === 'free' ? 'Upgrade' : 'Manage'}</button>`
);

fs.writeFileSync('src/components/ProfileScreen.tsx', code);
