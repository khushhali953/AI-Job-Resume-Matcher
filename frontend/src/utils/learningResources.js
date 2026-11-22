/**
 * Verified Learning Resources Database & Skill Extraction Engine
 * Provides canonical, verified links for GeeksforGeeks and YouTube per skill.
 * Any unlisted skill uses guaranteed valid search URLs (never fabricated links).
 */

export const RESOURCE_DATABASE = {
  react: {
    skill: "React",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn React fundamentals and concepts",
      url: "https://www.geeksforgeeks.org/reactjs-tutorial/",
      description: "Master React JSX, components, state, props, hooks (useState, useEffect), and virtual DOM architecture.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a React tutorial",
      url: "https://www.youtube.com/results?search_query=react+js+tutorial+full+course",
      description: "Hands-on video course building interactive single-page applications with React and modern hooks.",
    },
  },

  "node.js": {
    skill: "Node.js",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Node.js backend fundamentals",
      url: "https://www.geeksforgeeks.org/nodejs/",
      description: "Understand the V8 engine, event loop, asynchronous I/O, file systems, and server-side JavaScript.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Node.js tutorial",
      url: "https://www.youtube.com/results?search_query=nodejs+tutorial+for+beginners",
      description: "Build scalable web servers, handle HTTP requests, and create backend APIs from scratch.",
    },
  },

  mongodb: {
    skill: "MongoDB",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn MongoDB and NoSQL database concepts",
      url: "https://www.geeksforgeeks.org/mongodb-tutorial/",
      description: "Learn document modeling, CRUD operations, indexing, aggregation pipelines, and Mongoose ORM.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a MongoDB tutorial",
      url: "https://www.youtube.com/results?search_query=mongodb+tutorial+for+beginners",
      description: "Complete video walkthrough covering database design, MongoDB Atlas setup, and Express integration.",
    },
  },

  javascript: {
    skill: "JavaScript",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn JavaScript fundamentals and ES6+",
      url: "https://www.geeksforgeeks.org/javascript/",
      description: "Master closures, event loop, Promises, async/await, DOM manipulation, and modern JavaScript syntax.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a JavaScript tutorial",
      url: "https://www.youtube.com/results?search_query=javascript+tutorial+full+course",
      description: "Complete video tutorial covering core language features and hands-on coding exercises.",
    },
  },

  "express.js": {
    skill: "Express.js",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Express.js REST API development",
      url: "https://www.geeksforgeeks.org/express-js/",
      description: "Learn routing, middleware functions, request validation, authentication, and error handling.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch an Express.js tutorial",
      url: "https://www.youtube.com/results?search_query=express+js+tutorial",
      description: "Build production-ready RESTful web services and API endpoints with Node.js and Express.",
    },
  },

  sql: {
    skill: "SQL",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn SQL queries and relational databases",
      url: "https://www.geeksforgeeks.org/sql-tutorial/",
      description: "Master table joins, subqueries, group by, indexing, normalization, and ACID database transactions.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a SQL tutorial",
      url: "https://www.youtube.com/results?search_query=sql+full+course+database",
      description: "Comprehensive database design, schema design, and complex query writing video course.",
    },
  },

  docker: {
    skill: "Docker",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Docker and containerization concepts",
      url: "https://www.geeksforgeeks.org/docker-tutorial/",
      description: "Understand Dockerfiles, images, containers, volumes, networking, and multi-container Compose setups.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Docker tutorial",
      url: "https://www.youtube.com/results?search_query=docker+tutorial+for+beginners",
      description: "Step-by-step video guide to containerizing web applications and managing container deployments.",
    },
  },

  aws: {
    skill: "AWS",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn AWS cloud computing fundamentals",
      url: "https://www.geeksforgeeks.org/aws-tutorial/",
      description: "Explore EC2 compute instances, S3 storage, Lambda serverless functions, and cloud architecture.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch an AWS tutorial",
      url: "https://www.youtube.com/results?search_query=aws+cloud+practitioner+tutorial",
      description: "Hands-on video guide to core AWS services and hosting full-stack applications in the cloud.",
    },
  },

  "data structures": {
    skill: "Data Structures & Algorithms",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Data Structures & Algorithms (DSA)",
      url: "https://www.geeksforgeeks.org/data-structures/",
      description: "Master arrays, linked lists, trees, graphs, heaps, hash maps, sorting, and dynamic programming.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Data Structures & Algorithms tutorial",
      url: "https://www.youtube.com/results?search_query=data+structures+and+algorithms+full+course",
      description: "Visual algorithm walkthroughs and coding interview problem solving on LeetCode and GFG.",
    },
  },

  git: {
    skill: "Git",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Git and GitHub version control",
      url: "https://www.geeksforgeeks.org/git-tutorial/",
      description: "Master commits, branch workflows, merge conflicts, pull requests, and remote repositories.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Git & GitHub tutorial",
      url: "https://www.youtube.com/results?search_query=git+and+github+tutorial",
      description: "Complete video walkthrough on collaborative version control for software development.",
    },
  },

  python: {
    skill: "Python",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Python programming language",
      url: "https://www.geeksforgeeks.org/python-programming-language/",
      description: "Master Python syntax, data structures, object-oriented programming, and backend frameworks.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Python tutorial",
      url: "https://www.youtube.com/results?search_query=python+programming+full+course",
      description: "Complete video tutorial from programming fundamentals to building real-world Python applications.",
    },
  },

  java: {
    skill: "Java",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Java programming and OOP",
      url: "https://www.geeksforgeeks.org/java/",
      description: "Master the 4 pillars of OOP, collections framework, multithreading, and JVM memory management.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Java tutorial",
      url: "https://www.youtube.com/results?search_query=java+programming+tutorial+full+course",
      description: "Enterprise Java programming, object-oriented software design, and coding interview prep.",
    },
  },

  typescript: {
    skill: "TypeScript",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn TypeScript static typing",
      url: "https://www.geeksforgeeks.org/typescript/",
      description: "Learn static types, interfaces, generics, type aliases, and integrating TypeScript with React & Node.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a TypeScript tutorial",
      url: "https://www.youtube.com/results?search_query=typescript+tutorial+full+course",
      description: "Practical video course adding type safety and developer productivity to JavaScript code.",
    },
  },

  "rest api": {
    skill: "REST API",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn RESTful API architecture",
      url: "https://www.geeksforgeeks.org/rest-api-introduction/",
      description: "Understand stateless HTTP requests, endpoints, status codes, query params, and JSON payloads.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a REST API tutorial",
      url: "https://www.youtube.com/results?search_query=rest+api+tutorial",
      description: "Video course designing and securing RESTful APIs with JWT tokens and best practices.",
    },
  },

  "spring boot": {
    skill: "Spring Boot",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Java Spring Boot framework",
      url: "https://www.geeksforgeeks.org/spring-boot/",
      description: "Build enterprise REST APIs with Spring Data JPA, IoC dependency injection, and Spring Security.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Spring Boot tutorial",
      url: "https://www.youtube.com/results?search_query=spring+boot+tutorial+for+beginners",
      description: "Full backend Java development building scalable microservices with Spring Boot.",
    },
  },

  postgresql: {
    skill: "PostgreSQL",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn PostgreSQL relational database",
      url: "https://www.geeksforgeeks.org/postgresql-tutorial/",
      description: "Master PostgreSQL tables, foreign keys, triggers, stored procedures, and query optimization.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a PostgreSQL tutorial",
      url: "https://www.youtube.com/results?search_query=postgresql+tutorial+for+beginners",
      description: "Complete hands-on database management and relational query writing in PostgreSQL.",
    },
  },

  kubernetes: {
    skill: "Kubernetes",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Kubernetes container orchestration",
      url: "https://www.geeksforgeeks.org/kubernetes/",
      description: "Understand Pods, Deployments, Services, Ingress, ConfigMaps, and cluster scalability.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Kubernetes tutorial",
      url: "https://www.youtube.com/results?search_query=kubernetes+tutorial+for+beginners",
      description: "Hands-on video guide to orchestrating microservices and managing cloud container clusters.",
    },
  },

  "tailwind css": {
    skill: "Tailwind CSS",
    gfg: {
      platform: "GeeksforGeeks",
      title: "Learn Tailwind CSS utility-first framework",
      url: "https://www.geeksforgeeks.org/tailwind-css/",
      description: "Speed up responsive web development using utility classes, flexbox, grid, and dark mode.",
    },
    youtube: {
      platform: "YouTube",
      title: "Watch a Tailwind CSS tutorial",
      url: "https://www.youtube.com/results?search_query=tailwind+css+tutorial",
      description: "Video tutorial creating stunning modern responsive websites with Tailwind CSS.",
    },
  },
};

