export const isChatFocused = (chatId: string, activeId: string | null) =>
  activeId === chatId &&
  /\/messages\/?$/.test(window.location.pathname) &&
  document.visibilityState === "visible" &&
  document.hasFocus();

const tabId = crypto.randomUUID();
const prefix = (userId: string) => `stechad-chat-view:${userId}:`;
export function publishChatView(userId: string, chatId: string | null) {
  const key = prefix(userId) + tabId;
  try {
    if (chatId && isChatFocused(chatId, chatId))
      localStorage.setItem(key, JSON.stringify({ chatId, at: Date.now() }));
    else localStorage.removeItem(key);
  } catch {
    /* Storage can be unavailable in private browser policies. */
  }
}
export function hasFocusedChat(userId: string, chatId: string) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix(userId))) continue;
      const view = JSON.parse(localStorage.getItem(key) || "null");
      if (view?.chatId === chatId && Date.now() - view.at < 12000) return true;
    }
  } catch {
    /* Current-tab detection remains available. */
  }
  return false;
}

// IndexedDB's unique key is an atomic claim shared by tabs. Replayed events and
// concurrent tabs cannot both win it, even when Web Locks is unavailable.
let claims: Promise<IDBDatabase>;
export async function claimMessageAlert(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  try {
    claims ||= new Promise((resolve, reject) => {
      const request = indexedDB.open("stechad-chat-alerts", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("seen", { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const db = await claims;
    return await new Promise((resolve) => {
      const transaction = db.transaction("seen", "readwrite");
      const store = transaction.objectStore("seen");
      store.add({ id: `${userId}:${notificationId}`, at: Date.now() });
      transaction.oncomplete = () => resolve(true);
      transaction.onabort = () => resolve(false);
      transaction.onerror = () => resolve(false);
    });
  } catch {
    // If durable storage is blocked, this tab still deduplicates locally.
    const key = `${userId}:${notificationId}`;
    if (fallbackClaims.has(key)) return false;
    fallbackClaims.add(key);
    return true;
  }
}
const fallbackClaims = new Set<string>();
