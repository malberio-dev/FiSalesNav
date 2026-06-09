import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI Client
let ai: GoogleGenAI | null = null;
const key = process.env.GEMINI_API_KEY;

if (key) {
  ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Google GenAI client initialized successfully on the server.");
} else {
  console.warn("Warning: GEMINI_API_KEY is not defined. AI functions will fall back to local parsing rules.");
}

// Helper to robustly clean and parse JSON from Gemini (in case of markdown code block wrappers)
function cleanAndParseJSON(text: string | undefined, fallback: any): any {
  if (!text) return fallback;
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
    cleaned = cleaned.replace(/\n?```$/i, "");
  }
  try {
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error("Failed to parse JSON after cleaning:", cleaned, e);
    return fallback;
  }
}

// Robust wrapper to call Gemini API with automatic retry and model fallback on 429 Resource Exhausted / rate-limit/quota errors.
async function generateContentWithRetry(params: { model: string; contents: any; config?: any }, retries = 3, initialDelay = 1500): Promise<any> {
  if (!ai) {
    throw new Error("Gemini AI client not initialized.");
  }
  
  let attempt = 0;
  let delayMs = initialDelay;
  let currentModel = params.model;

  while (attempt < retries) {
    try {
      return await ai.models.generateContent({
        ...params,
        model: currentModel,
      });
    } catch (error: any) {
      attempt++;
      const errorMsg = error.message || "";
      const isRateLimit = error.status === "RESOURCE_EXHAUSTED" || 
                          error.statusCode === 429 || 
                          errorMsg.includes("429") ||
                          errorMsg.includes("quota") ||
                          errorMsg.includes("QUOTA_EXCEEDED") ||
                          errorMsg.includes("limit") ||
                          errorMsg.includes("exhausted");

      console.warn(`[AI Attempt ${attempt}/${retries}] Model: ${currentModel} failed. Error: ${errorMsg}`);

      if (isRateLimit && attempt < retries) {
        // Fallback model replacement strategy on the second or third attempt
        if (currentModel === "gemini-3.5-flash" && attempt >= 2) {
          console.warn("Switching from gemini-3.5-flash to highly-stable gemini-2.5-flash to bypass potential model-specific tier limits.");
          currentModel = "gemini-2.5-flash";
        }
        
        console.warn(`Waiting ${delayMs}ms before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        // If it's not a rate/quota limit, or if we have run out of retries, propagate the error.
        throw error;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// API Endpoints for AI Assistance
// ─────────────────────────────────────────────────────────────

// 1. Refine Debrieifing / Generate CRM Report
app.post("/api/ai/debrief", async (req, res) => {
  const { visit, customPrompt, reportFormat } = req.body;
  if (!visit) {
    return res.status(400).json({ error: "Visit data is required" });
  }

  const handleFallback = () => {
    return `[Sintesi Locale] Visita data da ${visit.azienda}.
Esito: ${visit.esito || "Non specificato"}.
Note raccolte: ${visit.quickNote || "Nessuna nota aggiuntiva"}.
Prodotti discussi: ${visit.prodotti || "—"}. Offerta: ${visit.offerta || "—"}.
Prossimi Passaggi: ${visit.nextStep || "Monitorare opportunità"}.`;
  };

  if (!ai) {
    return res.json({ report: handleFallback(), warning: "GEMINI_API_KEY non definita. Uso fallback locale." });
  }

  try {
    const prompt = `Sei un assistente AI specializzato per agenti di vendita nel settore automazione industriale (ad es. sensori ed interfacce industriali).
Il tuo compito è convertire gli appunti rapidi ("quickNote" o "note libere") presi dopo un incontro in un report formale ed elegante in lingua Italiana adatto per il CRM aziendale.

DATI DELLA VISITA:
- Cliente/Azienda: ${visit.azienda}
- Prodotti discussi: ${visit.prodotti || "N/A"}
- Esito concordato: ${visit.esito}
- Codice Offerta formulata: ${visit.offerta || "N/A"}
- Prossimi passaggi (Next Step): ${visit.nextStep || "N/A"}
- Note rapide inserite dall'agente: "${visit.quickNote || ""}" - "${visit.note || ""}"

CONTESTO UTENTE / LINEE GUIDA:
${customPrompt || "Correggi la punteggiatura, migliora la forma espressiva e mantieni un approccio molto professionale ed incentrato sulle opportunità commerciali."}

FORMATO DI OUTPUT RICHIESTO:
${reportFormat || "Genera una sintesi testuale formata da 2 o 3 paragrafi: introduzione e contesto, dettagli tecnici o di business discussi, e conclusioni operative con prossimi passi espliciti."}

Fornisci esclusivamente il testo del report finale, senza alcuna introduzione, commento o formattazione markdown inutile.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ report: response.text?.trim() || "Nessun testo generato dall'AI." });
  } catch (error: any) {
    console.error("AI Debrief error, falling back:", error);
    res.json({ 
      report: handleFallback(), 
      warning: "Servizio AI non disponibile temporaneamente (Quota/Chiamata fallita). Utilizzato motore locale: " + error.message 
    });
  }
});

// 2. Unstructured mass import parsing
app.post("/api/ai/import", async (req, res) => {
  const { text, weekKey, weekDates, customPrompt } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text to parse is required" });
  }

  const handleLocalParse = () => {
    const lines = text.split("\n").filter((l: string) => l.trim().length > 3);
    return lines.map((line: string, index: number) => {
      const parts = line.split(/[;,-]/);
      const company = parts[0]?.trim() || "Cliente Generico";
      const valDate = weekDates && weekDates.length > 0 ? weekDates[index % weekDates.length] : "2026-06-08";
      return {
        azienda: company,
        indirizzo: parts[1]?.trim() || "Milano, Italia",
        data: valDate,
        orario: "10:00",
        notePreVisita: "Importato tramite ripiego locale (Quota AI superata). Nota: " + line,
        quickNote: ""
      };
    });
  };

  if (!ai) {
    return res.json({ visits: handleLocalParse(), warning: "GEMINI_API_KEY non definita. Uso fallback locale." });
  }

  try {
    const datesInfo = weekDates ? `Giornate disponibili della settimana: ${weekDates.join(", ")}` : "";
    const systemPrompt = `Sei un pianificatore esperto per responsabili vendite nel settore industriale.
Analizza il testo non strutturato (appunti, email, calendari copiati) inserito dall'utente e convertilo in una lista strutturata di visite commerciali programmando ciascuna di esse in una delle giornate disponibili.

INFORMAZIONI DI SETTIMANA:
- Chiave settimana: ${weekKey || "Corrente"}
- ${datesInfo}

TESTO NON STRUTTURATO DA ELABORARE:
"""
${text}
"""

LINEE GUIDA AGGIUNTIVE E REGOLE SUI DATI:
${customPrompt || "Distribuisci equamente le visite nelle giornate disponibili cercando di ottimizzare i tempi geografici se indicati nel testo. Genera una breve nota commerciale preventiva nel campo 'notePreVisita' basata sulla tipologia del cliente, se deducibile."}

REGOLE CRITICHE SULL'INDIRIZZO:
Per ogni visita estratta, se viene menzionata un'azienda e un comune o città parziale (es. "ratti guanzate" o "tetra pak modena"), sforzati di individuare l'indirizzo stradale completo e preciso di questa filiale/fabbrica in Italia.
Se non riesci ad ottenere la via esatta, scrivi come minimo "Comune, SiglaProvincia, Italia" (es. "Guanzate, CO, Italia" oppure "Modena, MO, Italia"). Non inserire mai diciture troncate o solo il nome del paese senza sigla provincia se puoi dedurla.

Restituisci l'elenco completo in formato JSON valido che rispecchia rigorosamente lo schema indicato.`;

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        description: "Lista di visite commerciali estratte e assegnate ai giorni disponibili",
        items: {
          type: Type.OBJECT,
          properties: {
            azienda: { type: Type.STRING, description: "Denominazione/Ragione sociale dell'azienda" },
            indirizzo: { type: Type.STRING, description: "Indirizzo completo (Via, Civico, Cap, Città, Sigla Provincia)" },
            data: { type: Type.STRING, description: "Data pianificata in formato YYYY-MM-DD" },
            orario: { type: Type.STRING, description: "Orario pianificato in formato HH:MM (es: 09:30, 14:00)" },
            notePreVisita: { type: Type.STRING, description: "Sintesi preparatoria o note pre-visita" },
            quickNote: { type: Type.STRING }
          },
          required: ["azienda", "data", "orario"]
        }
      }
    };

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config,
    });

    const parsedVisits = cleanAndParseJSON(response.text, []);
    res.json({ visits: parsedVisits });
  } catch (error: any) {
    console.error("AI Import error, falling back:", error);
    res.json({ 
      visits: handleLocalParse(), 
      warning: "Servizio AI non disponibile temporaneamente (Quota/Chiamata fallita). Utilizzato motore locale: " + error.message 
    });
  }
});

