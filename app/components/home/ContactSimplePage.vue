<script setup lang="ts">
const props = defineProps<{
  locale: "en" | "es";
}>();

const copy =
  props.locale === "es"
    ? {
        title: "Contacta con nosotros",
        subtitle: "Cuentanos brevemente y te respondemos pronto.",
        name: "Nombre",
        email: "Correo",
        company: "Empresa",
        message: "Mensaje",
        cta: "Enviar",
      }
    : {
        title: "Contact us",
        subtitle: "Share a quick note and we will get back to you shortly.",
        name: "Name",
        email: "Email",
        company: "Company",
        message: "Message",
        cta: "Send",
      };
</script>

<template>
  <main class="contact-page">
    <LayoutSiteHeader :locale="props.locale" />
    <section class="section contact-page__section">
      <div class="container contact-page__wrap">
        <article class="contact-page__card">
          <h1 class="contact-page__title">{{ copy.title }}</h1>
          <p class="contact-page__subtitle">{{ copy.subtitle }}</p>

          <form class="contact-page__form" action="#" method="post">
            <label class="contact-page__field">
              <span>{{ copy.name }}</span>
              <input type="text" :placeholder="copy.name" />
            </label>
            <label class="contact-page__field">
              <span>{{ copy.email }}</span>
              <input type="email" :placeholder="copy.email" />
            </label>
            <label class="contact-page__field">
              <span>{{ copy.company }}</span>
              <input type="text" :placeholder="copy.company" />
            </label>
            <label class="contact-page__field">
              <span>{{ copy.message }}</span>
              <textarea rows="5" :placeholder="copy.message"></textarea>
            </label>
            <button type="submit" class="contact-page__submit">{{ copy.cta }}</button>
          </form>
        </article>
      </div>
    </section>
    <LayoutSiteFooter copyright="(c) DatumSaas. All rights reserved." />
  </main>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--semantic-page-bg);
}

.contact-page__section {
  padding-top: clamp(2rem, 5vw, 4rem);
  padding-bottom: clamp(2.5rem, 6vw, 5rem);
}

.contact-page__wrap {
  display: grid;
  place-items: center;
}

.contact-page__card {
  width: min(100%, 42rem);
  border: 1px solid var(--surface-border-subtle);
  border-radius: var(--radius-md);
  background: rgb(var(--color-neutral-0-ch) / 0.94);
  padding: clamp(1rem, 2.4vw, 1.5rem);
}

.contact-page__title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--semantic-secondary);
}

.contact-page__subtitle {
  margin: 0.5rem 0 0;
  color: rgb(var(--color-midnight-500-ch) / 0.68);
}

.contact-page__form {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.contact-page__field {
  display: grid;
  gap: 0.35rem;
}

.contact-page__field span {
  font-size: 0.84rem;
  font-weight: 600;
  color: rgb(var(--color-midnight-500-ch) / 0.78);
}

.contact-page__field input,
.contact-page__field textarea {
  width: 100%;
  border: 1px solid var(--surface-border-subtle);
  border-radius: 0.55rem;
  background: rgb(var(--color-neutral-0-ch) / 1);
  padding: 0.7rem 0.75rem;
  font: inherit;
  color: rgb(var(--color-midnight-500-ch) / 0.86);
}

.contact-page__submit {
  margin-top: 0.2rem;
  min-height: 2.6rem;
  border: 0;
  border-radius: 0.6rem;
  background: var(--semantic-primary);
  color: rgb(var(--color-neutral-0-ch) / 1);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}
</style>

