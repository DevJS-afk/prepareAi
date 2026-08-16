const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

const progressDataLogic = `
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

// Insert the logic before the return statement of ProfileScreen
if (!content.includes('const progressData')) {
    content = content.replace('return (', progressDataLogic + '\n  return (');
}

const progressTabContent = `
                  {/* PROGRESS TAB */}
                  {activeTab === 'progress' && (
                      <div className="space-y-8 animate-fade-in">
                          {progressData.length > 0 ? (
                              <>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-brand-purple/20">
                                          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mb-1">Avg Overall Score</p>
                                          <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                              {Math.round(progressData.reduce((acc, curr) => acc + curr.overall, 0) / progressData.length)}<span className="text-sm font-normal text-slate-500">/100</span>
                                          </p>
                                      </div>
                                      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-brand-blue/20">
                                          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mb-1">Avg Confidence</p>
                                          <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                              {Math.round(progressData.reduce((acc, curr) => acc + curr.confidence, 0) / progressData.length)}<span className="text-sm font-normal text-slate-500">%</span>
                                          </p>
                                      </div>
                                      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-brand-green/20">
                                          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mb-1">Total Sessions</p>
                                          <p className="text-3xl font-bold text-slate-900 dark:text-white">{progressData.length}</p>
                                      </div>
                                  </div>

                                  <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance Timeline</h3>
                                      <div className="h-80 w-full">
                                          <ResponsiveContainer width="100%" height="100%">
                                              <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                  <defs>
                                                      <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                                                          <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                                                          <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                                                      </linearGradient>
                                                      <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                      </linearGradient>
                                                  </defs>
                                                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => \`\${value}\`} domain={[0, 100]} />
                                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                                                  <RechartsTooltip 
                                                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '8px', border: 'none', color: '#fff' }}
                                                      itemStyle={{ color: '#fff' }}
                                                  />
                                                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                                                  <Area type="monotone" name="Overall Score" dataKey="overall" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorOverall)" />
                                                  <Area type="monotone" name="Confidence Level" dataKey="confidence" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorConfidence)" />
                                              </AreaChart>
                                          </ResponsiveContainer>
                                      </div>
                                  </div>
                                  
                                  <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Clarity & Communication</h3>
                                      <div className="h-64 w-full">
                                          <ResponsiveContainer width="100%" height="100%">
                                              <LineChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                                                  <RechartsTooltip 
                                                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '8px', border: 'none', color: '#fff' }}
                                                  />
                                                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                                                  <Line type="monotone" name="Clarity Score" dataKey="clarity" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                              </LineChart>
                                          </ResponsiveContainer>
                                      </div>
                                  </div>
                              </>
                          ) : (
                              <div className="text-center py-20">
                                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📈</div>
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No progress data yet</h3>
                                  <p className="text-slate-500 dark:text-gray-400">Complete an interview session to see your progress trends.</p>
                              </div>
                          )}
                      </div>
                  )}
`;

if (!content.includes("{/* PROGRESS TAB */}")) {
    content = content.replace('{/* HISTORY TAB */}', progressTabContent + '\n\n                  {/* HISTORY TAB */}');
}

fs.writeFileSync('src/components/ProfileScreen.tsx', content);
console.log('Progress tab content added');
