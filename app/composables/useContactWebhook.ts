type ContactWebhookPayload = {
  fullName: string;
  phone: string;
  email: string;
  company: string;
  teamSize: string;
  industry: string;
  services: string[];
  smsConsent: boolean;
  locale: "en" | "es";
  submittedAt: string;
  pageUrl: string;
};

export function useContactWebhook() {
  const config = useRuntimeConfig();
  const webhookUrl = config.public.n8nContactWebhookUrl?.trim();

  async function submitToWebhook(payload: ContactWebhookPayload) {
    if (!webhookUrl) {
      throw new Error("Missing N8N webhook URL. Set NUXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL in .env.");
    }

    await $fetch(webhookUrl, {
      method: "POST",
      body: payload,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  return {
    submitToWebhook,
  };
}