/**
 * Get the GeeksforGeeks and YouTube resources for any given skill.
 * If not in database, generates guaranteed-valid search URLs.
 */
export function getSkillLearningResources(skillName) {
  if (!skillName) return [];

  const cleanName = skillName.trim();
  const lowerName = cleanName.toLowerCase();

  // Check direct or partial match in curated database
  let matched = RESOURCE_DATABASE[lowerName];
  if (!matched) {
    for (const [key, val] of Object.entries(RESOURCE_DATABASE)) {
      if (lowerName === key || lowerName.includes(key) || key.includes(lowerName)) {
        matched = val;
        break;
      }
    }
  }

  if (matched) {
    return [
      {
        platform: "GeeksforGeeks",
        title: matched.gfg.title,
        url: matched.gfg.url,
        description: matched.gfg.description,
      },
      {
        platform: "YouTube",
        title: matched.youtube.title,
        url: matched.youtube.url,
        description: matched.youtube.description,
      },
    ];
  }

  // Fallback: Generate guaranteed valid search URLs for that specific skill
  const encoded = encodeURIComponent(cleanName);
  return [
    {
      platform: "GeeksforGeeks",
      title: `Learn ${cleanName} on GeeksforGeeks`,
      url: `https://www.geeksforgeeks.org/search/?q=${encoded}`,
      description: `Read verified articles, tutorials, and practical implementation examples for ${cleanName}.`,
    },
    {
      platform: "YouTube",
      title: `Watch a ${cleanName} tutorial`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanName + " tutorial full course")}`,
      description: `Watch hands-on video tutorials, code walkthroughs, and practical projects for ${cleanName}.`,
    },
  ];
}

/**
 * Extract missing skills dynamically from resume analysis & recommendations
 * Excludes any skills that the candidate already has in analysis.skills!
 */
export function extractMissingSkills(analysis, targetRoleSkills = []) {
  if (!analysis) return [];

  // Set of skills the candidate already possesses (lowercase for exact matching)
  const existingSkills = new Set(
    (analysis.skills || []).map((s) => s.toLowerCase().trim())
  );

  const missingList = [];
  const addedKeys = new Set();

  const addMissingIfNew = (rawSkill) => {
    if (!rawSkill) return;
    const clean = rawSkill.trim();
    const lower = clean.toLowerCase();

    // MUST NOT be already present in resume skills!
    if (existingSkills.has(lower)) return;
    if (addedKeys.has(lower)) return;

    addedKeys.add(lower);
    missingList.push(clean);
  };

  // 1. From Career Path missing skills (already calculated by AI)
  if (analysis.careerPath && Array.isArray(analysis.careerPath.missingSkills)) {
    analysis.careerPath.missingSkills.forEach(addMissingIfNew);
  }

  // 2. From recommendations text (extract key technologies mentioned)
  const recommendationTriggers = [
    { name: "React", regex: /\b(react|react\.js)\b/i },
    { name: "Node.js", regex: /\b(node\.js|nodejs)\b/i },
    { name: "MongoDB", regex: /\b(mongodb|nosql)\b/i },
    { name: "Docker", regex: /\b(docker|containerization)\b/i },
    { name: "AWS", regex: /\b(aws|cloud hosting)\b/i },
    { name: "SQL", regex: /\b(sql|postgresql|mysql)\b/i },
    { name: "Express.js", regex: /\b(express\.js|express)\b/i },
    { name: "TypeScript", regex: /\b(typescript)\b/i },
    { name: "Data Structures & Algorithms", regex: /\b(data structures|algorithms|dsa)\b/i },
    { name: "Git", regex: /\b(git|github|version control)\b/i },
    { name: "Next.js", regex: /\b(next\.js|nextjs)\b/i },
    { name: "Spring Boot", regex: /\b(spring boot)\b/i },
    { name: "PostgreSQL", regex: /\b(postgresql)\b/i },
  ];

  (analysis.recommendations || []).forEach((rec) => {
    recommendationTriggers.forEach(({ name, regex }) => {
      if (regex.test(rec)) {
        addMissingIfNew(name);
      }
    });
  });

  // 3. From any target role skills passed (e.g., from Job Matcher)
  (targetRoleSkills || []).forEach(addMissingIfNew);

  return missingList;
}
