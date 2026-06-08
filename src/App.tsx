import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SettingsModal } from "./components/SettingsModal";
import { DebriefModal } from "./components/DebriefModal";
import { AddVisitModal } from "./components/AddVisitModal";
import { ImportVisitsModal } from "./components/ImportVisitsModal";

// Modular Tabs
import { TodayTab } from "./components/TodayTab";
import { CalendarTab } from "./components/CalendarTab";
import { SummaryTab } from "./components/SummaryTab";
import { SandboxTab } from "./components/SandboxTab";
import { BacklogTab } from "./components/BacklogTab";

// Model Utilities
import { AppSettings, SalesVisit } from "./types";
import { generateDemoVisits } from "./utils/demo";

// Default settings parameters
const DEFAULT_SETTINGS: AppSettings = {
  userName: "Alessandro Rossi",
  company: "Automation SpA",
  assignedAreas: "Lombardia Ovest, Emilia-Romagna",
  startLocation: "Rovello Porro, CO",
  startTime: "08:15",
  debriefPrompt: "Revisiona con tono estremamente professionale, eliminando espressioni gergali. Correggi la grammatica e la punteggiatura strutturando il testo in modo formale e schematico.",
  importPrompt: "Assegna ciascuna riga ad un giorno lavorativo della settimana. Evita di concentrare troppe visite nello stesso giorno. Fornisci per ciascuna riga delle note pre-visita sensate in base al settore industriale.",
  summaryPrompt: "Analizza l'attività settimanale evidenziando l'accoglimento delle soluzioni e gli ordini potenziali.",
  reportFormat: "Report commerciale ad alta leggibilità, strutturato con: Contesto/Opportunità, Richieste del Cliente, Azioni Correttive/Next Steps.",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"oggi" | "calendario" | "riepilogo" | "sandbox" | "backlog">("oggi");
  const [dbStatus, setDbStatus] = useState<"online" | "syncing" | "offline">("offline");

  // Week Navigator Coordinates
  const [currentWeekBase, setCurrentWeekBase] = useState(() => {
    const today = new Date();
    // Move base to current Monday
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(today.setDate(diff));
    return mon;
  });

  // Settings state
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // General visits database
  const [visits, setVisits] = useState<SalesVisit[]>([]);

  // Modal open/close coordinates
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [debriefVisit, setDebriefVisit] = useState<SalesVisit | null>(null);

  // Target specific pre-assigned date parameter for Quick-Add triggers
  const [targetQuickAddDate, setTargetQuickAddDate] = useState<string | undefined>(undefined);

  // 1. Initial Local Database Loading Hook
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("fsn:settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedVisits = localStorage.getItem("fsn:visits");
      if (savedVisits) {
        setVisits(JSON.parse(savedVisits));
      } else {
        // Hydrate initially with simple sample mock visit if completely blank
        const hydratedDefault: SalesVisit = {
          id: "visit_initial_1",
          azienda: "IMA Packaging Srl",
          indirizzo: "Via Emilia 428, Ozzano dell'Emilia (BO)",
          data: new Date().toISOString().slice(0, 10),
          orario: "10:30",
          notePreVisita: "Incontro per discutere la compatibilità dei lettori di codici fotoelettrici e interfacce IO-Link.",
          quickNote: "",
          esito: "",
          prodotti: "",
          offerta: "",
          nextStep: "",
          report: "",
        };
        setVisits([hydratedDefault]);
      }
    } catch (e) {
      console.error("Local recovery database error: ", e);
    }
  }, []);

  // 2. Sequential state-saving updates with visual "DB status animation"
  useEffect(() => {
    if (visits.length === 0) return;
    setDbStatus("syncing");
    
    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem("fsn:visits", JSON.stringify(visits));
        localStorage.setItem("fsn:settings", JSON.stringify(settings));
        setDbStatus("online");
        
        // Simulo ritorno a stato statico offline dopo sync
        setTimeout(() => setDbStatus("offline"), 1200);
      } catch (err) {
        setDbStatus("offline");
      }
    }, 600);

    return () => clearTimeout(saveTimer);
  }, [visits, settings]);

  // Calculate week stats (week Key and dates array)
  const getWeekStats = (base: Date) => {
    const monday = new Date(base);
    const dates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    // Standard ISO week index calculation
    const tempDate = new Date(monday);
    tempDate.setDate(tempDate.getDate() + 3); // Thursday of same week
    const firstJan = new Date(tempDate.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((tempDate.getTime() - firstJan.getTime()) / 86400000 + 1) / 7
    );
    const weekKey = `${tempDate.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    return { weekKey, dates };
  };

  const { weekKey, dates: weekDates } = getWeekStats(currentWeekBase);

  // Week navigation scrolling
  const handlePrevWeek = () => {
    const nextBase = new Date(currentWeekBase);
    nextBase.setDate(currentWeekBase.getDate() - 7);
    setCurrentWeekBase(nextBase);
  };

  const handleNextWeek = () => {
    const nextBase = new Date(currentWeekBase);
    nextBase.setDate(currentWeekBase.getDate() + 7);
    setCurrentWeekBase(nextBase);
  };

  // Snapshot recovery procedures
  const handleUploadSnapshot = (data: any) => {
    if (data.visits) {
      setVisits(data.visits);
      alert(`Snapshot ripristinato con successo! Inserite ${data.visits.length} visite.`);
    }
  };

  const handleDownloadSnapshot = () => {
    const payload = {
      week: weekKey,
      savedAt: new Date().toISOString(),
      settings,
      visits,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FiSalesNav_Snapshot_${weekKey}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Demo recruitment generator trigger
  const handleInjectDemoData = () => {
    const demoPayload = generateDemoVisits(weekKey, weekDates);
    // Remove existing demo visits first to prevent doubling duplicates
    const sansDemo = visits.filter((v) => !v.isDemo);
    setVisits([...sansDemo, ...demoPayload]);
    setActiveTab("calendario");
    alert("Dati demo caricati! 30 visite caricate su 25 clienti reali nell'area selezionata.");
  };

  const handleClearDemoData = () => {
    const sansDemo = visits.filter((v) => !v.isDemo);
    setVisits(sansDemo);
    alert("Tutti i dati demo sono stati rimossi con successo!");
  };

  // Database controllers
  const handleAddVisit = (newVisit: SalesVisit) => {
    setVisits((prev) => [...prev, newVisit]);
  };

  const handleUpdateVisit = (updated: SalesVisit) => {
    setVisits((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDeleteVisit = (id: string) => {
    setVisits((prev) => prev.filter((v) => v.id !== id));
  };

  const handleMoveToBacklog = (visit: SalesVisit) => {
    const updated: SalesVisit = {
      ...visit,
      esito: "Cancellata/Backlog",
    };
    handleUpdateVisit(updated);
    setDebriefVisit(null);
    setActiveTab("backlog");
    alert(`La visita di ${visit.azienda} è stata annullata e spostata nel Backlog.`);
  };

  const handleScheduleVisit = (visit: SalesVisit, date: string) => {
    const updated: SalesVisit = {
      ...visit,
      data: date,
      orario: "09:00",
      esito: "", // clear previous cancellation status if resending
    };
    handleUpdateVisit(updated);
    setActiveTab("calendario");
  };

  const openAddModalForDate = (date?: string) => {
    setTargetQuickAddDate(date);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header
        appName="FiSalesNav"
        appVersion="v0.3.2"
        weekKey={weekKey}
        dbStatus={dbStatus}
        onDownloadSnapshot={handleDownloadSnapshot}
        onUploadSnapshot={handleUploadSnapshot}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {/* Navigation tabs placed horizontally in columns on top of the content */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: "oggi", label: "OGGI", desc: "Navigazione e Timeline" },
            { id: "calendario", label: "CALENDARIO", desc: "5 Giorni lavorativi" },
            { id: "riepilogo", label: "RIEPILOGO", desc: "Sintesi CRM & Excel" },
            { id: "sandbox", label: "SANDBOX", desc: "Progettazione Libera" },
            { id: "backlog", label: "BACKLOG", desc: "Annullate & Sospese" },
          ].map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-left px-4 py-3 rounded-xl transition duration-150 flex flex-col justify-center focus:outline-hidden border ${
                idx === 4 ? "col-span-2 sm:col-span-1" : ""
              } ${
                activeTab === tab.id
                  ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white hover:bg-slate-100 text-slate-750 border-slate-200"
              }`}
            >
              <span className="text-sm font-extrabold select-none tracking-wider">{tab.label}</span>
              <span className={`text-[10px] select-none font-medium ${activeTab === tab.id ? "text-slate-300" : "text-slate-400"}`}>
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Content Section Container */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm min-w-0">
          {activeTab === "oggi" && (
            <TodayTab
              visits={visits}
              settings={settings}
              onUpdateVisit={handleUpdateVisit}
              onDeleteVisit={handleDeleteVisit}
              onOpenDebrief={(v) => setDebriefVisit(v)}
              onOpenAddModal={() => openAddModalForDate(new Date().toISOString().slice(0, 10))}
            />
          )}

          {activeTab === "calendario" && (
            <CalendarTab
              visits={visits}
              weekDates={weekDates}
              weekKey={weekKey}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onOpenAddModal={openAddModalForDate}
              onOpenImportModal={() => setIsImportOpen(true)}
              onOpenDebrief={(v) => setDebriefVisit(v)}
              onDeleteVisit={handleDeleteVisit}
              startLocation={settings.startLocation}
            />
          )}

          {activeTab === "riepilogo" && (
            <SummaryTab
              visits={visits}
              weekKey={weekKey}
              customPrompt={settings.summaryPrompt}
              onOpenDebrief={(v) => setDebriefVisit(v)}
            />
          )}

          {activeTab === "sandbox" && (
            <SandboxTab
              visits={visits}
              settings={settings}
              weekDates={weekDates}
              onAddVisit={handleAddVisit}
              onUpdateVisit={handleUpdateVisit}
              onDeleteVisit={handleDeleteVisit}
              onScheduleVisit={handleScheduleVisit}
              onUpdateVisitsList={setVisits}
              onOpenAddModal={() => openAddModalForDate("sandbox")}
            />
          )}

          {activeTab === "backlog" && (
            <BacklogTab
              visits={visits}
              weekDates={weekDates}
              onRescheduleVisit={handleScheduleVisit}
              onDeleteVisit={handleDeleteVisit}
            />
          )}
        </div>

      </main>

      {/* Settings Modal component */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setSettings}
        onInjectDemoData={handleInjectDemoData}
        onClearDemoData={handleClearDemoData}
      />

      {/* Add Visit Modal component (free text / structured dual tabs) */}
      <AddVisitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVisit}
        defaultDate={targetQuickAddDate}
      />

      {/* Unstructured Mass Visit AI Import Modal */}
      <ImportVisitsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        weekKey={weekKey}
        weekDates={weekDates}
        onImport={(imported) => setVisits((prev) => [...prev, ...imported])}
        customPrompt={settings.importPrompt}
      />

      {/* Active Debriefing session controller popup */}
      {debriefVisit && (
        <DebriefModal
          visit={debriefVisit}
          isOpen={true}
          onClose={() => setDebriefVisit(null)}
          onSave={(updated) => {
            handleUpdateVisit(updated);
            setDebriefVisit(null);
          }}
          onMoveToBacklog={handleMoveToBacklog}
          customPrompt={settings.debriefPrompt}
          reportFormat={settings.reportFormat}
        />
      )}

    </div>
  );
}
