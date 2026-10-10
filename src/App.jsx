import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import ResumeUpload from "./pages/ResumeUpload.jsx";
import JobMatcher from "./pages/JobMatcher.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import Assistant from "./pages/Assistant.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="/job-matcher" element={<JobMatcher />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
