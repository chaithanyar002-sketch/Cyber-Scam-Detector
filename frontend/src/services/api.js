// All detection logic lives in the backend; the frontend only calls the API.
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Anonymous per-device id: keeps each person's history private on a shared public backend.
const clientId = () => {
  try {
    let id = localStorage.getItem("scam-client-id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("scam-client-id", id); }
    return id;
  } catch { return "no-storage-" + Math.random().toString(36).slice(2, 12); }
};

const call = async (path, body, extraHeaders = {}) => {
  const headers = { "X-Client-Id": clientId(), ...extraHeaders };
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(BASE + path, body ? { method: "POST", headers, body: JSON.stringify(body) } : { headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
};
export const predict = (text) => call("/predict", { text });
export const explain = (text) => call("/explain", { text });
export const sendFeedback = (text, level, correct) => call("/feedback", { text, level, correct });
export const getLogs = (limit = 50) => call(`/logs?limit=${limit}`);
export const getStatus = () => call("/status");
export const getHealth = () => call("/health");
export const train = (adminToken = "") => call("/train", {}, adminToken ? { "X-Admin-Token": adminToken } : {});
