const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

/**
 * Upload a file via XMLHttpRequest.
 * React Native's Hermes fetch throws "Unsupported FormDataPart implementation"
 * when you attach a { uri, name, type } part, but XHR handles it correctly.
 */
function uploadFile<T>(
  path: string,
  fileUri: string,
  fieldName: string,
  fileName: string,
  mimeType: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${path}`);
    xhr.responseType = "text";

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText) as Record<string, unknown>;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload as T);
        } else {
          const detail = typeof payload.detail === "string" ? payload.detail : "Request failed";
          reject(new Error(detail));
        }
      } catch {
        reject(new Error("Invalid JSON response from server"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error — could not reach server"));
    xhr.ontimeout = () => reject(new Error("Request timed out"));
    xhr.timeout = 60_000;

    const formData = new FormData();
    // React Native accepts { uri, name, type } as a valid file part for XHR
    (formData as unknown as { append(k: string, v: unknown): void }).append(
      fieldName,
      { uri: fileUri, name: fileName, type: mimeType },
    );
    xhr.send(formData);
  });
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;   // X-Caregiver-Token
  uid?: string;     // X-Firebase-UID
  formData?: FormData;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.token) {
    headers["X-Caregiver-Token"] = options.token;
  }
  if (options.uid) {
    headers["X-Firebase-UID"] = options.uid;
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

export type CaregiverLink = {
  link_id: string;
  token: string;
  url: string;
  status: string;
  caregiver_name: string | null;
  locked_ip: string | null;
};

export const api = {
  createProfile: (name: string, uid: string) =>
    request<{ profile_id: string; name: string }>("/profiles", {
      method: "POST",
      body: { name },
      uid,
    }),

  getProfileByUid: (uid: string) =>
    request<{ profile_id: string; name: string } | null>("/profiles/mine", {
      uid,
    }),

  rememberText: (profileId: string, text: string) =>
    request(`/profiles/${profileId}/remember`, { body: { text } }),

  /** Upload a recorded audio file URI and get back the Whisper transcript. */
  transcribeVoice: (profileId: string, fileUri: string) =>
    uploadFile<{ text: string }>(
      `/profiles/${profileId}/transcribe`,
      fileUri,
      "audio",
      "recording.m4a",
      "audio/m4a",
    ),

  getHandover: (profileId: string) =>
    request<{ summary: string }>(`/profiles/${profileId}/handover`),

  chat: (profileId: string, question: string) =>
    request<{ answer: string }>(`/profiles/${profileId}/chat`, {
      body: { question },
    }),

  getEmergency: (profileId: string) =>
    request<{ content: string }>(`/profiles/${profileId}/emergency`),

  createLink: (profileId: string) =>
    request<CaregiverLink>(
      `/profiles/${profileId}/links`,
      { method: "POST" },
    ),

  listLinks: (profileId: string) =>
    request<CaregiverLink[]>(
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

  /**
   * Upload a PDF or image file as a medical record.
   * Uses XHR (not fetch) so React Native / Hermes can attach the file part.
   * The backend runs OCR, cleans the text with Groq, and saves it to Mem0.
   */
  uploadMedicalRecord: (
    profileId: string,
    uid: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
  ) => {
    const xhr = new XMLHttpRequest();
    const url = `${BASE_URL}/profiles/${profileId}/upload`;
    return new Promise<{ ok: boolean; message: string; ocr_chars: number }>(
      (resolve, reject) => {
        xhr.open("POST", url);
        xhr.setRequestHeader("X-Firebase-UID", uid);
        xhr.responseType = "text";
        xhr.timeout = 120_000; // OCR + Groq can take a while

        xhr.onload = () => {
          try {
            const payload = JSON.parse(xhr.responseText) as Record<string, unknown>;
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(payload as { ok: boolean; message: string; ocr_chars: number });
            } else {
              const detail =
                typeof payload.detail === "string" ? payload.detail : "Upload failed";
              reject(new Error(detail));
            }
          } catch {
            reject(new Error("Invalid response from server"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error — could not reach server"));
        xhr.ontimeout = () =>
          reject(new Error("Upload timed out. The file may be too large or OCR is slow."));

        const formData = new FormData();
        (formData as unknown as { append(k: string, v: unknown): void }).append("file", {
          uri: fileUri,
          name: fileName,
          type: mimeType,
        });
        xhr.send(formData);
      },
    );
  },
};
