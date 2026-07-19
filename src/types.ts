
export enum InterviewStatus {
  NotStarted,
  InProgress,
  Finished,
}

export type Role = 'user' | 'admin' | 'interviewer' | 'candidate';
export type SubscriptionTier = 'free' | 'pro' | 'recruiter';

export type DomainKey = 
  | 'software-engineering' 
  | 'product-management' 
  | 'ux-design' 
  | 'data-science' 
  | 'project-management' 
  | 'marketing' 
  | 'human-resources' 
  | 'business-analyst' 
  | 'sales-representative'
  | 'customer-success'
  | 'finance'
  | 'operations';

export type LevelKey = 'junior' | 'mid-level' | 'senior';
export type PersonaKey = 'friendly' | 'stern' | 'curious';

export interface PersonaConfig {
  name: string;
  description: string;
  modifier: string;
}

export const personas: Record<PersonaKey, PersonaConfig> = {
  'friendly': {
    name: 'Friendly Recruiter',
    description: 'A welcoming and encouraging tone to help you feel at ease.',
    modifier: 'You should adopt a friendly, encouraging, and conversational tone. Your goal is to make the candidate feel comfortable and supported. Smile with your voice.'
  },
  'stern': {
    name: 'Stern Technical Lead',
    description: 'A direct, no-nonsense approach focused purely on technical skills.',
    modifier: 'You should adopt a stern, direct, and highly technical tone. Be concise and focus purely on technical correctness. Challenge their answers if they seem weak. Do not engage in small talk.'
  },
  'curious': {
    name: 'Curious Hiring Manager',
    description: 'An inquisitive style, digging into your thought process and team fit.',
    modifier: 'You should adopt a curious and inquisitive tone, like a hiring manager trying to understand the candidate\'s thought process and cultural fit. Ask follow-up "why" questions frequently to probe deeper into their reasoning.'
  }
};


export interface InterviewConfig {
  name: string;
  description: string;
  systemInstruction: string;
  persona?: PersonaKey;
}

