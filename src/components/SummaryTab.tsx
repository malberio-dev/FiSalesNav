import React, { useState } from "react";
import { Download, Sparkles, Clipboard, CheckCircle2, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import { SalesVisit } from "../types";
import { fetchWeeklySummary, AIResponseEnvelope } from "../utils/ai";
import * as XLSX from "xlsx";

interface SummaryTabProps {
  visits: SalesVisit[];
  weekKey: string;
  customPrompt: string;
  onOpenDebrief: (visit: SalesVisit) => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  visits,
  weekKey,
  customPrompt,
  onOpenDebrief,
}) => {
  const [weeklyReport, setWeeklyReport] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiMeta, setAiMeta] = useState<AIResponseEnvelope<string> | null>(null);
  const [error, setError] = useState("");

  // Get completed visits with active esito that aren't backlog
  const completedVisits = visits.filter(
    (v) => !!v.esito && v.esito !== "Cancellata/Backlog"
  );

  const handleGenerateWeeklySummary = async () => {
    if (completedVisits.length === 0) return;
    setGenerating(true);
    setError("");
    setAiMeta(null);

    try {
      const response = await fetchWeeklySummary(completedVisits, weekKey, customPrompt);
      if (response && response.success) {
        setWeeklyReport(response.data);
        setAiMeta(response);
      } else {
        throw new Error("Formato risposta AI non valido o vuoto.");
      }
    } catch (err: any) {
      setError(err.message || "Errore nella generazione del report settimanale.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(weeklyReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportXlsx = () => {
    if (completedVisits.length === 0) return;

    const dataRows = completedVisits.map((v) => ({
      DATA_VISITA: v.data,
      ORARIO: v.orario,
      CLIENTE: v.isDemo ? v.azienda.replace(" demo", "") : v.azienda,
      ESITO: v.esito,
      REPORT_COMPLETO_CRM: v.report || v.quickNote || "Incontro completato.",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Visite sales");

    const max_len = dataRows.reduce((prev: any, next: any) => {
      Object.keys(next).forEach((k) => {
        const val_len = String((next as any)[k]).length;
        prev[k] = Math.max(prev[k] || 10, val_len);
      });
      return prev;
    }, {} as any);
    worksheet["!cols"] = Object.keys(max_len).map((k) => ({ wch: Math.min(60, max_len[k] + 2) }));

    const fileName = `FiSalesNav_CRM_Export_${weekKey}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleCopySingleCRMText = (v: SalesVisit) => {
    const textFormat = `CLIENTE: ${v.azienda}
ESITO: ${v.esito}
--------------------------------------------------
REPORT CRM GENERATO:
${v.report || v.quickNote || "Visita effettuata con successo."}`;

    navigator.clipboard.writeText(textFormat);
    alert(`Report CRM per ${v.azienda} copiato negli appunti!`);
  };

  return (
    <div className="space-y-5">
      
      {/* Upper action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700">Riepilogo e Export CRM</h2>
          <p className="text-xs text-slate-500">Esporta i report d'incontro per alimentare velocemente il tuo CRM aziendale</p>
        </div>

        <button
          onClick={handleExportXlsx}
          disabled={completedVisits.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 transition"
        >
          <FileSpreadsheet className="w-4 h-4 fill-emerald-500 stroke-emerald-100" />
          Scarica Excel (.XLSX)
        </button>
      </div>

      {/* Metric summary counts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-slate-50/50 p-3 text-center">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pianificate</span>
          <span className="text-xl font-extrabold text-slate-700">{visits.length}</span>
        </div>
        <div className="rounded-xl border bg-slate-50/50 p-3 text-center">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Effettuate</span>
          <span className="text-xl font-extrabold text-emerald-600">{completedVisits.length}</span>
        </div>
        <div className="rounded-xl border bg-slate-50/50 p-3 text-center">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead Positivi</span>
          <span className="text-xl font-extrabold text-blue-600">
            {completedVisits.filter((v) => v.esito === "Positivo").length}
          </span>
        </div>
        <div className="rounded-xl border bg-slate-50/50 p-3 text-center">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ratio Positivi</span>
          <span className="text-xl font-extrabold text-indigo-600">
            {completedVisits.length > 0
              ? Math.round((completedVisits.filter((v) => v.esito === "Positivo").length / completedVisits.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      {/* AI general operations summary reporting */}
      {completedVisits.length > 0 && (
        <div className="rounded-2xl border bg-gradient-to-r from-blue-50/20 to-blue-50/70 p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                Aggiornamento Settimanale AI per Management
              </h3>
              <p className="text-xs text-slate-500">Gemini trasforma tutti i report della settimana in un'unica e-mail formale per la direzione vendite</p>
            </div>
            
            <button
              onClick={handleGenerateWeeklySummary}
              disabled={generating}
              className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition shadow-xs"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analisi...
                </>
              ) : (
                "Genera Sintesi"
              )}
            </button>
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              {error}
            </div>
          )}

          {weeklyReport && (
            <div className="bg-white border p-4 rounded-xl space-y-3 shadow-xs">
              <p className="text-xs font-serif leading-relaxed text-slate-700 whitespace-pre-wrap">{weeklyReport}</p>
              
              {/* Informative Diagnostic Badge */}
              {aiMeta && (
                <div className={`rounded-xl border p-2.5 text-[11px] flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-3xs ${
                  aiMeta.source === "AI" 
                    ? "bg-blue-50/40 border-blue-100/70 text-blue-800" 
                    : "bg-amber-50/50 border-amber-100/70 text-amber-800"
                }`}>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${aiMeta.source === "AI" ? "text-blue-500 animate-pulse" : "text-amber-500"}`} />
                    <div>
                      <span className="font-extrabold">{aiMeta.source === "AI" ? "Consolidato via AI:" : "Resoconto Locale:"}</span>{" "}
                      <span className="font-mono bg-white px-1.5 py-0.2 rounded border text-[10px] font-bold text-slate-650">{aiMeta.modelUsed}</span>
                      {Number(aiMeta.retriesTriggered || 0) > 0 && (
                        <span className="ml-1 text-[10px] text-blue-600 font-bold bg-blue-100 px-1.5 py-0.2 rounded">
                          +{aiMeta.retriesTriggered} retries
                        </span>
                      )}
                    </div>
                  </div>
                  {aiMeta.usage && (
                    <span className="font-mono text-[10px] text-slate-500">
                      Token consumati: <b>{aiMeta.usage.totalTokenCount}</b> (In: {aiMeta.usage.promptTokenCount} • Out: {aiMeta.usage.candidatesTokenCount})
                    </span>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  <Clipboard className="w-4.5 h-4.5" />
                  {copied ? "Copiata negli appunti!" : "Copia Testo per E-mail"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed visits List */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-700 mb-3 uppercase tracking-wider">Report e Debrief Singoli Completati</h3>

        {completedVisits.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-slate-400 bg-slate-50/40">
            Nessuna visita completata con debrief salvato in questa settimana.
          </div>
        ) : (
          <div className="space-y-3.5">
            {completedVisits.map((v) => (
              <div key={v.id} className="rounded-xl border bg-white shadow-xs p-4 space-y-3 hover:border-slate-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {v.isDemo ? v.azienda.replace(" demo", "") : v.azienda}
                      {v.isDemo && <span className="text-blue-500 ml-1 italic font-light font-mono text-[11px]">demo</span>}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">{v.data} &bull; {v.orario}</span>
                  </div>

                  <span className={`self-start sm:self-auto text-xs font-bold border rounded-full px-2.5 py-0.5 uppercase flex items-center gap-1.5 ${
                    v.esito === "Positivo" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                    v.esito === "Da seguire" ? "text-amber-700 bg-amber-50 border-amber-200" :
                    "text-rose-700 bg-rose-50 border-rose-200"
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {v.esito}
                  </span>
                </div>

                {v.report ? (
                  <div className="bg-slate-50/50 p-3 rounded-lg border">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Note CRM consolidata</span>
                    <p className="text-xs font-serif leading-relaxed text-slate-700">{v.report}</p>
                  </div>
                ) : v.quickNote ? (
                  <div className="bg-slate-50/50 p-3 rounded-lg border">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Appunti originari</span>
                    <p className="text-xs font-sans text-slate-600">{v.quickNote}</p>
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2.5 pt-1.5">
                  <button
                    onClick={() => onOpenDebrief(v)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                  >
                    Modifica debrief
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleCopySingleCRMText(v)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition font-sans"
                  >
                    Copia Record CRM
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
