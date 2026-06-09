export interface SalesVisit {
  id: string;
  azienda: string;
  indirizzo: string;
  data: string; // YYYY-MM-DD
  orario: string; // HH:MM
  notePreVisita: string;
  quickNote: string;
  esito: "Positivo" | "Da seguire" | "Negativo" | "Cancellata/Backlog" | "";
  prodotti: string;
  offerta: string;
  nextStep: string;
  report: string;
  isDemo?: boolean;
}

export interface AppSettings {
  userName: string;
  company: string;
  assignedAreas: string;
  startLocation: string;
  startTime: string;
  debriefPrompt: string;
  importPrompt: string;
  summaryPrompt: string;
  reportFormat: string;
  fastModel?: string;
  advancedModel?: string;
  apiRetries?: number;
  initialDelay?: number;
  enableSearchGrounding?: boolean;
}

export interface WeekData {
  weekKey: string; // YYYY-Www
  visits: SalesVisit[];
}
