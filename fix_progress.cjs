const fs = require('fs');

let content = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

// 1. Remove the misplaced progressData logic
const misplacedLogic = `      const progressData = React.useMemo(() => {
    return [...interviews].reverse().map((interview, index) => {
      let avgConfidence = 0;
      if (interview.report?.confidenceTrend && interview.report.confidenceTrend.length > 0) {
        const sum = interview.report.confidenceTrend.reduce((acc, curr) => acc + curr.confidence, 0);
        avgConfidence = Math.round(sum / interview.report.confidenceTrend.length);
      }
      return {
        name: \`Session \${index + 1}\`,
        date: new Date(interview.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        overall: interview.report?.overallScore || 0,
        clarity: interview.report?.clarityRating || 0,
        confidence: avgConfidence
      };
    });
  }, [interviews]);`;

content = content.replace(misplacedLogic, '');

// 2. Insert it before if (loading)
const correctLogic = `
  const progressData = React.useMemo(() => {
    return [...interviews].reverse().map((interview, index) => {
      let avgConfidence = 0;
      if (interview.report?.confidenceTrend && interview.report.confidenceTrend.length > 0) {
        const sum = interview.report.confidenceTrend.reduce((acc, curr) => acc + curr.confidence, 0);
        avgConfidence = Math.round(sum / interview.report.confidenceTrend.length);
      }
      return {
        name: \`Session \${index + 1}\`,
        date: new Date(interview.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        overall: interview.report?.overallScore || 0,
        clarity: interview.report?.clarityRating || 0,
        confidence: avgConfidence
      };
    });
  }, [interviews]);
`;

content = content.replace('  if (loading) {', correctLogic + '\n  if (loading) {');

// 3. Add recharts imports
if (!content.includes('recharts')) {
    content = content.replace("import React, { useState, useEffect, useCallback } from 'react';", "import React, { useState, useEffect, useCallback } from 'react';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';");
}

fs.writeFileSync('src/components/ProfileScreen.tsx', content);
console.log('Fixed progress data location and imports');
