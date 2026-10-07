/**
 * Phase F: Server-Side Email Delivery Service
 * Kutchmitra Home & Decor Awards 2026
 * 
 * Supports Resend transactional email API with safe local development fallback.
 * Strictly executed server-side. Never expose API keys or secrets to the client.
 */

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: "resend" | "mock";
  error?: string;
}

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Kutchmitra Awards 2026 <awards@kutchmitra.com>";

/**
 * Sends a transactional email securely via Resend HTTP API.
 * If RESEND_API_KEY is not configured in the environment, safely logs the dispatch
 * in mock mode so business operations never crash.
 */
export async function sendTransactionalEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!payload.to || !payload.to.includes("@")) {
    return {
      success: false,
      provider: "mock",
      error: `Invalid recipient email address: '${payload.to}'`,
    };
  }

  // If no Resend API key is present, execute graceful simulated delivery
  if (!apiKey || apiKey.trim() === "") {
    console.log(
      `[MOCK EMAIL SERVICE] To: ${payload.to} | Subject: "${payload.subject}" | From: ${DEFAULT_FROM}`
    );
    return {
      success: true,
      messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      provider: "mock",
    };
  }

  // Live Resend HTTP dispatch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout guard

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo || "awards@kutchmitra.com",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.message || data?.error || `HTTP ${response.status}: Failed to dispatch email.`;
      console.error("[RESEND ERROR]", errMsg);
      return {
        success: false,
        error: errMsg,
        provider: "resend",
      };
    }

    return {
      success: true,
      messageId: data?.id || `resend-${Date.now()}`,
      provider: "resend",
    };
  } catch (err: any) {
    const isAbort = err.name === "AbortError";
    const errorDescription = isAbort
      ? "Email dispatch timed out after 10000ms."
      : err?.message || "Unknown network error during email dispatch.";

    console.error("[EMAIL SERVICE EXCEPTION]", errorDescription);
    return {
      success: false,
      error: errorDescription,
      provider: "resend",
    };
  }
}
