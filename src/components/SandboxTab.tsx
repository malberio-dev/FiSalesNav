import React, { useState } from "react";
import { 
  Plus, 
  Compass, 
  Trash2 
} from "lucide-react";
import { SalesVisit } from "../types";

interface SandboxTabProps {
  visits: SalesVisit[];
  weekDates: string[];
  onAddVisit: (v: SalesVisit) => void;
  onUpdateVisit: (v: SalesVisit) => void;
  onDeleteVisit: (id: string) => void;
  onScheduleVisit: (visit: SalesVisit, date: string) => void;
  onOpenAddModal: () => void;
}

export const SandboxTab: React.FC<SandboxTabProps> = ({
  visits,
  weekDates,
  onAddVisit,
  onUpdateVisit,
  onDeleteVisit,
  onScheduleVisit,
  onOpenAddModal,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter for sandbox visits
  const sandboxVisits = visits.filter(
    (v) => !v.data || v.data === "sandbox" || v.data === ""
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
    <div className="space-y-5">
      
      {/* Intro info Banner */}
      <div className="rounded-2xl border bg-slate-50/70 p-4 text-xs text-slate-600 leading-relaxed space-y-2 select-none">
        <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
          <Compass className="w-4.5 h-4.5 text-orange-600" />
          Progettazione Libera (Sandbox)
        </h3>
        <p>
          Il <b>Sandbox</b> è la tua lavagna commerciale! Raccogli qui i clienti da visitare, le note libere o le idee di contatto non ancora programmate per pianificarle in seguito sul calendario.
        </p>
      </div>

      <div className="space-y-4">
        {/* Action triggers */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Clienti in Sandbox ({sandboxVisits.length})</h3>
          
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 text-xs font-bold bg-orange-600 text-white rounded-lg px-3 py-1.5 hover:bg-orange-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Aggiungi Visita Bozza
          </button>
        </div>

        {sandboxVisits.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center bg-slate-50/20 select-none">
            <Compass className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 text-sm font-bold text-slate-900">Nessuna visita in Sandbox</h4>
            <p className="mt-1 text-xs text-slate-400">Tutti i contatti sono già stati inseriti nel calendario settimanale, oppure non hai ancora inserito bozze.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sandboxVisits.map((visit) => {
              const isExpanded = expandedId === visit.id;

              return (
                <div
                  key={visit.id}
                  className="rounded-xl border bg-white shadow-xs p-4 space-y-3 hover:border-slate-300 transition select-none"
                >
                  {/* Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                    className="flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">
                        {visit.azienda}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono truncate">{visit.indirizzo || "Indirizzo non inserito"}</p>
                    </div>

                    <span className="text-[10px] bg-slate-100 text-slate-600 border px-2 py-0.5 rounded font-bold tracking-tight">
                      SANDBOX
                    </span>
                  </div>

                  {/* Collapsible Area */}
                  {isExpanded && (
                    <div className="pt-3 border-t space-y-3">
                      {visit.notePreVisita && (
                        <div className="text-xs">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Note/Appunti pre-visita</span>
                          <p className="italic bg-slate-50 border p-2 rounded-lg text-slate-600 whitespace-pre-wrap">"{visit.notePreVisita}"</p>
                        </div>
                      )}

                      {/* Operational schedules integration */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                        
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500">Pianifica nel Calendario:</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                onScheduleVisit(visit, e.target.value);
                              }
                            }}
                            defaultValue=""
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 font-medium focus:outline-hidden"
                          >
                            <option value="">Scegli Giorno...</option>
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

    </div>
  );
};
