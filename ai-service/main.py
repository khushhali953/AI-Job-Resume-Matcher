import re
import fitz
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI(title="AI Resume Analyzer")

SKILLS = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift",
    # Frontend
    "React", "Next.js", "Vue", "Angular", "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Redux",
    # Backend
    "Node.js", "Express.js", "FastAPI", "Django", "Flask", "Spring Boot", ".NET",
    # Databases
    "MongoDB", "SQL", "PostgreSQL", "MySQL", "Redis", "SQLite", "Firebase",
    # Cloud & DevOps
    "AWS", "Docker", "Kubernetes", "Git", "GitHub", "GitLab", "CI/CD", "Linux", "Azure", "GCP",
    # AI / ML / Data
    "Machine Learning", "Deep Learning", "Data Structures", "Algorithms", "REST API", "GraphQL",
    "Pandas", "NumPy", "TensorFlow", "PyTorch", "NLP"
]


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text_parts = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
        for page in pdf:
            text_parts.append(page.get_text())
    return "\n".join(text_parts).strip()


def analyze_resume_text(text: str) -> dict:
    found_skills = []

    for skill in SKILLS:
        escaped_skill = re.escape(skill)
        pattern = rf"(?<![\w#+]){escaped_skill}(?![\w#+])"
        if re.search(pattern, text, re.IGNORECASE):
            if skill not in found_skills:
                found_skills.append(skill)

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # 1. Precise Section Heading Detection
    # Education
    edu_pattern = r"^\s*(education|academics?|academic\s+background|qualifications?|educational\s+qualifications?)\s*$"
    has_edu = any(re.match(edu_pattern, l, re.IGNORECASE) for l in lines)
    if not has_edu:
        has_edu = bool(re.search(r"\b(bachelors?|masters?|b\.tech|b\.e\.|m\.tech|bca|mca)\s+(degree|in|from)?\b", text, re.IGNORECASE))

    # Projects
    proj_pattern = r"^\s*(projects?|academic\s+projects?|personal\s+projects?|key\s+projects?)\s*$"
    has_proj = any(re.match(proj_pattern, l, re.IGNORECASE) for l in lines)
    if not has_proj:
        has_proj = bool(re.search(r"\b(academic|personal|key)\s+projects\b", text, re.IGNORECASE))

    # Experience - Must be an isolated heading or explicit 'work/professional experience' phrase.
    # Exclude phrases like 'user experience', 'customer experience', 'experience with...'
    exp_heading_pattern = r"^\s*(work\s+experience|professional\s+experience|experience|employment(\s+history)?|work\s+history|internships?|relevant\s+experience)\s*$"
    has_exp = any(re.match(exp_heading_pattern, l, re.IGNORECASE) for l in lines)
    if not has_exp:
        # Strict fallback: only match explicit 'work experience', 'professional experience', or 'employment history'
        has_exp = bool(re.search(r"\b(work\s+experience|professional\s+experience|employment\s+history|work\s+history)\b", text, re.IGNORECASE))

    sections = {
        "education": has_edu,
        "experience": has_exp,
        "projects": has_proj,
    }

    # 2. Calculate AI Resume Score (0 - 100)
    score = 30
    # Skills contribution: up to 35 points
    score += min(len(found_skills) * 4, 35)
    # Sections contribution:
    if sections["education"]:
        score += 10
    if sections["experience"]:
        score += 15
    if sections["projects"]:
        score += 10
    # Text length / completeness bonus:
    if len(text.split()) > 100:
        score += 5

    score = min(max(score, 25), 98)

    # 3. Actionable Suggestions & Recommendations
    recommendations = []
    if not sections["experience"]:
        recommendations.append(
            "💼 **Add Practical Experience**: Your resume does not list any formal Work Experience or Internships. To boost recruiter interest, actively seek software internships, freelance projects, or contribute to open-source programs (like GSoC or Hacktoberfest)."
        )
    else:
        recommendations.append(
            "💼 **Highlight Professional Accomplishments**: Detail your roles using action verbs and emphasize outcomes you achieved during your tenure."
        )

    if sections["projects"]:
        recommendations.append(
            "🚀 **Add Live Demo & Code Links**: Ensure every project has a working live deployment URL (Vercel, Netlify, Render) alongside its GitHub repository link so recruiters can evaluate your code instantly."
        )
    else:
        recommendations.append(
            "🚀 **Add Standout Technical Projects**: Showcase at least 2-3 full-stack or backend projects demonstrating real-world problem solving."
        )

    recommendations.append(
        "⚡ **Quantify Your Impact**: Use metrics in your bullet points (e.g., 'Optimized API response time by 35%' or 'Served 1,000+ active sessions') rather than generic descriptions."
    )

    if "React" not in found_skills and "Angular" not in found_skills and "Vue" not in found_skills:
        recommendations.append(
            "🌐 **Learn Modern Frontend**: You have HTML/CSS/JavaScript foundations. Learning React or Next.js will significantly increase your full-stack job opportunities."
        )

    if "Docker" not in found_skills and "AWS" not in found_skills:
        recommendations.append(
            "☁️ **Adopt Cloud & DevOps Basics**: Familiarize yourself with Docker containerization and cloud hosting (AWS / GCP / Vercel) to stand out from other candidates."
        )

    # 4. Career Path Advice & Learning Roadmap
    has_web = any(s in found_skills for s in ["HTML", "CSS", "JavaScript", "Node.js", "Express.js", "React"])
    has_prog = any(s in found_skills for s in ["Java", "C++", "Python"])
    
    if has_web and has_prog:
        primary_role = "Full-Stack Software Engineer"
        match_percentage = 82 if sections["experience"] else 74
        path_summary = "You have a solid base in computer science programming (Java/Python) and web fundamentals. With targeted framework mastery and practical project deployment, you are primed for Junior Full-Stack Developer roles."
        missing_skills = [s for s in ["React", "PostgreSQL", "Docker", "REST API", "AWS"] if s not in found_skills][:4]
        roadmap = [
            {
                "step": 1,
                "title": "Master React & Modern State Management",
                "description": "Level up from vanilla JavaScript to React.js or Next.js. Master components, hooks, and responsive design with Tailwind CSS."
            },
            {
                "step": 2,
                "title": "Build Production-Ready Backend APIs",
                "description": "Deepen your Express/Node.js or Java Spring Boot knowledge. Implement secure JWT authentication, input validation, and relational databases (PostgreSQL/MySQL)."
            },
            {
                "step": 3,
                "title": "Containerization & Cloud Deployment",
                "description": "Dockerize your full-stack applications. Deploy your frontend to Vercel/Netlify and backend to AWS EC2 or Render with automated CI/CD."
            },
            {
                "step": 4,
                "title": "Secure Internships & DSA Interview Prep",
                "description": "Practice Data Structures & Algorithms (LeetCode 75 / Blind 75) in Java or Python, and apply for developer internships to build your first work experience."
            }
        ]
    elif has_prog:
        primary_role = "Backend Software Engineer"
        match_percentage = 78 if sections["experience"] else 70
        path_summary = "Your strong foundation in core languages makes you a strong candidate for backend software engineering and systems development."
        missing_skills = [s for s in ["Spring Boot", "SQL", "Docker", "REST API", "Microservices"] if s not in found_skills][:4]
        roadmap = [
            {
                "step": 1,
                "title": "Advanced Language Features & OOP",
                "description": "Master multithreading, collections, design patterns, and stream APIs in Java/C++."
            },
            {
                "step": 2,
                "title": "Database Optimization & System Design",
                "description": "Learn indexing, transactions (ACID), SQL query optimization, and basic caching with Redis."
            },
            {
                "step": 3,
                "title": "Microservices & Distributed Systems",
                "description": "Build RESTful microservices with Spring Boot or FastAPI, and integrate message queues (Kafka/RabbitMQ)."
            },
            {
                "step": 4,
                "title": "Internship Hunting & DSA Mastery",
                "description": "Consistently solve LeetCode medium problems and apply for backend internships and hackathons."
            }
        ]
    else:
        primary_role = "Frontend / Web Developer"
        match_percentage = 70
        path_summary = "Focus on modern frontend web development, responsive interfaces, and interactive user experiences."
        missing_skills = ["React", "TypeScript", "Tailwind CSS", "Git"]
        roadmap = [
            {"step": 1, "title": "Modern JavaScript & TypeScript", "description": "Deep dive into ES6+, async/await, and TypeScript types."},
            {"step": 2, "title": "Frontend Frameworks (React)", "description": "Build multi-page applications with React Router and state stores."},
            {"step": 3, "title": "UI Engineering & Performance", "description": "Implement clean responsive design and optimize lighthouse performance scores."},
            {"step": 4, "title": "Portfolio & Internship Applications", "description": "Create a stunning personal portfolio and apply for web developer internships."}
        ]

    career_path = {
        "primaryRole": primary_role,
        "matchPercentage": match_percentage,
        "summary": path_summary,
        "missingSkills": missing_skills,
        "roadmap": roadmap
    }

    return {
        "skills": found_skills,
        "totalSkillsFound": len(found_skills),
        "sectionsFound": sections,
        "score": score,
        "recommendations": recommendations,
        "careerPath": career_path,
    }


@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file",
        )

    pdf_bytes = await file.read()

    if not pdf_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file",
        )

    try:
        text = extract_text_from_pdf(pdf_bytes)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read this PDF",
        )

    if not text:
        raise HTTPException(
            status_code=422,
            detail="No selectable text found. This PDF may need OCR.",
        )

    analysis = analyze_resume_text(text)

    return {
        "filename": file.filename,
        "extractedText": text,
        "analysis": analysis,
    }