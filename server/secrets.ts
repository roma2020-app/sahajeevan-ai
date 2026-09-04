import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// In-memory cache for retrieved secrets to avoid repeated Secret Manager API calls
let cachedMapsApiKey: string | null = null;
let secretClient: SecretManagerServiceClient | null = null;

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "peta-idea-jlcf1";
const MAPS_SECRET_NAME = "GOOGLE_MAPS_API_KEY";

/**
 * Retrieves the Google Maps API Key securely.
 * 
 * Order of resolution:
 * 1. Return in-memory cached value if already resolved.
 * 2. Check process.env.GOOGLE_MAPS_API_KEY (injected directly by Cloud Run Secret Manager mounting).
 * 3. Dynamically fetch from Google Cloud Secret Manager if running in GCP environment.
 * 4. Check process.env.VITE_GOOGLE_MAPS_API_KEY (local development fallback).
 * 
 * SECURITY:
 * - The actual secret string is NEVER logged to stdout, stderr, or included in errors.
 * - Stored only in volatile server memory.
 */
export async function getGoogleMapsApiKey(): Promise<string> {
  // 1. Cached in memory
  if (cachedMapsApiKey) {
    return cachedMapsApiKey;
  }

  // 2. Direct environment injection (Cloud Run Secret Manager mounting)
  const envKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (envKey) {
    cachedMapsApiKey = envKey;
    return cachedMapsApiKey;
  }

  // 3. Dynamic fetch via Google Cloud Secret Manager SDK
  try {
    if (!secretClient) {
      secretClient = new SecretManagerServiceClient();
    }
    const secretPath = `projects/${PROJECT_ID}/secrets/${MAPS_SECRET_NAME}/versions/latest`;
    const [version] = await secretClient.accessSecretVersion({ name: secretPath });
    const payload = version.payload?.data?.toString();
    if (payload && payload.trim().length > 0) {
      cachedMapsApiKey = payload.trim();
      return cachedMapsApiKey;
    }
  } catch (err: any) {
    // Graceful fallback - do NOT log error details that might contain secret metadata
    // Secret Manager might not be reachable locally or permission might rely on env injection
  }

  // 4. Local dev fallback if present
  const viteFallback = process.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (viteFallback) {
    cachedMapsApiKey = viteFallback;
    return cachedMapsApiKey;
  }

  return "";
}
