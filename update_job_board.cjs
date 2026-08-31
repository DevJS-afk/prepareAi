const fs = require('fs');

let content = fs.readFileSync('src/components/JobBoard.tsx', 'utf-8');

// Add start state
content = content.replace(
  'const [typeQuery, setTypeQuery] = useState("");',
  'const [typeQuery, setTypeQuery] = useState("");\n  const [startOffset, setStartOffset] = useState(0);\n  const [isLoadingMore, setIsLoadingMore] = useState(false);'
);

// Modify fetchJobs to accept append boolean
content = content.replace(
  'const fetchJobs = async (q: string, l: string, c: string, level: string, type: string) => {',
  'const fetchJobs = async (q: string, l: string, c: string, level: string, type: string, isLoadMore: boolean = false) => {'
);

content = content.replace(
  'setIsLoading(true);',
  'if (isLoadMore) setIsLoadingMore(true); else setIsLoading(true);'
);

content = content.replace(
  'const jobsResult = await fetchJobsFrontEnd(q, l, c, level, type);',
  'const newStartOffset = isLoadMore ? startOffset + 30 : 0;\n        const jobsResult = await fetchJobsFrontEnd(q, l, c, level, type, newStartOffset);\n        if (isLoadMore) setStartOffset(newStartOffset); else setStartOffset(0);'
);

content = content.replace(
  'setJobs([...filteredFirestoreJobs, ...scrapedJobs]);',
  'if (isLoadMore) {\n        setJobs(prev => [...prev, ...scrapedJobs]);\n      } else {\n        setJobs([...filteredFirestoreJobs, ...scrapedJobs]);\n      }'
);

content = content.replace(
  'setIsLoading(false);',
  'setIsLoading(false);\n      setIsLoadingMore(false);'
);

content = content.replace(
  'const handleSearch = (e: React.FormEvent) => {\n    e.preventDefault();\n    fetchJobs(searchQuery, locationQuery, companyQuery, levelQuery, typeQuery);\n  };',
  'const handleSearch = (e: React.FormEvent) => {\n    e.preventDefault();\n    fetchJobs(searchQuery, locationQuery, companyQuery, levelQuery, typeQuery, false);\n  };\n\n  const handleLoadMore = () => {\n    fetchJobs(searchQuery, locationQuery, companyQuery, levelQuery, typeQuery, true);\n  };'
);

// Add Load More button
content = content.replace(
  '</div>\n      )}\n\n      {/* Recruiter Job Details Modal */}',
  `</div>\n      )}\n\n      {jobs.length > 0 && !isLoading && (\n        <div className="mt-8 flex justify-center">\n          <button\n            onClick={handleLoadMore}\n            disabled={isLoadingMore}\n            className="px-6 py-3 bg-brand-purple hover:bg-purple-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"\n          >\n            {isLoadingMore ? (\n              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Loading...</>\n            ) : (\n              "Load More Jobs"\n            )}\n          </button>\n        </div>\n      )}\n\n      {/* Recruiter Job Details Modal */}`
);

fs.writeFileSync('src/components/JobBoard.tsx', content);
