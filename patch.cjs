const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');
code = code.replace(/isAdmin\?: boolean;/g, 'isAdmin?: boolean;\n  subscriptionTier?: string;');
code = code.replace(/const Dashboard: React\.FC<DashboardProps> = \({ onNavigate, userName, isAdmin, pendingConfig, onStartAssigned, lastUsedConfig, onStartLastUsed, subscriptionTier }\) => {/g, "const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userName, isAdmin, pendingConfig, onStartAssigned, lastUsedConfig, onStartLastUsed, subscriptionTier }) => {");
code = code.replace(/const Dashboard: React\.FC<DashboardProps> = \({ onNavigate, userName, isAdmin, pendingConfig, onStartAssigned, lastUsedConfig, onStartLastUsed }\) => {/g, "const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userName, isAdmin, pendingConfig, onStartAssigned, lastUsedConfig, onStartLastUsed, subscriptionTier }) => {");
fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