export const domains: Record<DomainKey, {
  name: string;
  technologies?: Record<string, string>;
  levels: Record<LevelKey, InterviewConfig>;
}> = {
  'software-engineering': {
    name: 'Software Engineering',
    technologies: {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'go': 'Go',
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'node': 'Node.js',
      'typescript': 'TypeScript',
      'cplusplus': 'C++',
      'csharp': 'C#',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'ruby': 'Ruby',
      'php': 'PHP',
      'rust': 'Rust',
    },
    levels: {
      'junior': {
        name: 'Junior Software Engineer',
        description: 'Focuses on core programming concepts, data structures, and algorithms.',
        systemInstruction: 'You are an interviewer for a junior software engineering position. Your goal is to assess fundamental coding skills. Ask questions about basic data structures (Arrays, Linked Lists), algorithms (sorting, searching), and core concepts of {technology}. Keep questions straightforward. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Mid-Level Software Engineer',
        description: 'Covers practical application, software design, and system components.',
        systemInstruction: 'You are interviewing a mid-level software engineer. Focus on practical application and design. Ask about software design patterns, API design, database concepts, and their experience with frameworks related to {technology}. Probe on past projects. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior Software Engineer',
        description: 'A deep dive into system architecture, leadership, and complex problem-solving.',
        systemInstruction: 'You are a principal engineer interviewing a senior software engineer. Ask complex questions about system design, scalability, microservices architecture, and technical leadership, especially within a {technology} ecosystem. Expect them to lead the discussion. Be direct and concise. Start with a challenging system design prompt.'
      }
    }
  },
  'product-management': {
    name: 'Product Management',
    levels: {
      'junior': {
        name: 'Associate Product Manager',
        description: 'Focuses on product sense, user empathy, and prioritization basics.',
        systemInstruction: 'You are a senior PM interviewing for an Associate Product Manager role. Assess their product sense and user empathy. Ask questions like "How would you improve your favorite product?" or "How would you prioritize these features?". Focus on their thought process. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Product Manager',
        description: 'Covers market analysis, roadmap planning, and stakeholder management.',
        systemInstruction: 'You are interviewing a Product Manager. Ask about market analysis, roadmap creation, managing stakeholders, and using data to make decisions. Use behavioral questions about their past experiences. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior Product Manager',
        description: 'A deep dive into product strategy, vision, and team leadership.',
        systemInstruction: 'You are a Director of Product interviewing a Senior Product Manager. Focus on strategy and leadership. Ask about defining a multi-year product vision, handling major strategic pivots, and mentoring other PMs. Expect strategic, high-level answers. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'ux-design': {
    name: 'UX Design',
    levels: {
      'junior': {
        name: 'Junior UX Designer',
        description: 'Assesses understanding of design principles, user research, and wireframing.',
        systemInstruction: 'You are a Design Lead interviewing a Junior UX Designer. Focus on core design principles, user-centered design processes, and portfolio work. Ask them to walk you through a project, explaining their design decisions for wireframes and user flows. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'UX Designer',
        description: 'Covers the end-to-end design process, from research to high-fidelity prototypes.',
        systemInstruction: 'You are interviewing a UX Designer. Ask about their end-to-end process. Dive into their experience with user research methods, usability testing, and creating high-fidelity interactive prototypes. Discuss how they collaborate with engineers and PMs. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior UX Designer',
        description: 'Focuses on design systems, strategy, and mentoring other designers.',
        systemInstruction: 'You are a Head of Design interviewing a Senior UX Designer. Focus on strategy and impact. Ask about their experience building or contributing to design systems, influencing product strategy with design, and mentoring junior designers. Discuss how they measure the success of their designs. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'data-science': {
    name: 'Data Science',
    levels: {
      'junior': {
        name: 'Junior Data Scientist',
        description: 'Focuses on statistics, machine learning fundamentals, and data cleaning.',
        systemInstruction: 'You are a senior data scientist interviewing a junior data scientist. Focus on fundamentals. Ask about statistical concepts (p-values, confidence intervals), common machine learning algorithms (linear regression, decision trees), and data manipulation with libraries like Pandas. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Data Scientist',
        description: 'Covers model building, feature engineering, and deploying models.',
        systemInstruction: 'You are interviewing a data scientist. Ask about their experience building and evaluating models. Dive into feature engineering techniques, model validation, and the basics of deploying models into production. Use case-study style questions based on real business problems. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior Data Scientist',
        description: 'Focuses on advanced modeling, experiment design, and business impact.',
        systemInstruction: 'You are a data science manager interviewing a senior data scientist. Focus on business impact and technical depth. Ask about complex modeling techniques (e.g., deep learning), designing A/B tests, and communicating complex results to non-technical stakeholders. Inquire about their leadership and mentorship experience. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'project-management': {
    name: 'Project Management',
    levels: {
      'junior': {
        name: 'Project Coordinator',
        description: 'Focuses on organizational skills, task tracking, and basic project tools.',
        systemInstruction: 'You are an interviewer for a Project Coordinator position. Your goal is to assess organizational skills and attention to detail. Ask questions about tracking tasks, managing deadlines, and using tools like Jira or Asana. Keep questions practical. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Project Manager',
        description: 'Covers project planning, risk management, and stakeholder communication.',
        systemInstruction: 'You are interviewing a Project Manager. Focus on their experience managing project lifecycles. Ask about project planning, risk assessment, budget management, and how they handle stakeholder communication and conflicts. Probe on past projects. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior Project Manager',
        description: 'A deep dive into program management, leadership, and strategic planning.',
        systemInstruction: 'You are a Director interviewing a Senior Project Manager. Ask complex questions about managing multiple projects (program management), strategic alignment, and leadership. Expect them to discuss methodologies like Agile vs. Waterfall in depth. Start with a challenging scenario-based question.'
      }
    }
  },
  'marketing': {
    name: 'Marketing',
    levels: {
      'junior': {
        name: 'Marketing Coordinator',
        description: 'Assesses understanding of marketing channels, content creation, and analytics.',
        systemInstruction: 'You are a Marketing Manager interviewing a Marketing Coordinator. Focus on core marketing principles, content creation for social media or blogs, and basic analytics. Ask them to walk you through a campaign they assisted with. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Marketing Manager',
        description: 'Covers marketing strategy, campaign execution, and performance measurement.',
        systemInstruction: 'You are interviewing a Marketing Manager. Ask about developing marketing strategies, managing campaigns from start to finish, and measuring ROI. Dive into their experience with SEO, SEM, and email marketing. Discuss how they use data to drive decisions. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior Marketing Manager',
        description: 'Focuses on brand strategy, team leadership, and budget management.',
        systemInstruction: 'You are a CMO interviewing a Senior Marketing Manager. Focus on strategy and leadership. Ask about building a brand strategy, managing a significant marketing budget, and leading and mentoring a team. Discuss how they stay on top of market trends. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'human-resources': {
    name: 'Human Resources',
    levels: {
      'junior': {
        name: 'HR Coordinator',
        description: 'Focuses on administrative tasks, employee onboarding, and HR policies.',
        systemInstruction: 'You are an HR Manager interviewing an HR Coordinator. Assess their organizational skills, knowledge of basic HR functions like onboarding and offboarding, and their understanding of confidentiality. Use scenario-based questions about handling employee inquiries. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'HR Generalist',
        description: 'Covers employee relations, recruitment, and performance management.',
        systemInstruction: 'You are interviewing an HR Generalist. Ask about their experience with employee relations issues, full-cycle recruiting, and performance management systems. Use behavioral questions to understand how they handle sensitive situations. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior HR Business Partner',
        description: 'Focuses on HR strategy, talent management, and organizational development.',
        systemInstruction: 'You are a Director of HR interviewing a Senior HR Business Partner. Focus on strategic thinking. Ask about aligning HR strategy with business goals, developing talent management programs, and leading organizational change initiatives. Expect strategic, data-driven answers. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'business-analyst': {
    name: 'Business Analyst',
    levels: {
      'junior': {
        name: 'Junior Business Analyst',
        description: 'Focuses on requirements gathering, user stories, and communication.',
        systemInstruction: 'You are interviewing for a Junior Business Analyst role. Assess their understanding of requirements elicitation and documentation. Ask about creating user stories, communicating with stakeholders, and their familiarity with tools like Jira. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Business Analyst',
        description: 'Covers process modeling, stakeholder management, and data analysis.',
        systemInstruction: 'You are interviewing a Business Analyst. Ask about their experience with process modeling (e.g., BPMN), managing competing stakeholder needs, and using SQL or Excel for data analysis to support business decisions. Probe on past project challenges. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior Business Analyst',
        description: 'A deep dive into strategic analysis, business process re-engineering, and mentorship.',
        systemInstruction: 'You are a Lead BA interviewing a Senior Business Analyst. Focus on strategic impact. Ask about their role in business process re-engineering, bridging the gap between business strategy and technology solutions, and mentoring other analysts. Start with a complex business problem scenario.'
      }
    }
  },
  'sales-representative': {
    name: 'Sales Representative',
    levels: {
      'junior': {
        name: 'Sales Development Rep',
        description: 'Assesses prospecting skills, handling objections, and product knowledge.',
        systemInstruction: 'You are a Sales Manager interviewing a Sales Development Representative. Focus on their prospecting skills and resilience. Ask about how they would research leads, handle common objections like "I\'m not interested," and how they learn a new product quickly. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Account Executive',
        description: 'Covers full sales cycle, pipeline management, and closing techniques.',
        systemInstruction: 'You are interviewing an Account Executive. Ask about their experience managing the full sales cycle, from prospecting to closing. Dive into their pipeline management strategies, negotiation skills, and how they build relationships with clients. Use behavioral questions about past deals. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Senior Account Executive',
        description: 'Focuses on strategic accounts, complex sales cycles, and sales strategy.',
        systemInstruction: 'You are a Director of Sales interviewing a Senior Account Executive. Focus on strategic selling. Ask about managing complex, multi-stakeholder sales cycles, developing strategies for breaking into large enterprise accounts, and their role in mentoring other sales reps. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'customer-success': {
    name: 'Customer Success',
    levels: {
      'junior': {
        name: 'Customer Support Specialist',
        description: 'Focuses on troubleshooting, empathy, and effective communication.',
        systemInstruction: 'You are a Customer Support Team Lead interviewing a Customer Support Specialist. Assess their empathy, problem-solving skills, and ability to handle difficult customers. Ask role-play questions about handling an angry client or troubleshooting a common issue. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Customer Success Manager',
        description: 'Covers account retention, relationship building, and onboarding strategies.',
        systemInstruction: 'You are a Director of Customer Success interviewing a Customer Success Manager. Focus on account retention, upselling strategies, and onboarding processes. Ask how they measure customer health and handle at-risk accounts. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Director of Customer Success',
        description: 'Focuses on churn reduction, team scaling, and customer success metrics.',
        systemInstruction: 'You are a VP of Sales & Success interviewing a Director of Customer Success. Focus on churn reduction strategies, scaling support teams, and interpreting metrics like NPS and CLV. Ask about their vision for a customer-centric organization. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'finance': {
    name: 'Finance',
    levels: {
      'junior': {
        name: 'Financial Analyst',
        description: 'Focuses on financial modeling, reporting, and data accuracy.',
        systemInstruction: 'You are a Finance Manager interviewing a Junior Financial Analyst. Assess their proficiency with Excel, financial modeling basics, and attention to detail. Ask about variance analysis, financial statements, and how they ensure accuracy in their work. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Finance Manager',
        description: 'Covers budgeting, forecasting, and strategic financial planning.',
        systemInstruction: 'You are a VP of Finance interviewing a Finance Manager. Focus on budgeting, forecasting, and strategic partnership with business units. Ask about a time they influenced a business decision with financial data and how they manage the FP&A process. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'Chief Financial Officer (CFO)',
        description: 'Focuses on capital allocation, risk management, and long-term strategy.',
        systemInstruction: 'You are a CEO interviewing a potential CFO. Focus on capital allocation, fundraising, risk management, and long-term financial strategy. Ask complex questions about balancing growth vs. profitability and communicating financial health to the board. Start by introducing yourself and then ask the first question.'
      }
    }
  },
  'operations': {
    name: 'Operations',
    levels: {
      'junior': {
        name: 'Operations Coordinator',
        description: 'Focuses on logistics, scheduling, and vendor management.',
        systemInstruction: 'You are an Operations Manager interviewing an Operations Coordinator. Assess their organizational skills, ability to multitask, and experience with vendor management. Ask about a time they optimized a daily workflow or resolved a logistical issue. Start by introducing yourself and then ask the first question.'
      },
      'mid-level': {
        name: 'Operations Manager',
        description: 'Covers process improvement, efficiency, and cross-functional leadership.',
        systemInstruction: 'You are a Director of Operations interviewing an Operations Manager. Focus on process optimization, supply chain management, and cross-functional leadership. Ask how they identify bottlenecks and implement efficiency improvements using methodologies like Lean or Six Sigma. Start by introducing yourself and then ask the first question.'
      },
      'senior': {
        name: 'VP of Operations',
        description: 'Focuses on operational strategy, scaling, and organizational structure.',
        systemInstruction: 'You are a COO interviewing a VP of Operations. Focus on operational strategy, scaling operations for high growth, and P&L management. Ask about leading large organizations through change and aligning operations with company goals. Start by introducing yourself and then ask the first question.'
      }
    }
  }
};

export interface TranscriptionEntry {
  speaker: 'user' | 'ai';
  text: string;
}

export interface FeedbackEntry {
  userText: string;
  feedbackText: string;
}

export interface SuggestedResource {
  title: string;
  uri: string;
}

export interface JobOffer {
  id?: string;
  recruiter_id?: string;
  title: string;
  company: string;
  url: string;
  location?: string;
  description?: string;
  salary?: string;
  experienceLevel?: string;
  jobType?: string;
  created_at?: string;
  isRecruiterPosted?: boolean;
}

export interface SkillRating {
  skillName: string;
  rating: number; // e.g., out of 10
  justification: string;
}

export interface CoreCompetency {
  name: string;
  status: 'strength' | 'weakness';
  description: string;
}

export interface InterviewReport {
  overallSummary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  actionableAdvice: string[];
  skillRatings: SkillRating[];
  overallScore?: number;
  clarityRating?: number; // 0-100
  pacingRating?: number; // 0-100
  detectedKeywords?: string[];
  confidenceTrend?: { time: string; confidence: number }[];
  jobOffers?: JobOffer[];
  coreCompetencies?: CoreCompetency[];
}

export interface SavedCV {
  id: string;
  created_at: string;
  title: string;
  content: string;
  data?: any; // To store raw input data
}

export interface SavedLetter {
  id: string;
  created_at: string;
  title: string;
  job_title: string;
  company: string;
  content: string;
}

export interface SavedPortfolio {
  id: string;
  created_at: string;
  title: string;
  content: string;
  data?: any;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  is_admin?: boolean;
  role?: Role;
  created_at?: string;
  subscription_tier?: SubscriptionTier;
  subscription_status?: string;
  tokens?: number;
}

export interface Invite {
  id: string;
  interviewer_id: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted';
  created_at: string;
  config?: InterviewConfig; // New field for pre-configured interviews
  candidate_id?: string;
}

export interface Session {
  user: {
    id: string;
    email: string | null;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
  };
}

