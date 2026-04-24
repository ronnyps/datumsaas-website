export type RolePointerLocale = "es" | "en";

export type RolePointerRoleLabels = {
  es: string;
  en: string;
};

export const ROLE_POINTER_ROLES = {
  you: { es: "Tu", en: "You" },
  ceo: { es: "CEO", en: "CEO" },
  hr: { es: "Recursos Humanos", en: "Human Resources" },
  cfo: { es: "Director Financiero", en: "Chief Financial Officer" },
  coo: { es: "Director de Operaciones", en: "Chief Operating Officer" },
  cto: { es: "Director de Tecnologia", en: "Chief Technology Officer" },
  sales: { es: "Ventas", en: "Sales" },
  legal: { es: "Legal", en: "Legal" },
  ops: { es: "Operaciones", en: "Operations" }
} as const satisfies Record<string, RolePointerRoleLabels>;

export type RolePointerRoleKey = keyof typeof ROLE_POINTER_ROLES;
