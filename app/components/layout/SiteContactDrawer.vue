<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";

const props = defineProps<{
  locale: "en" | "es";
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
const panelRef = ref<HTMLElement | null>(null);
let lockedScrollY = 0;
const isSubmitting = ref(false);
const submitError = ref("");
const submitSuccess = ref("");
const submitDone = ref(false);
const { submitToWebhook } = useContactWebhook();

const copy = computed(() =>
  props.locale === "es"
    ? {
        title: "Contactar ventas",
        subtitle: "Cuentanos un poco y te contactamos pronto.",
        fullName: "Full Name*",
        email: "Email*",
        phone: "Phone Number*",
        company: "Company Name",
        teamSize: "Tamano del equipo",
        industry: "Industria*",
        services: "Que necesitas en tu CRM?*",
        smsConsent:
          "I agree to receive SMS messages from Kmacho Technology at the phone number I provided. Message and data rates may apply. Reply STOP to unsubscribe. See our Privacy Policy and Terms and Conditions.",
        cta: "Enviar",
        requiredError: "Este campo es obligatorio.",
        emailError: "Introduce un email valido.",
        phoneError: "Introduce un telefono valido.",
        servicesError: "Selecciona al menos una opcion.",
        industryPlaceholder: "Selecciona industria",
        industries: [
          "Real Estate",
          "Healthcare",
          "Hospitality",
          "Retail",
          "Professional Services",
          "Construction",
          "Other",
        ],
        serviceOptions: [
          "Lead Management",
          "Sales Pipeline",
          "Quoting & Proposals",
          "Task Automation",
          "Team Permissions",
          "Reporting & Analytics",
        ],
        successMessage: "Recibimos tu solicitud. Te contactamos pronto.",
        finalTitle: "Gracias por contactarnos",
        finalBody: "Un miembro de nuestro equipo te contactara en breve.",
        submitErrorMessage: "No se pudo enviar ahora. Intentalo de nuevo.",
        sendingLabel: "Enviando solicitud...",
      }
    : {
        title: "Contact sales",
        subtitle: "Share a quick note and we will get back to you shortly.",
        fullName: "Full Name*",
        email: "Email*",
        phone: "Phone Number*",
        company: "Company Name",
        teamSize: "Team size",
        industry: "Industry*",
        services: "What CRM capabilities are you looking for?*",
        smsConsent:
          "I agree to receive SMS messages from Kmacho Technology at the phone number I provided. Message and data rates may apply. Reply STOP to unsubscribe. See our Privacy Policy and Terms and Conditions.",
        cta: "Send",
        requiredError: "This field is required.",
        emailError: "Enter a valid email.",
        phoneError: "Enter a valid phone number.",
        servicesError: "Select at least one option.",
        industryPlaceholder: "Select industry",
        industries: [
          "Real Estate",
          "Healthcare",
          "Hospitality",
          "Retail",
          "Professional Services",
          "Construction",
          "Other",
        ],
        serviceOptions: [
          "Lead Management",
          "Sales Pipeline",
          "Quoting & Proposals",
          "Task Automation",
          "Team Permissions",
          "Reporting & Analytics",
        ],
        successMessage: "We received your request. We will contact you shortly.",
        finalTitle: "Thank you for contacting us",
        finalBody: "A member of our team will contact you shortly.",
        submitErrorMessage: "Could not send right now. Please try again.",
        sendingLabel: "Sending request...",
      }
);

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  company: "",
  teamSize: "",
  industry: "",
  services: [] as string[],
  smsConsent: false,
});

const errors = reactive({
  fullName: "",
  email: "",
  phone: "",
  industry: "",
  services: "",
  smsConsent: "",
});

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validatePhone(value: string) {
  return /^[+()\-.\s\d]{7,}$/.test(value.trim());
}

function validateForm() {
  errors.fullName = form.fullName.trim() ? "" : copy.value.requiredError;
  errors.email = !form.email.trim()
    ? copy.value.requiredError
    : validateEmail(form.email)
      ? ""
      : copy.value.emailError;
  errors.phone = !form.phone.trim()
    ? copy.value.requiredError
    : validatePhone(form.phone)
      ? ""
      : copy.value.phoneError;
  errors.industry = form.industry.trim() ? "" : copy.value.requiredError;
  errors.services = form.services.length > 0 ? "" : copy.value.servicesError;
  errors.smsConsent = "";

  return !errors.fullName && !errors.email && !errors.phone && !errors.industry && !errors.services;
}

