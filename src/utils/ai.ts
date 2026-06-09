import { SalesVisit } from "../types";

export interface AIResponseEnvelope<T> {
  success: boolean;
  data: T;
  source: "AI" | "Fallback";
  modelUsed: string;
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  retriesTriggered?: number;
  warning?: string;
}

export interface AIStats {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  successCalls: number;
  fallbackCalls: number;
  retryAttempts: number;
}

// ─────────────────────────────────────────────────────────────
// Statistics Management Helpers
// ─────────────────────────────────────────────────────────────

export function getAIStats(): AIStats {
  try {
    const saved = localStorage.getItem("fsn:ai_stats");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        promptTokens: Number(parsed.promptTokens || 0),
        candidatesTokens: Number(parsed.candidatesTokens || 0),
        totalTokens: Number(parsed.totalTokens || 0),
        successCalls: Number(parsed.successCalls || 0),
        fallbackCalls: Number(parsed.fallbackCalls || 0),
        retryAttempts: Number(parsed.retryAttempts || 0),
      };
    }
  } catch (e) {
    console.error("Failed to parse AI stats:", e);
  }
  return {
    promptTokens: 0,
    candidatesTokens: 0,
    totalTokens: 0,
    successCalls: 0,
    fallbackCalls: 0,
    retryAttempts: 0,
  };
}

export function saveAIStats(stats: AIStats) {
  try {
    localStorage.setItem("fsn:ai_stats", JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save AI stats:", e);
  }
}

export function resetAIStats() {
  const zeroStats: AIStats = {
    promptTokens: 0,
    candidatesTokens: 0,
    totalTokens: 0,
    successCalls: 0,
    fallbackCalls: 0,
    retryAttempts: 0,
  };
  saveAIStats(zeroStats);
}

export function updateAIStats(
  source: "AI" | "Fallback",
  usage?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number },
  retriesTriggered = 0
) {
  const stats = getAIStats();
  if (source === "AI") {
    stats.successCalls += 1;
    if (usage) {
      stats.promptTokens += usage.promptTokenCount || 0;
      stats.candidatesTokens += usage.candidatesTokenCount || 0;
      stats.totalTokens += usage.totalTokenCount || 0;
    }
  } else {
    stats.fallbackCalls += 1;
  }
  stats.retryAttempts += retriesTriggered;
  saveAIStats(stats);
}

// ─────────────────────────────────────────────────────────────
// Unified Remote AI API Core Caller
// ─────────────────────────────────────────────────────────────

export async function callAIService<T>(
  endpoint: string,
  body: any
): Promise<AIResponseEnvelope<T>> {
  // Load actual active settings from local store to relay preferences to the server dynamically
  const defaultAiConfig = {
    fastModel: "gemini-3.1-flash-lite",
    advancedModel: "gemini-3.5-flash",
    apiRetries: 3,
    initialDelay: 1500,
    enableSearchGrounding: false,
  };

  try {
    const saved = localStorage.getItem("fsn:settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.fastModel) defaultAiConfig.fastModel = parsed.fastModel;
      if (parsed.advancedModel) defaultAiConfig.advancedModel = parsed.advancedModel;
      if (parsed.apiRetries !== undefined) defaultAiConfig.apiRetries = Number(parsed.apiRetries);
      if (parsed.initialDelay !== undefined) defaultAiConfig.initialDelay = Number(parsed.initialDelay);
      if (parsed.enableSearchGrounding !== undefined) defaultAiConfig.enableSearchGrounding = !!parsed.enableSearchGrounding;
    }
  } catch (e) {
    console.warn("Could not read current AI config from settings, defaulting parameters.", e);
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        aiConfig: defaultAiConfig,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Servizio AI ha risposto con codice ${res.status}`);
    }

    const envelope: AIResponseEnvelope<T> = await res.json();
    
    // Accumulate diagnostic analytics
    updateAIStats(envelope.source, envelope.usage, envelope.retriesTriggered || 0);

    return envelope;
  } catch (error: any) {
    console.error(`AI call to ${endpoint} failed, enforcing client-side statistics recovery:`, error);
    updateAIStats("Fallback");
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Refactored and Unified Client Helpers
// ─────────────────────────────────────────────────────────────

export async function fetchDebrief(
  visit: SalesVisit,
  customPrompt: string,
  reportFormat: string
): Promise<AIResponseEnvelope<string>> {
  return callAIService<string>("/api/ai/debrief", {
    visit,
    customPrompt,
    reportFormat,
  });
}

export async function fetchImportVisits(
  text: string,
  weekKey: string,
  weekDates: string[],
  customPrompt: string
): Promise<AIResponseEnvelope<any[]>> {
  return callAIService<any[]>("/api/ai/import", {
    text,
    weekKey,
    weekDates,
    customPrompt,
  });
}

export async function fetchSingleVisitParse(
  text: string,
  defaultDate: string
): Promise<AIResponseEnvelope<any>> {
  return callAIService<any>("/api/ai/parse-single", {
    text,
    defaultDate,
  });
}

export async function fetchWeeklySummary(
  visits: SalesVisit[],
  weekKey: string,
  customPrompt: string
): Promise<AIResponseEnvelope<string>> {
  return callAIService<string>("/api/ai/weekly-summary", {
    visits,
    weekKey,
    customPrompt,
  });
}
