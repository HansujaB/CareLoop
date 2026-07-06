const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  formData?: FormData;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.token) {
    headers["X-Caregiver-Token"] = options.token;
  }
  if (options.body && !options.formData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? (options.body || options.formData ? "POST" : "GET"),
    headers,
    body: options.formData ?? (options.body ? JSON.stringify(options.body) : undefined),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(typeof error.detail === "string" ? error.detail : "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  createProfile: (name: string) =>
    request<{ profile_id: string; name: string }>("/profiles", {
      method: "POST",
      body: { name },
    }),

  rememberText: (profileId: string, text: string) =>
    request(`/profiles/${profileId}/remember`, { body: { text } }),

  getHandover: (profileId: string) =>
    request<{ summary: string }>(`/profiles/${profileId}/handover`),

  chat: (profileId: string, question: string) =>
    request<{ answer: string }>(`/profiles/${profileId}/chat`, {
      body: { question },
    }),

  getEmergency: (profileId: string) =>
    request<{ content: string }>(`/profiles/${profileId}/emergency`),

  createLink: (profileId: string) =>
    request<{ link_id: string; token: string; url: string; status: string }>(
      `/profiles/${profileId}/links`,
      { method: "POST" },
    ),

  listLinks: (profileId: string) =>
    request<Array<{ link_id: string; token: string; url: string; status: string }>>(
      `/profiles/${profileId}/links`,
    ),

  revokeLink: (profileId: string, linkId: string) =>
    request(`/profiles/${profileId}/links/${linkId}`, { method: "DELETE" }),

  caregiverSession: (token: string, caregiverName: string) =>
    request("/caregiver/session", {
      body: { caregiver_name: caregiverName },
      token,
    }),

  caregiverHandover: (token: string) =>
    request<{ summary: string }>("/caregiver/handover", { token }),

  caregiverChat: (token: string, question: string) =>
    request<{ answer: string }>("/caregiver/chat", { body: { question }, token }),

  caregiverEmergency: (token: string) =>
    request<{ content: string }>("/caregiver/emergency", { token }),
};