async function submitForm() {
  submitError.value = "";
  submitSuccess.value = "";
  submitDone.value = false;
  if (!validateForm()) return;
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    await submitToWebhook({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      teamSize: form.teamSize.trim(),
      industry: form.industry.trim(),
      services: [...form.services],
      smsConsent: form.smsConsent,
      locale: props.locale,
      submittedAt: new Date().toISOString(),
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
    });
    submitSuccess.value = copy.value.successMessage;
    submitDone.value = true;
  } catch {
    submitError.value = copy.value.submitErrorMessage;
  } finally {
    isSubmitting.value = false;
  }
}

function toggleService(value: string, checked: boolean) {
  if (checked) {
    if (!form.services.includes(value)) form.services.push(value);
    return;
  }
  form.services = form.services.filter((item) => item !== value);
}

function lockPageScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockPageScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const html = document.documentElement;
  const prevScrollBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, lockedScrollY);
  window.requestAnimationFrame(() => {
    html.style.scrollBehavior = prevScrollBehavior;
  });
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      lockPageScroll();
      return;
    }
    unlockPageScroll();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  unlockPageScroll();
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="contact-drawer surface-pastel" @click.self="emit('close')">
      <section ref="panelRef" class="contact-drawer__panel" role="dialog" aria-modal="true">
        <header class="contact-drawer__header">
          <div>
            <h2 class="contact-drawer__title">{{ copy.title }}</h2>
            <p class="contact-drawer__subtitle">{{ copy.subtitle }}</p>
          </div>
          <button type="button" class="contact-drawer__close" aria-label="Close" @click="emit('close')">
            <span />
            <span />
          </button>
        </header>

        <form
          :class="['contact-drawer__form', { 'contact-drawer__form--state': isSubmitting || submitDone }]"
          action="#"
          method="post"
          novalidate
          @submit.prevent="submitForm"
        >
          <div v-if="isSubmitting" class="contact-drawer__state contact-drawer__state--sending">
            <div class="contact-drawer__state-mark" aria-hidden="true">
              <span class="contact-drawer__pulse" />
              <img src="/imago.svg" alt="" />
            </div>
            <p class="contact-drawer__state-title">{{ copy.sendingLabel }}</p>
          </div>

          <div v-else-if="submitDone" class="contact-drawer__state contact-drawer__state--done">
            <div class="contact-drawer__state-mark contact-drawer__state-mark--done" aria-hidden="true">✓</div>
            <h3 class="contact-drawer__state-head">{{ copy.finalTitle }}</h3>
            <p class="contact-drawer__state-text">{{ copy.finalBody }}</p>
          </div>

          <template v-else>
          <div class="contact-drawer__grid">
            <label class="contact-drawer__field">
              <span>{{ copy.fullName.replace("*", "") }}<em class="contact-drawer__required">*</em></span>
              <input v-model="form.fullName" type="text" :placeholder="copy.fullName" />
              <small v-if="errors.fullName" class="contact-drawer__error">{{ errors.fullName }}</small>
            </label>
            <label class="contact-drawer__field">
              <span>{{ copy.phone.replace("*", "") }}<em class="contact-drawer__required">*</em></span>
              <input v-model="form.phone" type="tel" :placeholder="copy.phone" />
              <small v-if="errors.phone" class="contact-drawer__error">{{ errors.phone }}</small>
            </label>
            <label class="contact-drawer__field">
              <span>{{ copy.email.replace("*", "") }}<em class="contact-drawer__required">*</em></span>
              <input v-model="form.email" type="email" :placeholder="copy.email" />
              <small v-if="errors.email" class="contact-drawer__error">{{ errors.email }}</small>
            </label>
            <label class="contact-drawer__field">
              <span>{{ copy.company }}</span>
              <input v-model="form.company" type="text" :placeholder="copy.company" />
            </label>
            <label class="contact-drawer__field">
              <span>{{ copy.teamSize }}</span>
              <input v-model="form.teamSize" type="text" :placeholder="copy.teamSize" />
            </label>
            <label class="contact-drawer__field">
              <span>{{ copy.industry.replace("*", "") }}<em class="contact-drawer__required">*</em></span>
              <select v-model="form.industry" class="contact-drawer__select">
                <option value="" disabled>{{ copy.industryPlaceholder }}</option>
                <option v-for="industry in copy.industries" :key="industry" :value="industry">
                  {{ industry }}
                </option>
              </select>
              <small v-if="errors.industry" class="contact-drawer__error">{{ errors.industry }}</small>
            </label>
          </div>

          <fieldset class="contact-drawer__fieldset">
            <legend>{{ copy.services.replace("*", "") }}<em class="contact-drawer__required">*</em></legend>
            <div class="contact-drawer__checks">
              <label v-for="service in copy.serviceOptions" :key="service" class="contact-drawer__check">
                <input
                  type="checkbox"
                  :checked="form.services.includes(service)"
                  @change="toggleService(service, ($event.target as HTMLInputElement).checked)"
                />
                <span>{{ service }}</span>
              </label>
            </div>
            <small v-if="errors.services" class="contact-drawer__error">{{ errors.services }}</small>
          </fieldset>

          <label class="contact-drawer__consent">
            <input v-model="form.smsConsent" type="checkbox" />
            <span>{{ copy.smsConsent }}</span>
          </label>
            <p v-if="submitError" class="contact-drawer__error">{{ submitError }}</p>
            <p v-if="submitSuccess" class="contact-drawer__success">{{ submitSuccess }}</p>
            <button type="submit" class="contact-drawer__submit" :disabled="isSubmitting">
              {{ isSubmitting ? "Sending..." : copy.cta }}
            </button>
          </template>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.contact-drawer {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(var(--color-midnight-700-ch) / 0.2);
  backdrop-filter: blur(16px) saturate(1.05);
  -webkit-backdrop-filter: blur(16px) saturate(1.05);
  padding: 0.75rem 0.75rem 0;
  overflow: hidden;
  overscroll-behavior: contain;
  animation: contact-drawer-overlay-in 220ms ease-out both;
}

