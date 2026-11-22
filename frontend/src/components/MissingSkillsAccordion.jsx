import { useState } from "react";
import { getSkillLearningResources } from "../utils/learningResources";
import "./MissingSkillsAccordion.css";

function MissingSkillsAccordion({
  skills = [],
  title = "Skills You Are Missing",
  subtitle = "Click on any skill to explore verified GeeksforGeeks articles and YouTube tutorials.",
}) {
  // Store set of open skill names
  const [expandedSkills, setExpandedSkills] = useState({});

  if (!skills || skills.length === 0) {
    return null;
  }

  const toggleSkill = (skill) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skill]: !prev[skill],
    }));
  };

  return (
    <div className="missing-skills-accordion-card">
      <div className="accordion-section-header">
        <div className="accordion-title-row">
          <span className="accordion-badge">💡 Recommended Target Skills</span>
          <h3 className="accordion-main-title">{title}</h3>
          {subtitle && <p className="accordion-subtitle">{subtitle}</p>}
        </div>
        <span className="skills-count-pill">{skills.length} skills to learn</span>
      </div>

      <div className="skills-accordion-list">
        {skills.map((skill) => {
          const isExpanded = Boolean(expandedSkills[skill]);
          const resources = getSkillLearningResources(skill);

          return (
            <div
              key={skill}
              className={`skill-accordion-item ${isExpanded ? "expanded" : ""}`}
            >
              {/* Header Button: [ Skill Name +/- ] */}
              <button
                type="button"
                className="skill-accordion-header"
                onClick={() => toggleSkill(skill)}
                aria-expanded={isExpanded}
              >
                <div className="skill-name-group">
                  <span className="skill-bullet-icon">⚡</span>
                  <span className="skill-label">{skill}</span>
                </div>

                <div className="skill-toggle-indicator">
                  <span className="toggle-symbol">{isExpanded ? "−" : "+"}</span>
                </div>
              </button>

              {/* Expandable Section: Learning Resources */}
              {isExpanded && (
                <div className="skill-accordion-body">
                  <div className="learning-resources-label">
                    <span className="books-icon">📚</span>
                    <span>Learning Resources</span>
                  </div>

                  <div className="skill-resources-options">
                    {resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`resource-option-link ${
                          res.platform === "GeeksforGeeks"
                            ? "link-gfg"
                            : "link-youtube"
                        }`}
                      >
                        <div className="resource-platform-tag">
                          {res.platform === "GeeksforGeeks" ? (
                            <>
                              <span className="platform-icon">💻</span>
                              <span>GeeksforGeeks</span>
                            </>
                          ) : (
                            <>
                              <span className="platform-icon">▶</span>
                              <span>YouTube</span>
                            </>
                          )}
                        </div>

                        <div className="resource-info">
                          <h4 className="resource-name">{res.title}</h4>
                          <p className="resource-desc">{res.description}</p>
                        </div>

                        <span className="external-arrow">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MissingSkillsAccordion;
