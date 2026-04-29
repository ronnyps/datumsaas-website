export type SchedulingLocale = "en" | "es";

export type SchedulingUser = {
  id: string;
  name: string;
  initials: string;
};

export type SchedulingEvent = {
  id: string;
  title: Record<SchedulingLocale, string>;
  start: string; // "HH:MM" 24h
  end: string; // "HH:MM" 24h
  assignedUserIds: string[];
  tone: "indigo" | "violet" | "blue" | "slate";
};

export const schedulingUsers: SchedulingUser[] = [
  { id: "u-sofia", name: "Sofia Martinez", initials: "SM" },
  { id: "u-jason", name: "Jason Clark", initials: "JC" },
  { id: "u-olivia", name: "Olivia Bennett", initials: "OB" },
  { id: "u-emma", name: "Emma Rodriguez", initials: "ER" },
  { id: "u-daniel", name: "Daniel Kim", initials: "DK" },
  { id: "u-wade", name: "Wade Warren", initials: "WW" },
  { id: "u-leslie", name: "Leslie Alexander", initials: "LA" },
  { id: "u-drew", name: "Drew Cano", initials: "DC" },
];

export const schedulingEvents: SchedulingEvent[] = [
  {
    id: "evt-work-order-triage",
    title: {
      en: "Work order triage",
      es: "Clasificacion de ordenes",
    },
    start: "09:00",
    end: "09:25",
    assignedUserIds: ["u-sofia", "u-jason"],
    tone: "slate",
  },
  {
    id: "evt-route-plan",
    title: {
      en: "Route plan",
      es: "Plan de ruta",
    },
    start: "09:35",
    end: "10:45",
    assignedUserIds: ["u-wade"],
    tone: "violet",
  },
  {
    id: "evt-team-checkin",
    title: {
      en: "Team check-in",
      es: "Reunion de equipo",
    },
    start: "11:30",
    end: "12:00",
    assignedUserIds: ["u-emma", "u-drew", "u-daniel"],
    tone: "indigo",
  },
  {
    id: "evt-quality-review",
    title: {
      en: "Quality review",
      es: "Revision de calidad",
    },
    start: "12:20",
    end: "14:30",
    assignedUserIds: ["u-leslie"],
    tone: "blue",
  },
  {
    id: "evt-site-visit",
    title: {
      en: "Site visit",
      es: "Visita tecnica",
    },
    start: "15:00",
    end: "16:15",
    assignedUserIds: ["u-olivia"],
    tone: "slate",
  },
  {
    id: "evt-delivery-window",
    title: {
      en: "Delivery window",
      es: "Ventana de entrega",
    },
    start: "16:30",
    end: "17:20",
    assignedUserIds: ["u-jason", "u-sofia"],
    tone: "indigo",
  },
];