.contact-drawer.surface-pastel {
  background-color: rgb(var(--color-midnight-700-ch) / 0.26);
  background-blend-mode: multiply, normal, normal, normal, normal;
}

.contact-drawer.surface-pastel::before {
  opacity: 0.26;
  inset: -18% -8%;
  filter: blur(56px);
}

.contact-drawer__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 70rem);
  height: min(40rem, calc(100dvh - 1.5rem));
  max-height: calc(100dvh - 1.5rem);
  border: 1px solid var(--surface-border-subtle);
  border-radius: 1rem 1rem 0 0;
  background: rgb(var(--color-neutral-0-ch) / 1);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  box-shadow:
    0 -30px 80px rgb(var(--color-midnight-700-ch) / 0.34),
    0 16px 40px rgb(var(--color-midnight-700-ch) / 0.2),
    0 1px 0 rgb(var(--color-neutral-0-ch) / 0.6) inset;
  animation: contact-drawer-panel-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.contact-drawer__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--color-neutral-0-ch) / 0.98);
  padding-bottom: 0.65rem;
}

.contact-drawer__title {
  margin: 0;
  color: var(--semantic-secondary);
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  line-height: 1.1;
}

.contact-drawer__subtitle {
  margin: 0.3rem 0 0;
  color: rgb(var(--color-midnight-500-ch) / 0.7);
}

.contact-drawer__close {
  flex-shrink: 0;
  position: relative;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--surface-border-subtle);
  border-radius: 0.55rem;
  background: rgb(var(--color-neutral-0-ch) / 1);
  cursor: pointer;
}

.contact-drawer__close span {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.8rem;
  height: 1.5px;
  background: rgb(var(--color-midnight-500-ch) / 0.84);
}

.contact-drawer__close span:first-child {
  transform: translate(-50%, -50%) rotate(45deg);
}

