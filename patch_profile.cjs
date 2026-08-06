const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

// 1. Add GoogleGenAI import
code = code.replace(
  /import { supabase } from '\.\.\/services\/firebaseClient';/,
  "import { supabase } from '../services/firebaseClient';\nimport { GoogleGenAI } from '@google/genai';"
);

// 2. Update Profile interface
code = code.replace(
  /  is_admin\?: boolean;\n  subscription_tier\?: SubscriptionTier;\n\}/,
  "  is_admin?: boolean;\n  subscription_tier?: SubscriptionTier;\n  job_title?: string;\n  bio?: string;\n}"
);

// 3. Update the initial state
code = code.replace(
  /const \[profile, setProfile\] = useState<Profile>\(\{ full_name: '', pronouns: '', avatar_url: '', is_admin: false, subscription_tier: 'free' \}\);/,
  "const [profile, setProfile] = useState<Profile>({ full_name: '', pronouns: '', avatar_url: '', is_admin: false, subscription_tier: 'free', job_title: '', bio: '' });"
);

// 4. Update isImporting state
code = code.replace(
  /const \[uploadingAvatar, setUploadingAvatar\] = useState\(false\);/,
  "const [uploadingAvatar, setUploadingAvatar] = useState(false);\n  const [isImportingCV, setIsImportingCV] = useState(false);"
);

// 5. Update selects in fetchProfileData
code = code.replace(
  /\.select\('full_name, pronouns, avatar_url, is_admin, subscription_tier'\)/g,
  ".select('full_name, pronouns, avatar_url, is_admin, subscription_tier, job_title, bio')"
);
code = code.replace(
  /\.select\('full_name, pronouns'\)/g,
  ".select('full_name, pronouns, job_title, bio')"
);

code = code.replace(
  /full_name: data\.full_name \|\| '',\n                 pronouns: data\.pronouns \|\| '',/g,
  "full_name: data.full_name || '',\n                 pronouns: data.pronouns || '',\n                 job_title: data.job_title || '',\n                 bio: data.bio || '',"
);

code = code.replace(
  /full_name: basicData\.full_name \|\| '', \n                        pronouns: basicData\.pronouns \|\| '',/g,
  "full_name: basicData.full_name || '', \n                        pronouns: basicData.pronouns || '',\n                        job_title: basicData.job_title || '',\n                        bio: basicData.bio || '',"
);


// 6. Update handleUpdateProfile to include new fields
code = code.replace(
  /full_name: profile\.full_name,\n        pronouns: profile\.pronouns,\n        avatar_url: profile\.avatar_url,/g,
  "full_name: profile.full_name,\n        pronouns: profile.pronouns,\n        job_title: profile.job_title,\n        bio: profile.bio,\n        avatar_url: profile.avatar_url,"
);

// 7. Add handleCVUpload function
const handleCVUploadCode = `
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!process.env.API_KEY) {
          alert("API Key missing");
          return;
      }
      setIsImportingCV(true);
      
      const reader = new FileReader();
      const processContent = async (contentPart: any) => {
          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const prompt = \`
                Act as an expert Profile Extractor. 
                Extract the following details from this CV/Resume:
                - fullName
                - pronouns (if any, otherwise empty string)
                - job_title (current or most recent role)
                - bio (a short professional summary, 1-2 sentences)

                Return a JSON object:
                {
                  "fullName": "string",
                  "pronouns": "string",
                  "job_title": "string",
                  "bio": "string"
                }
              \`;
              const response = await ai.models.generateContent({
                  model: 'gemini-3.5-flash',
                  contents: [contentPart, { text: prompt }],
                  config: { responseMimeType: 'application/json' }
              });
              const data = JSON.parse(response.text || '{}');
              setProfile(prev => ({
                  ...prev,
                  full_name: data.fullName || prev.full_name,
                  pronouns: data.pronouns || prev.pronouns,
                  job_title: data.job_title || prev.job_title,
                  bio: data.bio || prev.bio
              }));
          } catch (error) {
              console.error("Failed to parse CV", error);
              alert("Failed to auto-fill from CV.");
          } finally {
              setIsImportingCV(false);
          }
      };

      if (file.type === "application/pdf") {
          reader.onload = (event) => {
              const base64String = event.target?.result;
              const rawBase64 = typeof base64String === 'string' ? base64String.split(',')[1] : '';
              processContent({ inlineData: { mimeType: 'application/pdf', data: rawBase64 } });
          };
          reader.readAsDataURL(file);
      } else {
          reader.onload = (event) => {
              const text = event.target?.result;
              processContent({ text: text });
          };
          reader.readAsText(file);
      }
  };
`;

code = code.replace(
  /const handleAvatarUpload = async/g,
  handleCVUploadCode + "\n\n  const handleAvatarUpload = async"
);

// 8. Update JSX - form
const formReplacement = `
              {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="w-full space-y-4 mb-4">
                      <div className="flex justify-between items-center bg-brand-blue/10 rounded-lg p-3 border border-brand-blue/20">
                          <span className="text-sm text-brand-blue font-medium">Auto-fill from CV</span>
                          <label className="cursor-pointer bg-brand-blue text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-600 transition-colors">
                              {isImportingCV ? 'Processing...' : 'Upload CV'}
                              <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleCVUpload} disabled={isImportingCV} />
                          </label>
                      </div>
                      
                      <input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                          placeholder="Full Name"
                      />
                      <input
                          type="text"
                          value={profile.pronouns}
                          onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                          placeholder="Pronouns (e.g., they/them)"
                      />
                      <input
                          type="text"
                          value={profile.job_title || ''}
                          onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                          placeholder="Job Title (e.g., Software Engineer)"
                      />
                      <textarea
                          value={profile.bio || ''}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none resize-none h-24 text-sm"
                          placeholder="Short Bio / Summary"
                      />
                      <div className="flex gap-2 justify-center pt-2">
                          <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-brand-blue rounded-lg text-sm font-bold text-white shadow-lg">Save</button>
                      </div>
                  </form>
`;

code = code.replace(
  /\{isEditingProfile \? \(\s*<form onSubmit=\{handleUpdateProfile\} className="w-full space-y-4 mb-4">[\s\S]*?<\/form>\n\s*\) : \(/,
  formReplacement + "              ) : ("
);

// 9. Update JSX - view
const viewReplacement = `
                  <>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profile.full_name || 'Anonymous User'}</h3>
                    {profile.job_title && <p className="text-brand-blue font-medium text-sm mb-1">{profile.job_title}</p>}
                    <p className="text-slate-600 dark:text-gray-400 text-sm mb-3">{session.user.email}</p>
                    {profile.bio && <p className="text-sm text-slate-700 dark:text-gray-300 text-center mb-4 leading-relaxed">{profile.bio}</p>}
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
`;

code = code.replace(
  /<>\s*<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">\{profile\.full_name \|\| 'Anonymous User'\}<\/h3>\s*<p className="text-slate-600 dark:text-gray-400 text-sm mb-2">\{session\.user\.email\}<\/p>\s*<div className="flex flex-wrap justify-center gap-2 mb-4">/,
  viewReplacement
);

fs.writeFileSync('src/components/ProfileScreen.tsx', code);
