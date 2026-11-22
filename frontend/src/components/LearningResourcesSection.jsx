import { useState, useMemo } from "react";
import { identifyTopicsFromRecommendations } from "../utils/learningResources";
import "./ResourcesSection.css";

function LearningResourcesSection({ recommendations = [], missingSkills = [] }) {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const topicGroups = useMemo(() => {
    return identifyTopicsFromRecommendations(recommendations, missingSkills);
  }, [recommendations, missingSkills]);

  if (!topicGroups || topicGroups.length === 0) {
    return null;
  }

  // Count total resources
  const allResources = topicGroups.flatMap((group) =>
    group.resources.map((res) => ({ ...res, topic: group.topic }))
  );

  const filteredResources =
    selectedFilter === "All"
      ? allResources
      : allResources.filter((r) => r.type === selectedFilter);

  const getBadgeClass = (type) => {
    if (type === "YouTube") return "badge-youtube";
    if (type === "GeeksforGeeks") return "badge-gfg";
    return "badge-docs";
  };

  const getIcon = (type) => {
    if (type === "YouTube") return "▶";
    if (type === "GeeksforGeeks") return "💻";
    return "📘";
  };

  return (
    <section className="learning-resources-section" id="learning-resources">
      <div className="learning-header">
        <div className="header-left">
          <span className="learning-eyebrow">Actionable Career Advancement</span>
          <h2>Explore Learning Resources & Tutorials</h2>
          <p>
            Master the skills recommended for your profile with verified official documentation,
            GeeksforGeeks guides, and YouTube tutorials.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="resource-filters">
          {["All", "Official Documentation", "GeeksforGeeks", "YouTube"].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill ${selectedFilter === filter ? "active" : ""}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter === "All" ? `All (${allResources.length})` : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped by Topic or Filtered List */}
      {selectedFilter === "All" ? (
        <div className="topics-container">
          {topicGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="topic-block">
              <div className="topic-title-bar">
                <span className="topic-dot"></span>
                <h3 className="topic-name">{group.topic}</h3>
                <span className="topic-hint">{group.recommendationHint}</span>
              </div>

              <div className="resource-cards-grid">
                {group.resources.map((res, resIdx) => (
                  <div key={resIdx} className="resource-card">
                    <div className="card-top">
                      <span className={`resource-type-badge ${getBadgeClass(res.type)}`}>
                        <span className="badge-icon">{getIcon(res.type)}</span>
                        {res.type}
                      </span>
                    </div>

                    <h4 className="resource-title">{res.title}</h4>
                    <p className="resource-desc">{res.description}</p>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link-btn"
                    >
                      Open Resource <span className="arrow-icon">↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="resource-cards-grid filtered-view">
          {filteredResources.map((res, idx) => (
            <div key={idx} className="resource-card">
              <div className="card-top">
                <span className={`resource-type-badge ${getBadgeClass(res.type)}`}>
                  <span className="badge-icon">{getIcon(res.type)}</span>
                  {res.type}
                </span>
                <span className="card-topic-tag">{res.topic}</span>
              </div>

              <h4 className="resource-title">{res.title}</h4>
              <p className="resource-desc">{res.description}</p>

              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-link-btn"
              >
                Open Resource <span className="arrow-icon">↗</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LearningResourcesSection;