.contact-drawer__close span:last-child {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.contact-drawer__form {
  margin-top: 0.8rem;
  display: grid;
  gap: 1rem;
  align-content: start;
  padding-right: 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.contact-drawer__form--state {
  align-content: center;
  justify-items: center;
}

.contact-drawer__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  border: 1px solid var(--surface-border-subtle);
  border-radius: 0.8rem;
  padding: 0.85rem;
  background: rgb(var(--color-neutral-0-ch) / 0.7);
}

.contact-drawer__field {
  display: grid;
  gap: 0.35rem;
}

.contact-drawer__field span {
  font-size: 0.84rem;
  font-weight: 600;
  color: rgb(var(--color-midnight-500-ch) / 0.78);
}

.contact-drawer__required {
  margin-left: 0.15rem;
  color: var(--dash-status-red-text, #dc2626) !important;
  font-style: normal;
  font-weight: 700;
}

.contact-drawer__field input,
.contact-drawer__field textarea,
.contact-drawer__select {
  width: 100%;
  border: 1px solid rgb(var(--color-midnight-500-ch) / 0.26);
  border-radius: 0.55rem;
  background: rgb(var(--color-neutral-0-ch) / 1);
  padding: 0.68rem 0.75rem;
  font: inherit;
  color: rgb(var(--color-midnight-500-ch) / 0.86);
  box-shadow: inset 0 0 0 1px rgb(var(--color-neutral-0-ch) / 0.55);
}

.contact-drawer__field input:focus,
.contact-drawer__field textarea:focus,
.contact-drawer__select:focus {
  outline: none;
  border-color: rgb(var(--color-blue-500-ch) / 0.52);
  box-shadow:
    inset 0 0 0 1px rgb(var(--color-blue-500-ch) / 0.2),
    0 0 0 2px rgb(var(--color-blue-500-ch) / 0.12);
}

.contact-drawer__field input,
.contact-drawer__select {
  min-height: 2.75rem;
}

.contact-drawer__fieldset {
  border: 1px solid var(--surface-border-subtle);
  border-radius: 0.75rem;
  padding: 0.8rem;
  margin: 0;
  background: rgb(var(--color-neutral-0-ch) / 0.72);
}

.contact-drawer__fieldset legend {
  padding: 0 0.25rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: rgb(var(--color-midnight-500-ch) / 0.78);
}

.contact-drawer__checks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem 0.85rem;
}

.contact-drawer__check {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.84rem;
  color: rgb(var(--color-midnight-500-ch) / 0.84);
}

.contact-drawer__check input {
  width: 0.95rem;
  height: 0.95rem;
}

.contact-drawer__field--full {
  grid-column: 1 / -1;
  border: 1px solid var(--surface-border-subtle);
  border-radius: 0.75rem;
  padding: 0.7rem;
  background: rgb(var(--color-neutral-0-ch) / 0.72);
}

.contact-drawer__consent {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  border: 1px solid var(--surface-border-subtle);
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: rgb(var(--color-neutral-0-ch) / 0.72);
}

.contact-drawer__consent input {
  width: 1rem;
  height: 1rem;
  margin-top: 0.15rem;
}

.contact-drawer__consent span {
  font-size: 0.8rem;
  line-height: 1.35;
  color: rgb(var(--color-midnight-500-ch) / 0.82);
}

.contact-drawer__submit {
  min-height: 2.65rem;
  border: 0;
  border-radius: 0.6rem;
  background: var(--semantic-primary);
  color: rgb(var(--color-neutral-0-ch) / 1);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.contact-drawer__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.contact-drawer__error {
  color: var(--dash-status-red-text, #dc2626) !important;
  font-size: 0.76rem;
  line-height: 1.15;
  font-weight: 600;
}

.contact-drawer__success {
  color: #15803d;
  font-size: 0.82rem;
  line-height: 1.2;
  font-weight: 600;
}

.contact-drawer__state {
  min-height: 100%;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  gap: 0.75rem;
}

.contact-drawer__state-mark {
  position: relative;
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgb(var(--color-blue-100-ch) / 0.66);
  border: 1px solid rgb(var(--color-blue-500-ch) / 0.22);
}

.contact-drawer__state-mark img {
  width: 3.8rem;
  height: 3.8rem;
}

.contact-drawer__pulse {
  position: absolute;
  inset: -0.35rem;
  border-radius: inherit;
  border: 2px solid rgb(var(--color-blue-500-ch) / 0.4);
  animation: contact-pulse 1.2s ease-out infinite;
}

.contact-drawer__state-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--semantic-secondary);
}

.contact-drawer__state-mark--done {
  color: rgb(var(--color-neutral-0-ch) / 1);
  background: rgb(var(--color-blue-500-ch) / 0.94);
  width: 5.6rem;
  height: 5.6rem;
  font-size: 2rem;
  font-weight: 800;
  box-shadow:
    0 14px 30px rgb(var(--color-blue-500-ch) / 0.28),
    0 0 0 10px rgb(var(--color-blue-500-ch) / 0.08);
  animation: contact-done-pop 460ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.contact-drawer__state-head {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  line-height: 1.1;
  color: var(--semantic-secondary);
  animation: contact-done-text-in 360ms ease-out 120ms both;
}

.contact-drawer__state-text {
  margin: 0;
  max-width: 38ch;
  color: rgb(var(--color-midnight-500-ch) / 0.76);
  animation: contact-done-text-in 360ms ease-out 170ms both;
}

@keyframes contact-pulse {
  0% {
    transform: scale(0.92);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes contact-done-pop {
  0% {
    transform: scale(0.72) translateY(8px);
    opacity: 0;
  }
  70% {
    transform: scale(1.06) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes contact-done-text-in {
  from {
    transform: translateY(8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes contact-drawer-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes contact-drawer-panel-in {
  from {
    transform: translateY(18px);
    opacity: 0.68;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-drawer,
  .contact-drawer__panel {
    animation: none !important;
  }
}

@media (max-width: 767px) {
  .contact-drawer {
    padding: 0;
    align-items: flex-end;
  }

  .contact-drawer__panel {
    width: 100%;
    height: 92dvh;
    max-height: 92dvh;
    border-radius: 1rem 1rem 0 0;
    padding: 1rem 0.9rem calc(1rem + env(safe-area-inset-bottom));
  }

  .contact-drawer__grid {
    grid-template-columns: 1fr;
  }

  .contact-drawer__checks {
    grid-template-columns: 1fr;
  }

  .contact-drawer__header {
    position: static;
    top: auto;
    padding-bottom: 0;
  }
}
</style>
