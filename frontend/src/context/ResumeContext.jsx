import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ResumeContext = createContext(null);

const API_BASE = "http://localhost:5000";

// Helper to get user-isolated storage keys
const getUserStorageKey = (prefix) => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    const id = user?._id || user?.id || user?.email;
    return id ? `${prefix}_${id}` : null;
  } catch {
    return null;
  }
};

export function ResumeProvider({ children }) {
  // 1. Resume State
  const [uploadedResume, setUploadedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [error, setError] = useState(null);

  // 2. Job Matcher State
  const [jobMatcherData, setJobMatcherState] = useState({
    selectedRole: "MERN Stack Developer",
    jobDescription: "",
    report: null,
  });

  // Save resume & analysis, syncing to user-specific sessionStorage
  const setResumeData = useCallback((resume, analysisData) => {
    setUploadedResume(resume || null);
    setAnalysis(analysisData || null);
    setError(null);

    const storageKey = getUserStorageKey("career_resume_cache");
    if (storageKey) {
      if (resume || analysisData) {
        try {
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              resume: resume || null,
              analysis: analysisData || null,
              savedAt: Date.now(),
            })
          );
        } catch (e) {
          console.warn("Could not save resume data to sessionStorage:", e);
        }
      } else {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, []);

  // Save Job Matcher state, syncing to user-specific sessionStorage
  const setJobMatcherData = useCallback((newData) => {
    setJobMatcherState((prev) => {
      const updated = typeof newData === "function" ? newData(prev) : { ...prev, ...newData };
      const storageKey = getUserStorageKey("career_job_matcher_cache");
      if (storageKey) {
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.warn("Could not save job matcher data to sessionStorage:", e);
        }
      }
      return updated;
    });
  }, []);

  // Clear Job Matcher state
  const clearJobMatcherData = useCallback(() => {
    setJobMatcherState({
      selectedRole: "MERN Stack Developer",
      jobDescription: "",
      report: null,
    });
    const storageKey = getUserStorageKey("career_job_matcher_cache");
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
  }, []);

  // Fetch the latest saved resume from the backend for the authenticated user
  const refreshLatestResume = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUploadedResume(null);
      setAnalysis(null);
      setLoadingResume(false);
      return null;
    }

    try {
      setLoadingResume(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/resumes/latest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch latest resume (Status: ${response.status})`);
      }

      const data = await response.json();

      if (data && data.resume) {
        setResumeData(data.resume, data.analysis || data.resume.analysis);
        return { resume: data.resume, analysis: data.analysis || data.resume.analysis };
      } else {
        // No resume found for this user
        setResumeData(null, null);
        return null;
      }
    } catch (err) {
      console.warn("Error fetching latest resume from backend:", err.message);
      setError(err.message);
      return null;
    } finally {
      setLoadingResume(false);
    }
  }, [setResumeData]);

  // Clear all cached state on logout to guarantee complete user isolation
  const clearResumeState = useCallback(() => {
    setUploadedResume(null);
    setAnalysis(null);
    setError(null);
    clearJobMatcherData();

    const resumeKey = getUserStorageKey("career_resume_cache");
    if (resumeKey) sessionStorage.removeItem(resumeKey);

    const jmKey = getUserStorageKey("career_job_matcher_cache");
    if (jmKey) sessionStorage.removeItem(jmKey);
  }, [clearJobMatcherData]);

  // Restore cached states on initial load, then sync with backend
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (isMounted) setLoadingResume(false);
        return;
      }

      // 1. Restore Resume data from user-specific sessionStorage
      const resumeStorageKey = getUserStorageKey("career_resume_cache");
      if (resumeStorageKey) {
        try {
          const cached = sessionStorage.getItem(resumeStorageKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (isMounted && parsed && (parsed.resume || parsed.analysis)) {
              setUploadedResume(parsed.resume || null);
              setAnalysis(parsed.analysis || null);
              setLoadingResume(false);
            }
          }
        } catch (e) {
          console.warn("Error parsing cached resume from sessionStorage:", e);
        }
      }

      // 2. Restore Job Matcher data from user-specific sessionStorage
      const jmStorageKey = getUserStorageKey("career_job_matcher_cache");
      if (jmStorageKey) {
        try {
          const cachedJm = sessionStorage.getItem(jmStorageKey);
          if (cachedJm) {
            const parsedJm = JSON.parse(cachedJm);
            if (isMounted && parsedJm) {
              setJobMatcherState((prev) => ({ ...prev, ...parsedJm }));
            }
          }
        } catch (e) {
          console.warn("Error parsing cached job matcher data from sessionStorage:", e);
        }
      }

      // 3. Fetch fresh resume data from backend to ensure synchronization with MongoDB
      try {
        const response = await fetch(`${API_BASE}/api/resumes/latest`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok && isMounted) {
          const data = await response.json();
          if (data && data.resume) {
            setResumeData(data.resume, data.analysis || data.resume.analysis);
          } else if (data && !data.resume) {
            setResumeData(null, null);
          }
        }
      } catch (err) {
        console.warn("Background resume sync error:", err.message);
      } finally {
        if (isMounted) {
          setLoadingResume(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [setResumeData]);

  const value = {
    // Resume states
    uploadedResume,
    analysis,
    loadingResume,
    error,
    setResumeData,
    refreshLatestResume,
    clearResumeState,

    // Job Matcher states (Feature 1)
    jobMatcherData,
    setJobMatcherData,
    clearJobMatcherData,
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}
