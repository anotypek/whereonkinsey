const wokConfig = window.WOK_SUPABASE_CONFIG;
const wokSupabase = window.supabase?.createClient(wokConfig.url, wokConfig.publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

async function encryptAssessment(payload, passphrase) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 310000;
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA-256",
    kdf_iterations: iterations,
    encryption_version: 1,
  };
}

async function saveEncryptedAssessment(payload, passphrase) {
  if (!wokSupabase) throw new Error("Supabase client is unavailable.");
  const { data: { user }, error: userError } = await wokSupabase.auth.getUser();
  if (userError || !user) throw new Error("Sign in before saving your assessment.");
  const encrypted = await encryptAssessment(payload, passphrase);
  const { data, error } = await wokSupabase
    .from("encrypted_assessments")
    .insert({ user_id: user.id, ...encrypted })
    .select("id, created_at")
    .single();
  if (error) throw error;
  return data;
}

window.WOKSupabase = Object.freeze({
  client: wokSupabase,
  encryptAssessment,
  saveEncryptedAssessment,
});