// 3. Single-visit free text parsing
app.post("/api/ai/parse-single", async (req, res) => {
  const { text, defaultDate } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const handleFallback = () => {
    return {
      azienda: text.split(/[;,-]|\s+/)[0] || "Nuovo Cliente",
      indirizzo: text.includes(",") ? text.substring(text.indexOf(",") + 1).trim() : "Milano, Italia",
      data: defaultDate || new Date().toISOString().slice(0, 10),
      orario: "09:00",
      notePreVisita: "Dettaglio generato da ripiego locale (Quota AI superata).",
      quickNote: text
    };
  };

  if (!ai) {
    return res.json(handleFallback());
  }

  try {
    const prompt = `Estrai le informazioni per una singola visita commerciale dal seguente appunto di testo libero.
Data predefinita se non specificata diversamente nel testo: ${defaultDate || "Corrente"}

TESTO LIBERO:
"${text}"

ISTRUZIONI CRITICHE SULL'INDIRIZZO:
Se viene menzionata un'azienda e un comune o città (es. "ratti guanzate" o "famar abbbiategrasso"), sforzati di individuare l'indirizzo stradale completo, reale e preciso di questa azienda in Italia (es. "Via Tornese, 10, 22070 Guanzate CO").
Se per qualche motivo non trovi l'indirizzo stradale esatto dell'azienda, espandi comunque l'indirizzo formattandolo come dicitura corretta con provincia in Italia (es. "Guanzate, CO, Italia" oppure "Guanzate, Como, Italia") in modo che possa essere geolocalizzato in seguito facilmente.
Non impostare come campo indirizzo semplicemente la parola dell'appunto si contiene solo nome azienda e città; trasforma indirizzo in una dicitura stradale valida e geolocalizzabile.

Estrai e restituisci un oggetto JSON strutturato secondo i campi richiesti. Completa le informazioni mancanti basandoti su deduzioni logiche se possibile.`;

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          azienda: { type: Type.STRING, description: "Nome dell'azienda visitata" },
          indirizzo: { type: Type.STRING, description: "Indirizzo o città principale emersa nel testo, possibilmente estesa a via/cap/provincia" },
          data: { type: Type.STRING, description: "Data pianificata YYYY-MM-DD" },
          orario: { type: Type.STRING, description: "Orario dell'incontro formato HH:MM" },
          notePreVisita: { type: Type.STRING, description: "Obbiettivi o contesto pre-incontro" },
          quickNote: { type: Type.STRING, description: "Eventuali appunti rapidi aggiuntivi" }
        },
        required: ["azienda", "data"]
      }
    };

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config,
    });

    const parsedObj = cleanAndParseJSON(response.text, {});
    res.json(parsedObj);
  } catch (error: any) {
    console.error("AI Single Parse error, falling back:", error);
    res.json({
      ...handleFallback(),
      warning: "Servizio AI non disponibile temporaneamente (Quota/Chiamata fallita). Utilizzato motore locale: " + error.message
    });
  }
});

