import React, { useState } from "react";
import { Archive, Plus, ChevronDown, ChevronUp, Trash2, Calendar } from "lucide-react";
import { SalesVisit } from "../types";

interface BacklogTabProps {
  visits: SalesVisit[];
  weekDates: string[];
  onRescheduleVisit: (visit: SalesVisit, date: string) => void;
  onDeleteVisit: (id: string) => void;
}

export const BacklogTab: React.FC<BacklogTabProps> = ({
  visits,
  weekDates,
  onRescheduleVisit,
  onDeleteVisit,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter visits for backlog items: those that have esito === "Cancellata/Backlog" or status is marked so
  const backlogVisits = visits.filter(
    (v) => v.esito === "Cancellata/Backlog"
  );

  const getDayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Intro info Banner */}
      <div className="rounded-2xl border bg-slate-50/70 p-4 text-xs text-slate-600 leading-relaxed space-y-1.5 animate-fade-in">
        <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
          <Archive className="w-4.5 h-4.5 text-blue-600" />
          Arretrati & Visite Cancellate (Backlog)
        </h3>
        <p>
          Le visite annullate o rimosse dall'itinerario a causa di contrattempi dei clienti vengono depositate qui automaticamente. Questo preserva i dati pre-visita compilati, permettendoti di ripianificare l'appuntamento in un'altra giornata della settimana corrente non appena sarai ricontattato.
        </p>
      </div>

      {/* Action triggers */}
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-700">Visite in Backlog ({backlogVisits.length})</h3>
      </div>

      {backlogVisits.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center bg-slate-50/20">
          <Archive className="mx-auto h-10 w-10 text-slate-300" />
          <h4 className="mt-3 text-sm font-bold text-slate-900">Il Backlog è vuoto</h4>
          <p className="mt-1 text-xs text-slate-400">Ottimo lavoro! Non ci sono visite in sospeso o appuntamenti annullati da riprogrammare.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {backlogVisits.map((visit) => {
            const isExpanded = expandedId === visit.id;

            return (
              <div
                key={visit.id}
                className="rounded-xl border bg-white shadow-xs p-4 space-y-3 hover:border-slate-300 transition"
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">
                      {visit.isDemo ? visit.azienda.replace(" demo", "") : visit.azienda}
                      {visit.isDemo && <span className="text-blue-500 ml-1 italic font-light font-mono text-[11px]">demo</span>}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono truncate">{visit.indirizzo}</p>
                  </div>

                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded font-bold tracking-tight uppercase">
                    Backlog
                  </span>
                </div>

                {/* Collapsible Area */}
                {isExpanded && (
                  <div className="pt-3 border-t space-y-3">
                    {visit.notePreVisita && (
                      <div className="text-xs">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Note/Appunti compilati pre-visita</span>
                        <p className="italic bg-slate-50 border p-2 rounded-lg text-slate-600">"{visit.notePreVisita}"</p>
                      </div>
                    )}

                    {visit.quickNote && (
                      <div className="text-xs">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Nota sull'annullamento dell'incontro</span>
                        <p className="bg-red-50/30 border border-red-100 p-2 rounded-lg text-slate-700 font-medium">
                          {visit.quickNote}
                        </p>
                      </div>
                    )}

                    {/* Operational schedules integration */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Ripianifica Visita:</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              onRescheduleVisit(visit, e.target.value);
                            }
                          }}
                          defaultValue=""
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 font-medium focus:outline-hidden"
                        >
                          <option value="">Seleziona Giorno...</option>
                          {weekDates.map((dateStr) => (
                            <option key={dateStr} value={dateStr}>
                              {getDayLabel(dateStr)} ({dateStr})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => onDeleteVisit(visit.id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-650 rounded-lg transition"
                          title="Elimina definitivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

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
};
