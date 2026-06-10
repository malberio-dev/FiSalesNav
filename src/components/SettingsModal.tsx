import React, { useState } from "react";
import { X, Save, Sparkles, AlertCircle, RefreshCw, BarChart, Shield, HelpCircle } from "lucide-react";
import { AppSettings } from "../types";
import { getAIStats, resetAIStats, AIStats } from "../utils/ai";

interface SettingsModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  onInjectDemoData: () => void;
  onClearDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
  onInjectDemoData,
  onClearDemoData,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [company, setCompany] = useState(settings.company);
  const [assignedAreas, setAssignedAreas] = useState(settings.assignedAreas);
  const [startLocation, setStartLocation] = useState(settings.startLocation);
  const [startTime, setStartTime] = useState(settings.startTime);
  const [debriefPrompt, setDebriefPrompt] = useState(settings.debriefPrompt);
  const [importPrompt, setImportPrompt] = useState(settings.importPrompt);
  const [summaryPrompt, setSummaryPrompt] = useState(settings.summaryPrompt);
  const [reportFormat, setReportFormat] = useState(settings.reportFormat);

  // New AI Specific States
  const [fastModel, setFastModel] = useState(settings.fastModel || "gemini-3.1-flash-lite");
  const [advancedModel, setAdvancedModel] = useState(settings.advancedModel || "gemini-3.5-flash");
  const [apiRetries, setApiRetries] = useState(settings.apiRetries ?? 3);
  const [initialDelay, setInitialDelay] = useState(settings.initialDelay ?? 1500);
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(!!settings.enableSearchGrounding);
  const [simulateWrongAddresses, setSimulateWrongAddresses] = useState(!!settings.simulateWrongAddresses);

  const [aiStats, setAiStats] = useState<AIStats>(getAIStats());
  const [activeTab, setActiveTab] = useState<"profile" | "prompts" | "ai" | "demo">("profile");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      userName,
      company,
      assignedAreas,
      startLocation,
      startTime,
      debriefPrompt,
      importPrompt,
      summaryPrompt,
      reportFormat,
      fastModel,
      advancedModel,
      apiRetries,
      initialDelay,
      enableSearchGrounding,
      simulateWrongAddresses,
    });
    onClose();
  };

  const handleResetStats = () => {
    resetAIStats();
    setAiStats(getAIStats());
  };

  // Cost estimates: $0.075 per 1M prompt tokens, $0.30 per 1M candidates tokens (standard Gemini Flash pricing)
  const calculateEstimateCost = () => {
    const promptCost = (aiStats.promptTokens / 1000000) * 0.075;
    const candidatesCost = (aiStats.candidatesTokens / 1000000) * 0.30;
    const total = promptCost + candidatesCost;
    return total === 0 ? "0.0000" : total.toFixed(5);
  };

  const totalCalls = aiStats.successCalls + aiStats.fallbackCalls;
  const aiSuccessRatio = totalCalls > 0 ? Math.round((aiStats.successCalls / totalCalls) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border bg-white shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Impostazioni Applicazione</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b bg-slate-50 px-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Profilo Utente
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "prompts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Direttive Prompt
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "ai"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Configurazione & Consumi AI
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "demo"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Sandbox / Dati Demo
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {/* 1. Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Nome Agente
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                    placeholder="E.g. Marco Alberio"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Azienda / Divisione
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                    placeholder="E.g. Automation SpA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Aree Assegnate
                </label>
                <input
                  type="text"
                  value={assignedAreas}
                  onChange={(e) => setAssignedAreas(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                  placeholder="E.g. Lombardia Ovest, Emilia-Romagna Nord"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3 font-sans">Impostazioni Itinerario di Partenza</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Indirizzo Casa / Punto di Partenza (Anello TSP)
                    </label>
                    <input
                      type="text"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="E.g. Saronno, VA, Italia"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Orario Partenza
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Prompts Tab */}
          {activeTab === "prompts" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Debriefing / CRM Report Refinement Prompt</span>
                  <span className="text-[10px] text-blue-600 font-mono font-normal">Sintesi Conversazione</span>
                </label>
                <textarea
                  rows={2}
                  value={debriefPrompt}
                  onChange={(e) => setDebriefPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none font-mono text-xs leading-relaxed"
                  placeholder="Istruzioni per la rifinitura dei report fisici..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Mass Visit Import Planner Instruction Prompt</span>
                  <span className="text-[10px] text-blue-600 font-mono font-normal">Pianificazione Massiva</span>
                </label>
                <textarea
                  rows={2}
                  value={importPrompt}
                  onChange={(e) => setImportPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none font-mono text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Weekly Summary Reporting Prompt</span>
                  <span className="text-[10px] text-blue-600 font-mono font-normal">Attività Settimanale</span>
                </label>
                <textarea
                  rows={2}
                  value={summaryPrompt}
                  onChange={(e) => setSummaryPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none font-mono text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Formato Report CRM Atteso
                </label>
                <input
                  type="text"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                  placeholder="E.g. Paragrafi strutturati: Contesto, Discussione, Prossimi Passi"
                />
              </div>
            </div>
          )}

          {/* 3. AI engine setting and telemetry */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              
              {/* Core selection controls */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    Modello Lettura / Parser (Veloce)
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Utilizzato per il parsing singolo, massivo e geolocalizzazione." />
                  </label>
                  <select
                    value={fastModel}
                    onChange={(e) => setFastModel(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Leggero - Elevata Quota)</option>
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Consigliato - Standard)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Uso Generico)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    Modello Report & CRM (Elaborato)
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Impiegato per comporre sintesi settimanali strutturate e debriefing estesi." />
                  </label>
                  <select
                    value={advancedModel}
                    onChange={(e) => setAdvancedModel(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Standard Veloce)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Consumo Minimo)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Standard precedente)</option>
                  </select>
                </div>
              </div>

              {/* Retry & Timing Configuration */}
              <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-slate-500" />
                  Parametri Resilienza AI & Quota
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 flex justify-between">
                      <span>Tentativi di Retry:</span>
                      <span className="font-mono text-blue-600">{apiRetries} tentativi</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={apiRetries}
                      onChange={(e) => setApiRetries(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 flex justify-between">
                      <span>Ritardo Iniziale Backoff:</span>
                      <span className="font-mono text-blue-600">{initialDelay} ms</span>
                    </label>
                    <input
                      type="range"
                      min={500}
                      max={4000}
                      step={250}
                      value={initialDelay}
                      onChange={(e) => setInitialDelay(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                <div className="mt-2.5 border-t pt-2.5 flex items-center justify-between">
                  <div className="pr-4">
                    <label className="text-xs font-bold text-slate-705 block">Abilita Google Search Grounding</label>
                    <p className="text-[10px] text-slate-400">Consente a Gemini di cercare l'indirizzo aziendale su Google in tempo reale (ad es. "ratti guanzate") per ricavare la via precisa.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSearchGrounding}
                    onChange={(e) => setEnableSearchGrounding(e.target.checked)}
                    className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 accent-blue-600 focus:outline-hidden cursor-pointer"
                  />
                </div>

                <div className="mt-2.5 border-t pt-2.5 flex items-center justify-between">
                  <div className="pr-4">
                    <label className="text-xs font-bold text-slate-705 block">Simula Indirizzi Errati (Debug)</label>
                    <p className="text-[10px] text-slate-400">Simula errori o anomalie di geolocalizzazione per testare la resilienza dell'app nei calcoli feriali.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateWrongAddresses}
                    onChange={(e) => setSimulateWrongAddresses(e.target.checked)}
                    className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 accent-blue-600 focus:outline-hidden cursor-pointer"
                  />
                </div>
              </div>

              {/* Storage Telemetry Panel */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-blue-600 tracking-wider flex items-center gap-1.5">
                    <BarChart className="w-4.5 h-4.5" />
                    Telemetria e Statistiche di Consumo
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetStats}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-white border px-2 py-1 rounded-md shadow-xs active:scale-95 transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Azzera Consumi
                  </button>
                </div>

                {/* Counter boxes */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border shadow-3xs flex flex-col justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Rapporto Esecuzione</span>
                    <span className="text-lg font-extrabold text-blue-600 mt-0.5">{aiSuccessRatio}% AI</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{aiStats.successCalls} completate • {aiStats.fallbackCalls} locali</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border shadow-3xs flex flex-col justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Token Utilizzati</span>
                    <span className="text-lg font-extrabold text-slate-800 mt-0.5 font-mono">
                      {aiStats.totalTokens.toLocaleString("it-IT")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Prompt: {aiStats.promptTokens.toLocaleString("it-IT")} • Cand: {aiStats.candidatesTokens.toLocaleString("it-IT")}</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border shadow-3xs flex flex-col justify-center text-center col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Costo Stimato API</span>
                    <span className="text-lg font-extrabold text-teal-600 mt-0.5 font-mono">${calculateEstimateCost()}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Tariffe base Google LLM</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed font-sans italic bg-white p-2.5 rounded-lg border border-dashed text-center">
                  *I dati relativi ai token e all'efficacia delle chiamate vengono calcolati e salvati in locale ad ogni operazione di pianificazione, debriefing e riepilogo settimanale.
                </div>
              </div>

            </div>
          )}

          {/* 4. Demo Data Tab */}
          {activeTab === "demo" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Popola con Dati Demo per Test</h4>
                  <p className="leading-relaxed">
                    Questa opzione caricherà automaticamente <b>30 visite commerciali organizzate intelligentemente su 25 clienti industriali reali</b> (packaging, ceramica, farmaceutico) situati nell'area di Milano ed Emilia per la settimana correntemente visualizzata.
                  </p>
                  <p className="mt-2 font-medium">
                    Tutti i nomi delle aziende demo terminano con <b>" demo"</b> per permetterti di distinguerli facilmente ed evitare la miscelazione con record commerciali reali.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onInjectDemoData();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                  Carica 30 Visite Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearDemoData();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm shadow-lg shadow-red-500/20 hover:bg-red-700 transition"
                >
                  Pulisci Dati Demo
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
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Salva Impostazioni
          </button>
        </div>

      </div>
    </div>
  );
};
