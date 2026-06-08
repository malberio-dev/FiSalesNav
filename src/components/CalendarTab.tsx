import React, { useState } from "react";
import { Calendar, Plus, Sparkles, Check, ChevronLeft, ChevronRight, HelpCircle, Search } from "lucide-react";
import { SalesVisit } from "../types";

interface CalendarTabProps {
  visits: SalesVisit[];
  weekDates: string[]; // 5 days of chosen week
  weekKey: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onOpenAddModal: (date?: string) => void;
  onOpenImportModal: () => void;
  onOpenDebrief: (visit: SalesVisit) => void;
  onDeleteVisit: (id: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  visits,
  weekDates,
  weekKey,
  onPrevWeek,
  onNextWeek,
  onOpenAddModal,
  onOpenImportModal,
  onOpenDebrief,
  onDeleteVisit,
}) => {
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const todayISO = new Date().toISOString().slice(0, 10);

  const getDayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const getEsitoPill = (esito: string) => {
    switch (esito) {
      case "Positivo":
        return <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">Positivo</span>;
      case "Da seguire":
        return <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">Da Seguire</span>;
      case "Negativo":
        return <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full uppercase">Negativo</span>;
      default:
        return <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 border px-2 py-0.5 rounded-full uppercase">Pianificata</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Week Navigator Card (allows scroll up/down +-4 weeks) */}
      <div className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-xs">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Navigazione Settimanale</h3>
          <p className="text-xs text-slate-500">Scorri il calendario di ±4 settimane per pianificare gli incontri future</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50 transition"
            title="Settimana Precedente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 text-sm font-bold font-mono bg-slate-100 py-2 rounded-lg border tracking-wider text-slate-800 text-center min-w-[120px]">
            {weekKey}
          </span>
          <button
            onClick={onNextWeek}
            className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50 transition"
            title="Settimana Successiva"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Header bar with Import */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700 flex items-center gap-1.5 animate-fade-in">
            <Calendar className="w-4.5 h-4.5 text-blue-600" />
            Agenda Settimana
          </h2>
        </div>
        <button
          onClick={onOpenImportModal}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 text-xs font-bold hover:bg-blue-100 transition shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          Importa Lista AI / Excel
        </button>
      </div>

      {/* Global Weekly Search Filter bar (GitHub Issue #108) */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cerca cliente, indirizzo o note commerciali all'interno della settimana..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 shadow-xs"
        />
      </div>

      {/* 5 Working Days list */}
      <div className="space-y-4">
        {weekDates.map((dateStr) => {
          const isToday = dateStr === todayISO;
          
          // Get all scheduled visits for this date, excluding cancelled visits that were completely pulled out
          const dayVisits = visits
            .filter((v) => v.data === dateStr && v.esito !== "Cancellata/Backlog")
            .sort((a, b) => a.orario.localeCompare(b.orario))
            .filter((v) => {
              const term = searchQuery.toLowerCase().trim();
              return !term ||
                v.azienda.toLowerCase().includes(term) ||
                (v.indirizzo || "").toLowerCase().includes(term) ||
                (v.notePreVisita || "").toLowerCase().includes(term);
            });

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border bg-white p-4 transition duration-200 ${
                isToday ? "border-blue-200 ring-2 ring-blue-500/10 shadow-md bg-white" : "shadow-xs"
              }`}
            >
              
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isToday ? "bg-blue-600 animate-pulse" : "bg-slate-300"}`} />
                  <h4 className={`text-sm font-bold capitalize ${isToday ? "text-blue-700 font-extrabold" : "text-slate-800"}`}>
                    {getDayLabel(dateStr)}
                    {isToday && <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-md px-1.5 py-0.5 ml-2">Oggi</span>}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    {dayVisits.length} {dayVisits.length === 1 ? "visita" : "visite"}
                  </span>
                  
                  <button
                    onClick={() => onOpenAddModal(dateStr)}
                    className="p-1 rounded-md text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition"
                    title={`Aggiungi visita per il giorno ${dateStr}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day's Visits List */}
              {dayVisits.length === 0 ? (
                <p className="text-xs italic text-slate-400 py-2.5">
                  Nessuna visita programmata per questa giornata. Premi il tasto "+" per inserire.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {dayVisits.map((visit) => {
                    const isExpanded = expandedVisitId === visit.id;
                    const isDone = !!visit.esito && visit.esito !== "Cancellata/Backlog";

                    return (
                      <div
                        key={visit.id}
                        className="rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition border-slate-100 overflow-hidden"
                      >
                        {/* Summary Header trigger */}
                        <div
                          onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}
                          className="flex items-center justify-between gap-3 p-3 cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-xs font-bold text-slate-700">
                                {visit.orario}
                              </span>
                              <span className="text-xs font-extrabold text-slate-800 truncate">
                                {visit.isDemo ? visit.azienda.replace(" demo", "") : visit.azienda}
                                {visit.isDemo && <span className="text-blue-500 ml-1 italic font-light font-mono text-[11px]">demo</span>}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getEsitoPill(visit.esito)}
                          </div>
                        </div>

                        {/* Collapsible area inside calendar */}
                        {isExpanded && (
                          <div className="p-3 bg-white border-t space-y-2.5 text-xs text-slate-600">
                            <p className="font-mono text-[11px]"><b>Indirizzo:</b> {visit.indirizzo}</p>
                            {visit.notePreVisita && (
                              <p className="bg-slate-50 p-2 rounded-lg border italic">
                                "<b>Pre-Visita:</b> {visit.notePreVisita}"
                              </p>
                            )}
                            {visit.quickNote && (
                              <p className="bg-slate-50/40 p-2 rounded-lg border">
                                <b>Note Follow-UP:</b> {visit.quickNote}
                              </p>
                            )}
                            {visit.report && (
                              <div className="bg-blue-50/30 border border-blue-100 p-2.5 rounded-lg">
                                <span className="block text-[10px] font-bold text-blue-600 uppercase mb-0.5">Report AI CRM</span>
                                <p className="font-serif italic leading-relaxed text-slate-700">{visit.report}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => onDeleteVisit(visit.id)}
                                className="px-2.5 py-1.5 text-xs rounded hover:bg-red-50 text-red-600 font-semibold"
                              >
                                Rimuovi
                              </button>
                              <button
                                onClick={() => onOpenDebrief(visit)}
                                className="flex items-center gap-1 rounded bg-blue-600 text-white font-bold px-3 py-1.5 hover:bg-blue-700 transition"
                              >
                                <Plus className="w-3 h-3" />
                                {isDone ? "Verifica / Modifica Debrief" : "Invia Debriefing"}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
