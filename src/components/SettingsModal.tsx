import React, { useState } from "react";
import { X, Save, Sparkles, AlertCircle } from "lucide-react";
import { AppSettings } from "../types";

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

  const [activeTab, setActiveTab] = useState<"profile" | "prompts" | "demo">("profile");

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
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border bg-white shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Impostazioni & Configurazione AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b bg-slate-50 px-4">
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
            Prompt AI & Output CRM
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "demo"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Dati Demo
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
                <h3 className="text-sm font-bold text-slate-900 mb-3">Impostazioni Itinerario di Partenza</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Sede o Punto di Partenza
                    </label>
                    <input
                      type="text"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="E.g. Rovello Porro, CO"
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

          {activeTab === "prompts" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Debriefing / CRM Report Refinement Prompt
                </label>
                <textarea
                  rows={2}
                  value={debriefPrompt}
                  onChange={(e) => setDebriefPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none font-mono text-xs"
                  placeholder="Instruzioni per la rifinitura dei report fisici..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mass Visit Import Planner Instruction Prompt
                </label>
                <textarea
                  rows={2}
                  value={importPrompt}
                  onChange={(e) => setImportPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Weekly Summary Reporting Prompt
                </label>
                <textarea
                  rows={2}
                  value={summaryPrompt}
                  onChange={(e) => setSummaryPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none font-mono text-xs"
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
            Salva Modifiche
          </button>
        </div>

      </div>
    </div>
  );
};
