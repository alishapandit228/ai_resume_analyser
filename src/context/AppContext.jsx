import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [resume, setResume] = useState(null);       // { id, label, parsed_data, ... }
  const [job, setJob] = useState(null);              // { id, title, company, parsed_data }
  const [analysis, setAnalysis] = useState(null);    // full AnalysisResult

  const reset = () => {
    setResume(null);
    setJob(null);
    setAnalysis(null);
  };

  return (
    <AppContext.Provider
      value={{ resume, setResume, job, setJob, analysis, setAnalysis, reset }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
