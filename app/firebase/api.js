const BASE_URL = 'https://luctreporting-backend-production.up.railway.app/api';

// Store token in memory
let authToken = null;

export const setToken = (token) => {
  authToken = token;
};

export const getToken = () => authToken;

const headers = () => ({
  'Content-Type': 'application/json',
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
});

export const apiRegister = async (name, email, password, role) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, email, password, role })
  });
  return res.json();
};

export const apiLogin = async (uid, email) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ uid, email })
  });
  return res.json();
};

export const apiSubmitReport = async (reportData) => {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(reportData)
  });
  return res.json();
};

export const apiGetReports = async () => {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'GET',
    headers: headers()
  });
  return res.json();
};

export const apiGetMyReports = async () => {
  const res = await fetch(`${BASE_URL}/reports/my`, {
    method: 'GET',
    headers: headers()
  });
  return res.json();
};

export const apiGetUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'GET',
    headers: headers()
  });
  return res.json();
};

export const apiGetLecturers = async () => {
  const res = await fetch(`${BASE_URL}/users/role/lecturer`, {
    method: 'GET',
    headers: headers()
  });
  return res.json();
};

export const apiSubmitRating = async (reportId, rating) => {
  const res = await fetch(`${BASE_URL}/ratings`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ reportId, rating })
  });
  return res.json();
};

export const apiGetRatings = async () => {
  const res = await fetch(`${BASE_URL}/ratings`, {
    method: 'GET',
    headers: headers()
  });
  return res.json();
};

export const apiSubmitFeedback = async (reportId, comment) => {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ reportId, comment })
  });
  return res.json();
};

export const apiGetFeedback = async () => {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'GET',
    headers: headers()
  });
  return res.json();
};