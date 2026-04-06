import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * DELETE ACCOUNT — server-side API route.
 *
 * Why server-side: The Supabase client SDK cannot delete auth users.
 * Deletion requires the service_role key, which must never be sent to the browser.
 *
 * What gets deleted:
 *   1. All rows in public.quotes where user_id = caller's uid
 *   2. All files in quote-images/{uid}/ (Storage)
 *   3. The avatar file at avatars/{uid}/avatar.jpg (Storage)
 *   4. The auth.users record itself (via admin API)
 *
 * The caller must pass their current access_token as a Bearer header so we
 * can verify identity before deleting anything.
 */

function makeAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured on this server.");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  // 1. Extract + verify caller's JWT
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = makeAdminClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server misconfiguration" },
      { status: 503 }
    );
  }

  // Verify the token belongs to a real user
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = user.id;

  try {
    // 2. Delete quote rows (quotes table)
    // The admin client bypasses RLS so this is guaranteed to clean up everything.
    const { error: quotesError } = await admin
      .from("quotes")
      .delete()
      .eq("user_id", uid);
    if (quotesError) throw new Error(`Quotes delete failed: ${quotesError.message}`);

    // 3. Delete quote images from Storage
    const { data: quoteFiles } = await admin.storage
      .from("quote-images")
      .list(uid, { limit: 1000 });
    if (quoteFiles && quoteFiles.length > 0) {
      const paths = quoteFiles.map((f) => `${uid}/${f.name}`);
      await admin.storage.from("quote-images").remove(paths);
    }

    // 4. Delete avatar (may not exist — ignore errors)
    await admin.storage.from("avatars").remove([`${uid}/avatar.jpg`]);

    // 5. Delete the auth user — this is the step that requires service_role
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(uid);
    if (deleteUserError) throw new Error(`Auth delete failed: ${deleteUserError.message}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-account]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deletion failed" },
      { status: 500 }
    );
  }
}
