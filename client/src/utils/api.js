async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Non-JSON response (e.g. Vite proxy 500 page when the backend is down)
    // falls through to the generic message — mapped to a helpful hint below.
    const err = new Error(data.message || "Request failed. Please try again.");
    err.details = data.errors;
    err.conflicts = data.conflicts;
    err.status = res.status;
    err.noJson = !data.message;
    throw err;
  }
  return data;
}

// Maps low-level / proxy failures to an actionable hint.
export function friendlyMessage(err) {
  const m = String(err?.message || "");
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(m)) {
    return "Cannot reach the server. Start the backend API (`npm --prefix server run dev`, port 5000) and try again.";
  }
  if (err?.noJson && (err?.status >= 500 || !err?.status)) {
    return "Cannot reach the server. Start the backend API (`npm --prefix server run dev`, port 5000) and try again.";
  }
  return m || "Something went wrong. Please try again.";
}

export async function submitRegistration(payload, apiBase = "") {
  const res = await fetch(`${apiBase}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// ── V2 portal ──
export async function registerStudent(payload, apiBase = "") {
  const res = await fetch(`${apiBase}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function adminLogin(username, password, apiBase = "") {
  const res = await fetch(`${apiBase}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handle(res);
}

export async function adminLogout(token, apiBase = "") {
  await fetch(`${apiBase}/api/admin/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchAdminStats(token, apiBase = "") {
  const res = await fetch(`${apiBase}/api/admin/stats`, { headers: authHeaders(token) });
  return handle(res);
}

export async function fetchAdminRegistrations(token, params = {}, apiBase = "") {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${apiBase}/api/admin/registrations${q ? `?${q}` : ""}`, {
    headers: authHeaders(token),
  });
  return handle(res);
}

export function adminExportUrl(token, apiBase = "") {
  return `${apiBase}/api/admin/export.csv?token=${encodeURIComponent(token)}`;
}

// ── Student self-service ──
export async function studentLogin(registerNumber, phone, apiBase = "") {
  const res = await fetch(`${apiBase}/api/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ registerNumber, phone }),
  });
  return handle(res);
}

export async function studentCreateProfile(profile, apiBase = "") {
  const res = await fetch(`${apiBase}/api/student/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return handle(res);
}

export async function studentLogout(token, apiBase = "") {
  await fetch(`${apiBase}/api/student/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export async function studentMe(token, apiBase = "") {
  const res = await fetch(`${apiBase}/api/student/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function studentUpdateMe(token, payload, apiBase = "") {
  const res = await fetch(`${apiBase}/api/student/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function studentRegisterEvents(token, payload, apiBase = "") {
  const res = await fetch(`${apiBase}/api/student/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function studentCancelRegistration(token, eventId, apiBase = "") {
  const res = await fetch(`${apiBase}/api/student/registrations/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function fetchRegistrations(params = {}, apiBase = "") {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${apiBase}/api/registrations${q ? `?${q}` : ""}`);
  if (!res.ok) throw new Error("Failed to load registrations");
  return res.json();
}