// 4. Generate Weekly Summary
app.post("/api/ai/weekly-summary", async (req, res) => {
  const { visits, weekKey, customPrompt } = req.body;
  if (!visits || !Array.isArray(visits)) {
    return res.status(400).json({ error: "Completed visits list is required" });
  }

  const handleFallback = () => {
    const listSummary = visits.map((v: any) => `- ${v.azienda}: Esito: ${v.esito || "Non registrato"}. Prodotti discussi: ${v.prodotti || "—"}`).join("\n");
    return `[Sintesi Locale - Quota AI Limitata] Sintesi della Settimana ${weekKey || "Corrente"}:\nSorte delle visite completate:\n${listSummary || "Nessuna visita completata registrata."}`;
  };

  if (!ai) {
    return res.json({
      summary: handleFallback()
    });
  }

  try {
    // DATI DELLE VISITE COMPLETATE NELLA SETTIMANA
    const prompt = `Sei un Direttore Vendite o un Senior Sales Engineer che redige una sintesi settimanale professionale ("Weekly Activity Highlights") destinata al management aziendale.
Analizza l'elenco delle visite effettuate (con esiti positivi o critici, argomenti, ed offerte emesse) e genera un riepilogo discorsivo formale ma accattivante in lingua Italiana.

DATI DELLE VISITE COMPLETATE NELLA SETTIMANA ${weekKey || ""}:
${JSON.stringify(visits.map((v: any) => ({
  azienda: v.azienda,
  esito: v.esito,
  prodotti: v.prodotti,
  offerta: v.offerta,
  nextStep: v.nextStep,
  report: v.report
})))}

CONTESTO UTENTE / REQUISITI AGGIUNTIVI:
${customPrompt || "Riassumi l'andamento commerciale complessivo, evidenzia le trattative più promettenti (esiti positivi), le necessità tecniche immediate e la sinergia sui sistemi di sensori o networking."}

Fornisci esclusivamente il testo del riepilogo (lungo indicativamente 150-250 parole), senza intestazioni markdown o commenti iniziali.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text?.trim() || "Impossibile generare la sintesi settimanale." });
  } catch (error: any) {
    console.error("AI Weekly Summary error, falling back:", error);
    res.json({ 
      summary: handleFallback(),
      warning: "Servizio AI non disponibile temporaneamente (Quota/Chiamata fallita). Utilizzato motore locale: " + error.message 
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Vite Server Integration for Development OR Static Production Asset Serving
// ─────────────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server middleware in local development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development server integrated with Vite middleware.");
  } else {
    // Serve static compiled output files from /dist in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files in production mode from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
