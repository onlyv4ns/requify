const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type Prd = {
  id: number;
  user_id: number;
  title: string;
  prompt: string;
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
  content: string;
  share_token: string | null;
  can_undo: boolean;
  created_at: string;
  updated_at: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    throw new Error((await res.text()) || `Request failed: ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export function listPrds() {
  return request<Prd[]>("/api/prds");
}

export function getPrd(id: string) {
  return request<Prd>(`/api/prds/${id}`);
}

export function deletePrd(id: string) {
  return request<void>(`/api/prds/${id}`, { method: "DELETE" });
}

export type Provider = "api" | "claude_code";

export const PROVIDERS: { value: Provider; label: string; hint: string }[] = [
  { value: "api", label: "API Key", hint: "Uses the Anthropic API key on the server" },
  { value: "claude_code", label: "Claude Code", hint: "Uses the Claude Code CLI logged in on the server" },
];

export function editPrd(id: string, instruction: string, provider: Provider = "api") {
  return request<Prd>(`/api/prds/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ instruction, provider }),
  });
}

export function undoPrd(id: string) {
  return request<Prd>(`/api/prds/${id}/undo`, { method: "POST" });
}

export function askPrd(id: string, question: string, provider: Provider = "api") {
  return request<{ answer: string }>(`/api/prds/${id}/ask`, {
    method: "POST",
    body: JSON.stringify({ question, provider }),
  });
}

export type TechStack = {
  frontend?: string;
  backend?: string;
  database?: string;
  deployment?: string;
};

export function generatePrd(
  title: string,
  prompt: string,
  provider: Provider = "api",
  stack: TechStack = {}
) {
  return request<Prd>("/api/prds", {
    method: "POST",
    body: JSON.stringify({ title, prompt, provider, ...stack }),
  });
}

export type AuthUser = { id: number; email: string; name: string };

export function me() {
  return request<AuthUser>("/api/auth/me");
}

export function login(email: string, password: string) {
  return request<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return request<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  return fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
}

export type Revision = { id: number; created_at: string };
export type RevisionDetail = { id: number; content: string; created_at: string };

export function listRevisions(id: string) {
  return request<Revision[]>(`/api/prds/${id}/revisions`);
}

export function getRevision(id: string, revisionId: number) {
  return request<RevisionDetail>(`/api/prds/${id}/revisions/${revisionId}`);
}

export function restoreRevision(id: string, revisionId: number) {
  return request<Prd>(`/api/prds/${id}/revisions/${revisionId}/restore`, { method: "POST" });
}

export function duplicatePrd(id: string) {
  return request<Prd>(`/api/prds/${id}/duplicate`, { method: "POST" });
}

export function sharePrd(id: string) {
  return request<{ share_token: string }>(`/api/prds/${id}/share`, { method: "POST" });
}

export function unsharePrd(id: string) {
  return request<void>(`/api/prds/${id}/share`, { method: "DELETE" });
}

export function getSharedPrd(token: string) {
  return request<Prd>(`/api/public/prds/${token}`);
}
