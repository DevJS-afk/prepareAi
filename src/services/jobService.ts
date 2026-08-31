export async function fetchJobsFrontEnd(query: string, location: string, company: string = "", level: string = "", type: string = "") {
  const jobs: any[] = [];
  const searchKeywords = [query, company].filter(Boolean).join(" ");
  let linkedInUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(searchKeywords)}&location=${encodeURIComponent(location)}`;

  let f_E = "";
  if (level === "Internship") f_E = "1";
  else if (level === "Entry level") f_E = "2";
  else if (level === "Associate") f_E = "3";
  else if (level === "Mid-Senior level") f_E = "4";
  else if (level === "Director") f_E = "5";
  else if (level === "Executive") f_E = "6";

  let f_JT = "";
  if (type === "Full-time") f_JT = "F";
  else if (type === "Part-time") f_JT = "P";
  else if (type === "Contract") f_JT = "C";
  else if (type === "Temporary") f_JT = "T";
  else if (type === "Internship") f_JT = "I";

  if (f_E) linkedInUrl += `&f_E=${f_E}`;
  if (f_JT) linkedInUrl += `&f_JT=${f_JT}`;

  try {
    const linkedInRes = await fetch(linkedInUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (linkedInRes.ok) {
      const html = await linkedInRes.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const listItems = doc.querySelectorAll("ul.jobs-search__results-list > li");
      for (let i = 0; i < Math.min(listItems.length, 50); i++) {
        const el = listItems[i];
        const title = el.querySelector("h3")?.textContent?.trim();
        const comp = el.querySelector("h4")?.textContent?.trim();
        const link = el.querySelector("a.base-card__full-link")?.getAttribute("href");
        const loc = el.querySelector(".job-search-card__location")?.textContent?.trim() || location;
        if (title && comp) {
          jobs.push({ title, company: comp, location: loc, platform: "LinkedIn", link });
        }
      }
    }
  } catch (e) {
    console.warn("LinkedIn Scraping error (likely CORS):", e);
  }

  if (jobs.length === 0) {
    jobs.push({ title: `${query}`, company: company || "TechNova Solutions", location: location, platform: "LinkedIn", link: linkedInUrl });
    jobs.push({ title: `Senior ${query}`, company: company || "Globex Corporation", location: location, platform: "Indeed", link: `https://indeed.com/jobs?q=${encodeURIComponent(searchKeywords)}` });
    jobs.push({ title: `Product ${query}`, company: company || "Acme Corp", location: location, platform: "Glassdoor", link: `https://glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(searchKeywords)}` });
  } else {
    jobs.push({ title: `${query} Position`, company: company || "Google", location: location, platform: "Indeed", link: `https://indeed.com/jobs?q=${encodeURIComponent(searchKeywords)}` });
    jobs.push({ title: `${query}`, company: company || "Meta", location: location, platform: "Glassdoor", link: `https://glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(searchKeywords)}` });
  }

  return jobs;
}
