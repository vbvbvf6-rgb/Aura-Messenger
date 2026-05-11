export interface SavedAccount {
  userId: number;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string;
  token?: string;
}

const KEY = "pulse-accounts";
export const MAX_ACCOUNTS = 3;

export function getSavedAccounts(): SavedAccount[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveAccount(account: SavedAccount) {
  const accounts = getSavedAccounts();
  const idx = accounts.findIndex(a => a.userId === account.userId);
  if (idx >= 0) {
    accounts[idx] = account;
  } else if (accounts.length < MAX_ACCOUNTS) {
    accounts.push(account);
  }
  localStorage.setItem(KEY, JSON.stringify(accounts));
}

export function removeAccount(userId: number) {
  const accounts = getSavedAccounts().filter(a => a.userId !== userId);
  localStorage.setItem(KEY, JSON.stringify(accounts));
}

export function getActiveToken(): string | null {
  return sessionStorage.getItem("pulse-token");
}

export function setActiveToken(token: string | null) {
  if (token) {
    sessionStorage.setItem("pulse-token", token);
  } else {
    sessionStorage.removeItem("pulse-token");
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getActiveToken();
  if (token) {
    return { "Authorization": `Bearer ${token}` };
  }
  const uid = sessionStorage.getItem("pulse-user-id");
  return uid ? { "x-user-id": uid } : {};
}
