/**
 * IndexedDB storage layer for Quotd.
 *
 * DB name:    quotd
 * Store name: quotes
 * Key path:   id
 *
 * All public functions check isDbAvailable() first and throw a typed error
 * if IndexedDB is inaccessible (e.g. private browsing in some browsers).
 */

import { QuoteRecord } from "./types";

const DB_NAME = "quotd";
const STORE = "quotes";
const VERSION = 1;

/** Returns false in environments where IndexedDB is blocked or absent. */
export function isDbAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDB(): Promise<IDBDatabase> {
  if (!isDbAvailable()) {
    return Promise.reject(
      Object.assign(new Error("IndexedDB is not available in this context."), {
        code: "IDB_UNAVAILABLE",
      })
    );
  }

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveQuote(quote: QuoteRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(quote);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllQuotes(): Promise<QuoteRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).index("createdAt").getAll();
    req.onsuccess = () => {
      resolve((req.result as QuoteRecord[]).reverse()); // newest first
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getQuoteById(
  id: string
): Promise<QuoteRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as QuoteRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Merges partial updates into an existing record.
 * Only text and speaker are editable; image stays immutable.
 */
export async function updateQuote(
  id: string,
  updates: Partial<Pick<QuoteRecord, "text" | "speaker">>
): Promise<void> {
  const existing = await getQuoteById(id);
  if (!existing) throw new Error(`Quote "${id}" not found`);
  return saveQuote({ ...existing, ...updates, updatedAt: Date.now() });
}

export async function deleteQuote(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
