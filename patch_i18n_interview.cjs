const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const missingEn = `
      InterviewScreen: {
        ready_to_begin: 'Ready to Begin',
        fullscreen_instruction: 'To ensure a distraction-free environment and realistic experience, the interview will take place in <1>Fullscreen Mode</1>.',
        enter_studio_start: 'Enter Studio & Start',
        live_session: 'Live Session',
        standby: 'Standby',
        paused_session: 'Session Paused',
        paused_instruction: 'Your interview is currently paused.',
        paused_keyboard_hint: 'Press Esc again to resume',
        resume_session: 'Resume Session',
        you_label: 'You',
        rec_indicator: 'REC',
        engagement_feedback_active: 'Engagement & Feedback Active',
        live_transcript: 'Live Transcript',
        conversation_placeholder: 'Conversation will appear here once the interview starts...',
        analysis_stream: 'Analysis Stream',
        feedback_placeholder: 'Real-time feedback and analysis will appear here during the interview...',
        feedback_label: 'Feedback',
        neural_link_loading: 'Neural link established. Awaiting input...',
        record_session: 'Record Session',
        stop_recording: 'Stop Recording',
        saving: 'Saving...',
        end_interview: 'End Interview',
        abort: 'Abort',
        retry: 'Retry',
        connection_interrupted: 'Connection Interrupted',
        analyzing_mind: 'Analyzing',
        awaiting_speech: 'Awaiting Speech',
        transmitting_voice: 'Transmitting',
        finalizing: 'Finalizing...',
        persona_sarah_name: 'Sarah',
        persona_sarah_title: 'Friendly Recruiter',
        persona_marcus_name: 'Marcus',
        persona_marcus_title: 'Technical Lead',
        persona_sophia_name: 'Sophia',
        persona_sophia_title: 'Hiring Manager'
      },
      EmotionTracker: {
        kinesics_analytics: 'Kinesics Analytics',
        status_active: 'Active',
        status_recording: 'Recording',
        confidence_score: 'Confidence Score',
        stable: 'Stable',
        engagement_level: 'Engagement Level',
        active: 'Active',
        postural_stance: 'Postural Stance',
        engagement_sparkline: 'Engagement Sparkline',
        motion_spark: 'Motion Spark',
        awaiting_signal: 'Awaiting signal...',
        state_focused_label: 'Focused',
        state_focused_desc: 'Eye contact maintained, stable posture.',
        state_calm_label: 'Calm',
        state_calm_desc: 'Relaxed stance, low erratic motion.',
        state_expressive_label: 'Expressive',
        state_expressive_desc: 'High hand movement, animated expressions.',
        state_reflective_label: 'Reflective',
        state_reflective_desc: 'Gaze diverted, thinking posture.',
        state_fidgety_label: 'Fidgety',
        state_fidgety_desc: 'High minor movements, postural shifts.'
      },
`;

code = code.replace(
  /jobBoardDesc: 'Find AI-matched opportunities.'\n      \}/,
  `jobBoardDesc: 'Find AI-matched opportunities.'\n      },\n${missingEn}`
);

fs.writeFileSync('src/i18n.ts', code);
