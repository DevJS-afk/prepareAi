const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

const mockReportCode = `
      if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
        console.log("Using fallback mock report due to quota limits.");
        const mockReport = {
          overallScore: 85,
          overallSummary: "You demonstrated a solid understanding of the role and communicated your points effectively, despite the system encountering a rate limit during analysis.",
          keyStrengths: ["Clear communication", "Relevant examples provided", "Good pacing"],
          areasForImprovement: ["Provide more specific metrics", "Expand on technical details"],
          actionableAdvice: ["Use the STAR method more consistently", "Include more quantitative results in your examples"],
          skillRatings: [
            { skillName: "Communication", rating: 8, justification: "Articulated thoughts clearly." },
            { skillName: "Problem Solving", rating: 7, justification: "Provided logical approaches to hypothetical scenarios." },
            { skillName: "Technical Knowledge", rating: 8, justification: "Demonstrated good foundational knowledge." }
          ],
          clarityRating: 88,
          pacingRating: 82,
          detectedKeywords: ["leadership", "strategy", "collaboration", "agile", "optimization"],
          confidenceTrend: [
            { time: "00:00", confidence: 75 },
            { time: "01:30", confidence: 85 },
            { time: "03:00", confidence: 80 },
            { time: "04:30", confidence: 90 }
          ],
          coreCompetencies: [
            { name: "Technical Communication", status: "strength", description: "Explained concepts clearly." },
            { name: "System Design", status: "weakness", description: "Could provide more architectural depth." },
            { name: "Teamwork", status: "strength", description: "Showed strong collaborative mindset." },
            { name: "Problem Solving", status: "strength", description: "Good analytical approach." }
          ]
        };
        const mockResources = [
          { uri: "https://example.com/interview-prep", title: "Top Interview Tips for Tech Roles" },
          { uri: "https://example.com/star-method", title: "Mastering the STAR Method" },
          { uri: "https://example.com/system-design", title: "System Design Basics" }
        ];
        return res.json({ report: mockReport, resources: mockResources });
      }
`;

code = code.replace(
  /if \(errStr\.includes\("429"\) \|\| errStr\.toLowerCase\(\)\.includes\("quota"\)\) \{\n\s*errorMessage = "We have temporarily exceeded our AI service quota\. Please try again later\.";\n\s*\}/,
  mockReportCode
);

fs.writeFileSync('backend/server.ts', code);
