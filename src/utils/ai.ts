import { SalesVisit } from "../types";

export async function fetchDebrief(
  visit: SalesVisit,
  customPrompt: string,
  reportFormat: string
): Promise<string> {
  try {
    const res = await fetch("/api/ai/debrief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visit, customPrompt, reportFormat }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Errore sconosciuto debrief.");
    }
    const data = await res.json();
    return data.report;
  } catch (error: any) {
    console.error("fetchDebrief error:", error);
    throw error;
  }
}

export async function fetchImportVisits(
  text: string,
  weekKey: string,
  weekDates: string[],
  customPrompt: string
): Promise<any[]> {
  try {
    const res = await fetch("/api/ai/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, weekKey, weekDates, customPrompt }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Errore sconosciuto import.");
    }
    const data = await res.json();
    return data.visits || [];
  } catch (error: any) {
    console.error("fetchImportVisits error:", error);
    throw error;
  }
}

export async function fetchSingleVisitParse(
  text: string,
  defaultDate: string
): Promise<any> {
  try {
    const res = await fetch("/api/ai/parse-single", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, defaultDate }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Errore parsing singola visita.");
    }
    return await res.json();
  } catch (error: any) {
    console.error("fetchSingleVisitParse error:", error);
    throw error;
  }
}

export async function fetchWeeklySummary(
  visits: SalesVisit[],
  weekKey: string,
  customPrompt: string
): Promise<string> {
  try {
    const res = await fetch("/api/ai/weekly-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visits, weekKey, customPrompt }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Errore riassunto settimanale.");
    }
    const data = await res.json();
    return data.summary;
  } catch (error: any) {
    console.error("fetchWeeklySummary error:", error);
    throw error;
  }
}
