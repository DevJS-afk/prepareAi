const fs = require('fs');

let content = fs.readFileSync('src/components/InterviewScreen.tsx', 'utf8');

const oldLayout = `<div className="lg:w-3/5 bg-gradient-to-b from-gray-900 to-black relative flex flex-col">
           
           <div className="flex-1 relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                <AiAvatar status={aiStatus} persona={activeConfig.persona} audioStream={aiAudioStream} />
           </div>

           <div className="h-48 lg:h-64 relative bg-black border-t border-white/10 group overflow-hidden">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100 opacity-80 group-hover:opacity-100 transition-opacity"></video>
                
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border border-dashed border-brand-blue/20 rounded-lg">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-blue/60"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-blue/60"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-blue/60"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-blue/60"></div>
                        
                        <div className="absolute w-full h-0.5 bg-brand-blue/30 top-0 left-0 shadow-[0_0_8px_#3b82f6] animate-[scan_4s_ease-in-out_infinite]"></div>
                        
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-brand-blue font-mono border border-brand-blue/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                            {t('InterviewScreen.engagement_feedback_active')}
                        </div>
                    </div>
                </div>

                <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono border border-white/10">{t('InterviewScreen.you_label')}</div>
                {isRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-500 uppercase">{t('InterviewScreen.rec_indicator')}</span>
                    </div>
                )}
           </div>
        </div>`;

const newLayout = `<div className="lg:w-3/5 bg-black relative flex flex-col overflow-hidden">
           
           {/* MAIN AREA: USER CAMERA */}
           <div className="absolute inset-0 z-0">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100"></video>
                
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border border-dashed border-brand-blue/20 rounded-lg">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-blue/60"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-blue/60"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-blue/60"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-blue/60"></div>
                        
                        <div className="absolute w-full h-0.5 bg-brand-blue/30 top-0 left-0 shadow-[0_0_8px_#3b82f6] animate-[scan_4s_ease-in-out_infinite]"></div>
                        
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-brand-blue font-mono border border-brand-blue/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                            {t('InterviewScreen.engagement_feedback_active')}
                        </div>
                    </div>
                </div>

                <div className="absolute top-6 left-6 bg-black/60 px-3 py-1.5 rounded text-sm text-white font-mono border border-white/10 backdrop-blur-md shadow-lg">{t('InterviewScreen.you_label')}</div>
                {isRecording && (
                    <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-500 uppercase">{t('InterviewScreen.rec_indicator')}</span>
                    </div>
                )}
           </div>

           {/* PICTURE IN PICTURE: AI AVATAR */}
           <div className="absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 lg:w-56 lg:h-72 z-20 bg-gray-950 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center transform transition-transform hover:scale-105">
                <AiAvatar status={aiStatus} persona={activeConfig.persona} audioStream={aiAudioStream} />
           </div>
           
        </div>`;

if (content.includes('bg-gradient-to-b from-gray-900 to-black relative flex flex-col')) {
    content = content.replace(oldLayout, newLayout);
    fs.writeFileSync('src/components/InterviewScreen.tsx', content);
    console.log('Replaced successfully');
} else {
    console.log('Could not find the target string in InterviewScreen.tsx');
}
