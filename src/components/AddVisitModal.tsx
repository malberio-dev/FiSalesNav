import React, { useState } from "react";
import { X, Sparkles, Loader2, Plus, AlertCircle, Check } from "lucide-react";
import { SalesVisit } from "../types";
import { fetchSingleVisitParse, AIResponseEnvelope } from "../utils/ai";
import { geocodeAddress } from "../utils/geo";

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (visit: SalesVisit) => void;
  defaultDate?: string;
  defaultTime?: string;
}

export const AddVisitModal: React.FC<AddVisitModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultDate = "",
  defaultTime = "09:00",
}) => {
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");
  const [freeText, setFreeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [aiMeta, setAiMeta] = useState<AIResponseEnvelope<any> | null>(null);
  const [error, setError] = useState("");

  // Form Fields
  const [azienda, setAzienda] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [data, setData] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [orario, setOrario] = useState(defaultTime);
  const [notePreVisita, setNotePreVisita] = useState("");
  const [quickNote, setQuickNote] = useState("");

  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidationStatus, setAddressValidationStatus] = useState<{valid: boolean; coords: [number, number]} | null>(null);

  if (!isOpen) return null;

  const handleVerifyAddress = async () => {
    if (!indirizzo.trim()) return;
    setIsValidatingAddress(true);
    setAddressValidationStatus(null);
    try {
      const coords = await geocodeAddress(indirizzo);
      if (coords) {
        const savedSettings = localStorage.getItem("fsn:settings");
        const simulateWrong = savedSettings ? JSON.parse(savedSettings).simulateWrongAddresses : false;

        if (simulateWrong) {
          // Force simulated error
          setAddressValidationStatus({ valid: false, coords: [0, 0] });
        } else {
          setAddressValidationStatus({ valid: true, coords });
        }
      } else {
        setAddressValidationStatus({ valid: false, coords: [0, 0] });
      }
    } catch (e) {
      setAddressValidationStatus({ valid: false, coords: [0, 0] });
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const handleAiParse = async () => {
    if (!freeText.trim()) return;
    setParsing(true);
    setError("");
    setAiMeta(null);

    try {
      const response = await fetchSingleVisitParse(freeText, data);
      
      if (response && response.success && response.data) {
        const parsed = response.data;
        setAiMeta(response);
        
        // Merge results into inputs
        if (parsed.azienda) setAzienda(parsed.azienda);
        if (parsed.indirizzo) setIndirizzo(parsed.indirizzo);
        if (parsed.data) setData(parsed.data);
        if (parsed.orario) setOrario(parsed.orario);
        if (parsed.notePreVisita) setNotePreVisita(parsed.notePreVisita);
        if (parsed.quickNote) setQuickNote(parsed.quickNote);

        setActiveTab("manual"); // Switch to manual to let them review and save!
      } else {
        throw new Error("La risposta dell'AI non contiene campi strutturati validi.");
      }
    } catch (err: any) {
      setError(err.message || "Errore nel caricamento dei dati AI.");
    } finally {
      setParsing(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!azienda.trim()) return;

    const newVisit: SalesVisit = {
      id: "visit_" + Date.now().toString(),
      azienda: azienda.trim(),
      indirizzo: indirizzo.trim(),
      data,
      orario,
      notePreVisita: notePreVisita.trim(),
      quickNote: quickNote.trim(),
      esito: "",
      prodotti: "",
      offerta: "",
      nextStep: "",
      report: "",
    };

    onAdd(newVisit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900">Nuova Visita Commerciale</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b bg-slate-50 px-4">
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "ai"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ✦ Inserimento Rapido AI
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "manual"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Moduli Strutturati
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "ai" ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Descrivi la visita con parole tue nel campo sottostante (es: "Visita lunedì mattina alle 10:30 da Acme Srl a Bergamo per valutare sensori intelligenti con l'ing. Rossi"). Gemini compilerà tutti i campi per te per la revisione!
              </p>

              {error && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Descrizione Incontro (Testo Libero)
                </label>
                <textarea
                  rows={4}
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="E.g. Visita mercoledì pomeriggio alle 15:00 da Marchesini Group, Bologna. Vediamo l'applicazione di confezionamento con il referente di reparto."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAiParse}
                  disabled={parsing || !freeText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition disabled:opacity-40"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analisi AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
                      Estrai e Compila Modulo
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualAdd} className="space-y-4">
              
              {/* Informative Diagnostic Badge */}
              {aiMeta && (
                <div className={`rounded-xl border p-2.5 text-[11px] flex items-center justify-between shadow-3xs ${
                  aiMeta.source === "AI" 
                    ? "bg-blue-50/40 border-blue-100/70 text-blue-800" 
                    : "bg-amber-50/50 border-amber-100/70 text-amber-800"
                }`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${aiMeta.source === "AI" ? "text-blue-500 animate-pulse" : "text-amber-500"}`} />
                    <div>
                      <span className="font-extrabold">Estrapolazione AI:</span>{" "}
                      <span className="font-mono bg-white border px-1 py-0.2 rounded font-bold">{aiMeta.modelUsed}</span>
                    </div>
                  </div>
                  {aiMeta.usage && (
                    <span className="font-mono text-[9px] text-slate-400">
                      Token: <b>{aiMeta.usage.totalTokenCount}</b>
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ragione Sociale Azienda *
                </label>
                <input
                  type="text"
                  required
                  value={azienda}
                  onChange={(e) => setAzienda(e.target.value)}
                  placeholder="E.g. Tetra Pak SpA"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Indirizzo (Via, Cap, Città, Prov)</span>
                  <button
                    type="button"
                    onClick={handleVerifyAddress}
                    disabled={isValidatingAddress || !indirizzo.trim()}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40"
                  >
                    {isValidatingAddress ? "Verifica in corso..." : "Verifica Indirizzo"}
                  </button>
                </label>
                <input
                  type="text"
                  value={indirizzo}
                  onChange={(e) => {
                    setIndirizzo(e.target.value);
                    setAddressValidationStatus(null);
                  }}
                  placeholder="E.g. Via Dell'Artigianato 10, Modena"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
                {addressValidationStatus && (
                  <div className={`mt-1.5 text-[10.5px] font-semibold flex items-center gap-1 ${
                    addressValidationStatus.valid ? "text-emerald-600" : "text-amber-500"
                  }`}>
                    {addressValidationStatus.valid ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        Indirizzo Geolocalizzato: {addressValidationStatus.coords[0].toFixed(4)}°, {addressValidationStatus.coords[1].toFixed(4)}°
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        Adesione Simulata o Errore: Indirizzo non tracciabile. Utilizzerà i km feriali generici standard di ripiego.
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Data Programmazione
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Ora Programmata
                  </label>
                  <input
                    type="time"
                    value={orario}
                    onChange={(e) => setOrario(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Note Pre-Visita (Brief preventivo)
                </label>
                <textarea
                  rows={2}
                  value={notePreVisita}
                  onChange={(e) => setNotePreVisita(e.target.value)}
                  placeholder="E.g. Portare catalogo barriere fotoelettriche piane. Verificare compatibilità PLC"
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={!azienda.trim()}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Crea Visita
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
