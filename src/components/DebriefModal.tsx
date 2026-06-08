import React, { useState } from "react";
import { X, Sparkles, AlertCircle, Save, Loader2, ArrowUpRight } from "lucide-react";
import { SalesVisit } from "../types";
import { fetchDebrief } from "../utils/ai";

interface DebriefModalProps {
  visit: SalesVisit;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: SalesVisit) => void;
  onMoveToBacklog: (visit: SalesVisit) => void;
  customPrompt: string;
  reportFormat: string;
}

export const DebriefModal: React.FC<DebriefModalProps> = ({
  visit,
  isOpen,
  onClose,
  onSave,
  onMoveToBacklog,
  customPrompt,
  reportFormat,
}) => {
  const [esito, setEsito] = useState(visit.esito || "Positivo");
  const [prodotti, setProdotti] = useState(visit.prodotti || "");
  const [offerta, setOfferta] = useState(visit.offerta || "");
  const [nextStep, setNextStep] = useState(visit.nextStep || "");
  const [quickNote, setQuickNote] = useState(visit.quickNote || "");
  const [report, setReport] = useState(visit.report || "");

  const [refining, setRefining] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAiRefine = async () => {
    setRefining(true);
    setError("");
    try {
      // Assemble temporary object representing current state of inputs
      const tempVisit: SalesVisit = {
        ...visit,
        esito: esito as any,
        prodotti,
        offerta,
        nextStep,
        quickNote,
      };

      const resultText = await fetchDebrief(tempVisit, customPrompt, reportFormat);
      setReport(resultText);
    } catch (err: any) {
      setError(err.message || "Errore nella comunicazione con Gemini.");
    } finally {
      setRefining(false);
    }
  };

  const handleSave = () => {
    if (esito === "Cancellata/Backlog") {
      onMoveToBacklog({
        ...visit,
        esito: "Cancellata/Backlog",
        prodotti,
        offerta,
        nextStep,
        quickNote,
        report,
      });
      return;
    }

    onSave({
      ...visit,
      esito: esito as any,
      prodotti,
      offerta,
      nextStep,
      quickNote,
      report,
    });
  };

  const handleBacklogClick = () => {
    onMoveToBacklog({
      ...visit,
      esito: "Cancellata/Backlog",
      prodotti,
      offerta,
      nextStep,
      quickNote,
      report,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Debriefing Visita</h2>
            <p className="text-xs font-semibold text-blue-600 tracking-tight mt-0.5">{visit.azienda}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Esito Incontro *
            </label>
            <select
              value={esito}
              onChange={(e) => setEsito(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="Positivo">Positivo (Trattativa avviata)</option>
              <option value="Da seguire">Da seguire (In attesa di dati)</option>
              <option value="Negativo">Negativo (Nessun interesse)</option>
              <option value="Cancellata/Backlog">Cancellata / Sposta in Backlog</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Testo Libero / Note Rapide
            </label>
            <textarea
              rows={4}
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="E.g. Incontro con Ing. Rossi. Molto interessato a IO-Link. Linea ferma per test ad agosto."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          {/* AI Generation Control Area */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Report CRM Generato da Gemini
              </span>
              <button
                type="button"
                onClick={handleAiRefine}
                disabled={refining}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40"
              >
                {refining ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Elaborazione Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    Migliora e Genera con AI
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <textarea
              rows={4}
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Premi 'Genera con AI' per comporre automaticamente una stesura professionale delle tue note rapide conforme alle direttive aziendali."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none bg-slate-50 font-serif leading-relaxed"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={handleBacklogClick}
            className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-red-700 hover:bg-slate-100/60 rounded-lg transition"
            title="Sposta subito in backlog ed elimina dalla pianificazione"
          >
            <ArrowUpRight className="w-4.5 h-4.5" />
            Annulla Visita
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Chiudi
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Salva Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
