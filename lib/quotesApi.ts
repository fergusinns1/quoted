/**
 * Supabase persistence layer for Quotd.
 *
 * Images are stored in the "quote-images" bucket (private) under:
 *   {userId}/{quoteId}.jpg
 *
 * Upload path is constructed in saveQuote() at line 69.
 * Retrieval uses createSignedUrl() — required for private buckets.
 */

import { supabase } from "./supabase";
import { QuoteRecord } from "./types";

const BUCKET = "quote-images";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year in seconds

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a base64 data URL to a Blob. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Get a signed URL for a private bucket image path.
 * Returns null if path is empty or signing fails.
 */
async function signedUrl(imagePath: string | null): Promise<string | null> {
  if (!imagePath) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(imagePath, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Map a raw Supabase row to a QuoteRecord, hydrating the signed image URL. */
async function rowToRecord(row: {
  id: string;
  quote_text: string;
  person_name: string;
  image_path: string | null;
  created_at: string;
  updated_at?: string | null;
}): Promise<QuoteRecord> {
  return {
    id: row.id,
    text: row.quote_text,
    speaker: row.person_name,
    imageDataUrl: await signedUrl(row.image_path),
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  };
}

// ─── Save ─────────────────────────────────────────────────────────────────────

/**
 * Uploads image to Storage (if present), then inserts a row into public.quotes.
 *
 * Upload path is constructed here:
 *   `${userId}/${quote.id}.jpg`  (line below)
 *
 * Requires the following Storage RLS policy on the quote-images bucket:
 *   INSERT: bucket_id = 'quote-images' AND (storage.foldername(name))[1] = auth.uid()::text
 *   SELECT: bucket_id = 'quote-images' AND (storage.foldername(name))[1] = auth.uid()::text
 *   DELETE: bucket_id = 'quote-images' AND (storage.foldername(name))[1] = auth.uid()::text
 */
export async function saveQuote(
  quote: QuoteRecord,
  userId: string
): Promise<void> {
  let imagePath: string | null = null;

  if (quote.imageDataUrl && quote.imageDataUrl.startsWith("data:")) {
    const blob = dataUrlToBlob(quote.imageDataUrl);
    const ext = blob.type.includes("png") ? "png" : "jpg";
    // ← Upload path constructed here
    const path = `${userId}/${quote.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: blob.type, upsert: true });

    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
    imagePath = path;
  }

  const { error } = await supabase.from("quotes").insert({
    id: quote.id,
    user_id: userId,
    quote_text: quote.text,
    person_name: quote.speaker,
    image_path: imagePath,
    created_at: new Date(quote.createdAt).toISOString(),
  });

  if (error) throw new Error(`Quote save failed: ${error.message}`);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Fetch all quotes for the current user, newest first. */
export async function getAllQuotes(): Promise<QuoteRecord[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map(rowToRecord));
}

/** Fetch a single quote by id. Returns undefined if not found. */
export async function getQuoteById(id: string): Promise<QuoteRecord | undefined> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return rowToRecord(data);
}

// ─── Update ───────────────────────────────────────────────────────────────────

/** Update quote text and/or speaker. */
export async function updateQuote(
  id: string,
  updates: Partial<Pick<QuoteRecord, "text" | "speaker">>
): Promise<void> {
  const { error } = await supabase
    .from("quotes")
    .update({
      ...(updates.text !== undefined && { quote_text: updates.text }),
      ...(updates.speaker !== undefined && { person_name: updates.speaker }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/** Delete a quote row and its storage image. */
export async function deleteQuote(id: string): Promise<void> {
  const { data } = await supabase
    .from("quotes")
    .select("image_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (data?.image_path) {
    await supabase.storage.from(BUCKET).remove([data.image_path]);
  }
}
