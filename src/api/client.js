import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export const uploadResume = (file, label) => {
  const form = new FormData();
  form.append("file", file);
  form.append("label", label || "My Resume");
  return api.post("/resume/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const listResumes = () => api.get("/resume/list").then((r) => r.data);
export const deleteResume = (id) => api.delete(`/resume/${id}`).then((r) => r.data);

export const analyzeJob = (payload) => api.post("/job/analyze", payload).then((r) => r.data);
export const listJobs = () => api.get("/job/list").then((r) => r.data);

export const runMatch = (resumeId, jobId) =>
  api.post("/analyze/match", { resume_id: resumeId, job_id: jobId }).then((r) => r.data);

export const getAnalysis = (id) => api.get(`/analysis/${id}`).then((r) => r.data);
export const getHistory = () => api.get("/analysis/history/all").then((r) => r.data);
export const updateRoadmapProgress = (analysisId, week, completed) =>
  api
    .patch(`/analysis/${analysisId}/roadmap-progress`, null, {
      params: { week, completed },
    })
    .then((r) => r.data);

export const runDemo = () => api.post("/demo/run").then((r) => r.data);

export const sendChatMessage = (resumeId, jobId, message) =>
  api.post("/chat/", { resume_id: resumeId, job_id: jobId, message }).then((r) => r.data);

export default api;
