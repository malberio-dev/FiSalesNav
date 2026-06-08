import React, { useState } from "react";
import { X, Sparkles, Loader2, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { SalesVisit } from "../types";
import { fetchImportVisits } from "../utils/ai";

interface ImportVisitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekKey: string;
  weekDates: string[];
  onImport: (visits: SalesVisit[]) => void;
  customPrompt: string;
}

export const ImportVisitsModal: React.FC<ImportVisitsModalProps> = ({
  isOpen,
  onClose,
  weekKey,
  weekDates,
  onImport,
  customPrompt,
}) => {
  const [inputText, setInputText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [previewVisits, setPreviewVisits] = useState<any[]>([]);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleProcessImport = async () => {
    if (!inputText.trim()) return;
    setParsing(true);
    setError("");

    try {
      const resultObj = await fetchImportVisits(
        inputText,
        weekKey,
        weekDates,
        customPrompt
      );
      
      if (resultObj && Array.isArray(resultObj)) {
        setPreviewVisits(resultObj);
        setStep("preview");
      } else {
        throw new Error("Formato risposta AI non riconosciuto o vuoto.");
      }
    } catch (err: any) {
      setError(err.message || "Errore nella comunicazione con il pianificatore AI.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = () => {
    const visitsToImport: SalesVisit[] = previewVisits.map((p, idx) => {
      return {
        id: "visit_imp_" + (Date.now() + idx).toString(),
        azienda: p.azienda,
        indirizzo: p.indirizzo || "Indirizzo da definire, Italia",
        data: p.data || weekDates[0],
        orario: p.orario || "09:00",
        notePreVisita: p.notePreVisita || "",
        quickNote: p.quickNote || "",
        esito: "",
        prodotti: "",
        offerta: "",
        nextStep: "",
        report: "",
      };
    });

    onImport(visitsToImport);
    onClose();
  };

  // Human friendly day formatter
  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return isoDate;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Import Massivo con AI</h2>
              <p className="text-xs text-slate-500 font-medium">Settimana {weekKey}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "input" ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 border p-4 text-xs text-slate-600 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-800">Compila l'itinerario in pochi secondi!</p>
                <p>
                  Incolla un'email ricevuta, un elenco grezzo di clienti, un estratto CRM o degli appunti casuali. L'AI interpreterà le richieste di incontro ed organizzerà un piano visite ottimizzato (max 3-4 visite al giorno) per i 5 giorni lavorativi della settimana:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {weekDates.map(d => (
                    <li key={d} className="font-mono text-[10px] text-slate-500">
                      {formatDateLabel(d)} ({d})
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Incolla Lista o Testo Grezzo
                </label>
                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`E.g.\n- Sacmi Group, Imola il martedì mattina\n- Tetra Pak, Modena il giovedì verso le 15\n- Fare un salto da Sidel a Parma per presentare IO-Link venerdì ore 9\n- Caffè rapido con Barilla lunedì pomeriggio`}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={parsing || !inputText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition disabled:opacity-40"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Elaborazione Gemini...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Pianifica Settimana con AI
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-800 flex gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-0.5 text-emerald-900">Pianificazione AI completata!</h4>
                  <p>
                    Ecco l'anteprima delle visite strutturate trovate. Rivedi i dettagli prima di importarle definitivamente nel Calendario.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden shadow-xs bg-slate-50">
                {previewVisits.map((p, idx) => (
                  <div key={idx} className="p-4 bg-white flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{p.azienda}</h4>
                      <p className="text-xs text-slate-500 font-mono truncate">{p.indirizzo || "Indirizzo da concordare"}</p>
                      {p.notePreVisita && (
                        <p className="text-xs italic text-slate-500 mt-1 line-clamp-1">"{p.notePreVisita}"</p>
                      )}
                    </div>
                    <div className="flex flex-row items-center gap-2 mt-2 sm:mt-0 sm:flex-shrink-0">
                      <span className="px-2 py-1 rounded bg-slate-100 border text-[11px] font-semibold text-slate-700 font-mono">
                        {p.orario}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700 font-mono">
                        {formatDateLabel(p.data)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-semibold"
                >
                  &larr; Correggi Testo di Input
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Annulla
          </button>
          
          {step === "preview" && (
            <button
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-md"
            >
              Conferma ed Importa ({previewVisits.length} Visite)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
