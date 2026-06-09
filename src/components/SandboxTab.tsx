import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Compass, 
  Trash2,
  Sparkles,
  Loader2,
  GripVertical
} from "lucide-react";
import { SalesVisit, AppSettings } from "../types";
import { optimizeRouteSequence, calculateRouteLegs, TravelLeg } from "../utils/geo";

interface SandboxTabProps {
  visits: SalesVisit[];
  settings: AppSettings;
  weekDates: string[];
  onAddVisit: (v: SalesVisit) => void;
  onUpdateVisit: (v: SalesVisit) => void;
  onDeleteVisit: (id: string) => void;
  onScheduleVisit: (visit: SalesVisit, date: string) => void;
  onUpdateVisitsList: (newVisits: SalesVisit[]) => void;
  onOpenAddModal: () => void;
}

export const SandboxTab: React.FC<SandboxTabProps> = ({
  visits,
  settings,
  weekDates,
  onAddVisit,
  onUpdateVisit,
  onDeleteVisit,
  onScheduleVisit,
  onUpdateVisitsList,
  onOpenAddModal,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Real-time travel legs calculation
  const [legs, setLegs] = useState<TravelLeg[]>([]);
  const [loadingLegs, setLoadingLegs] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Filter for sandbox visits
  const sandboxVisits = visits.filter(
    (v) => !v.data || v.data === "sandbox" || v.data === ""
  );

  // Fetch travel legs sequentially when sequence or home base location updates
  useEffect(() => {
    const getLegs = async () => {
      if (sandboxVisits.length === 0) {
        setLegs([]);
        return;
      }
      setLoadingLegs(true);
      try {
        const addresses = sandboxVisits.map((v) => v.indirizzo || v.azienda);
        const allStops = [...addresses, settings.startLocation];
        const calculated = await calculateRouteLegs(settings.startLocation, allStops);
        setLegs(calculated);
      } catch (e) {
        console.error("Failed to calculate sandbox legs: ", e);
      } finally {
        setLoadingLegs(false);
      }
    };

    getLegs();
  }, [
    sandboxVisits.map((v) => `${v.id}_${v.indirizzo}`).join(","),
    settings.startLocation
  ]);

  const totalDistance = legs.reduce((sum, leg) => sum + parseFloat(leg.distanceKm || "0"), 0);
  const totalDuration = legs.reduce((sum, leg) => sum + leg.durationMin, 0);

  const formatDuration = (min: number) => {
    if (min < 60) return `${min} min`;
    const hrs = Math.floor(min / 60);
    const mins = min % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const handleOptimizeSandbox = async () => {
    if (sandboxVisits.length <= 1) {
      alert("Aggiungi all'interno della Sandbox almeno 2 visite bozza con indirizzi validi per ottimizzare l'itinerario!");
      return;
    }
    setIsOptimizing(true);
    try {
      const startAddr = settings.startLocation;
      const simplified = sandboxVisits.map((v) => ({
        id: v.id,
        address: v.indirizzo || v.azienda,
      }));

      // Nearest Neighbor Route solve starting from home base
      const optimalIdsResult = await optimizeRouteSequence(startAddr, simplified);

      // Map optimal sequence order of items
      const orderedSandbox: SalesVisit[] = [];
      optimalIdsResult.forEach((id) => {
        const found = visits.find((v) => v.id === id);
        if (found) orderedSandbox.push(found);
      });

      // Filter other visits out
      const otherVisits = visits.filter((v) => !orderedSandbox.find((os) => os.id === v.id));

      // Merge sequentially which keeps them sorted geographically 
      onUpdateVisitsList([...otherVisits, ...orderedSandbox]);

      alert(`🎉 [GitHub Feature #102] Bozze in Sandbox riordinate secondo l'itinerario stradale ottimale partendo da ${startAddr}! Questo renderà più logica la pianificazione sequenziale.`);
    } catch (err) {
      console.error("TSP path sandbox error: ", err);
      alert("Si è verificato un errore durante l'ottimizzazione dell'itinerario.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const getDayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...sandboxVisits];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    // Filter out sandbox visits from entire list
    const otherVisits = visits.filter((v) => !sandboxVisits.find((sv) => sv.id === v.id));

    // Update with newly ordered sandbox segment
    onUpdateVisitsList([...otherVisits, ...reordered]);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Intro info Banner - text fully selectable and copyable */}
      <div className="rounded-2xl border bg-slate-50/70 p-4 text-xs text-slate-600 leading-relaxed space-y-2 select-text">
        <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm select-text">
          <Compass className="w-4.5 h-4.5 text-blue-600" />
          Progettazione Libera (Sandbox)
        </h3>
        <p className="select-text">
          Il <b>Sandbox</b> è la tua lavagna commerciale! Raccogli qui i clienti da visitare, le note libere o le idee di contatto non ancora programmate per pianificarle in seguito sul calendario.
        </p>
      </div>

      {/* GH-29. Import day from calendar to sandbox */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-4 space-y-3 shadow-3xs">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-850 select-text flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Importa Giornata pianificata per ottimizzarla
        </h4>
        <p className="text-[11px] text-slate-500 leading-normal select-text">
          Seleziona una giornata programmata nel calendario corrente per importare tutte le sue visite in Sandbox come bozze libere, in modo da riordinarle con TSP e provarne la sequenza ideale.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {weekDates.map((dateStr) => {
            const dateObj = new Date(dateStr);
            const weekday = dateObj.toLocaleDateString("it-IT", { weekday: "short" });
            const dayNum = dateObj.getDate();
            const count = visits.filter(v => v.data === dateStr && v.esito !== "Cancellata/Backlog").length;

            return (
              <button
                key={dateStr}
                onClick={() => {
                  if (count === 0) {
                    alert(`Nessuna visita programmata trovata per il giorno ${getDayLabel(dateStr)} (${dateStr}).`);
                    return;
                  }
                  if (window.confirm(`Spostare le ${count} visite di ${getDayLabel(dateStr)} nella Sandbox? Questo rimuoverà la loro pianificazione dal calendario per consentire i riordini di tappa.`)) {
                    const updated = visits.map(v => {
                      if (v.data === dateStr && v.esito !== "Cancellata/Backlog") {
                        return { ...v, data: "", orario: "" };
                      }
                      return v;
                    });
                    onUpdateVisitsList(updated);
                    alert(`🎉 Spostate con successo ${count} visite da ${getDayLabel(dateStr)} in Sandbox!`);
                  }
                }}
                className={`text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 px-2.5 py-1.5 text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 select-none cursor-pointer ${
                  count === 0 ? "opacity-45 hover:bg-white cursor-not-allowed" : ""
                }`}
              >
                <span className="capitalize">{weekday} {dayNum}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold ${count > 0 ? "bg-blue-100 text-blue-700 font-mono" : "bg-slate-100 text-slate-405 font-mono"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {/* Action triggers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 select-text">Clienti in Sandbox ({sandboxVisits.length})</h3>
          
          <div className="flex items-center gap-2">
            {sandboxVisits.length > 1 && (
              <button
                onClick={handleOptimizeSandbox}
                disabled={isOptimizing}
                className="flex items-center gap-1.5 text-xs font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 hover:bg-blue-100 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isOptimizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                )}
                Ottimizza Sequenza (TSP)
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Aggiungi Visita Bozza
            </button>
          </div>
        </div>

        {/* Dynamic Route Estimation metrics card */}
        {sandboxVisits.length > 0 && (
          <div className="rounded-xl border bg-slate-50 border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 shadow-2xs select-text">
            <div className="flex items-center gap-2 select-text">
              <span className="p-1 px-2 rounded-md bg-white border border-slate-200 font-mono font-bold text-slate-700">itinerario teorico</span>
              <span className="select-text">
                {loadingLegs ? (
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ricalcolo chilometri e tempi...
                  </span>
                ) : (
                  <span>
                    <b>{totalDistance.toFixed(1)} km</b> totali &bull; 🚗 Tempo di viaggio: <b>{formatDuration(totalDuration)}</b> (incluso rientro a sede)
                  </span>
                )}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium italic sm:text-right select-text">
              Passa il mouse per trascinare le card e riordinare la giornata!
            </div>
          </div>
        )}

        {sandboxVisits.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center bg-slate-50/20 select-text">
            <Compass className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 text-sm font-bold text-slate-900 select-text">Nessuna visita in Sandbox</h4>
            <p className="mt-1 text-xs text-slate-400 select-text">Tutti i contatti sono già stati inseriti nel calendario settimanale, oppure non hai ancora inserito bozze.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Start point marker */}
            <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider select-text">
              <span>✈️ Punto di Partenza: {settings.startLocation}</span>
            </div>

            {sandboxVisits.map((visit, index) => {
              const isExpanded = expandedId === visit.id;
              const leg = legs[index];

              return (
                <div key={visit.id} className="space-y-4">
                  
                  {/* Connection Leg Segment pre-visit */}
                  {legs[index] && (
                    <div className="flex items-center gap-2 ml-4 py-1 select-text">
                      <div className="h-px flex-1 bg-slate-100" />
                      <span className="text-[10px] sm:text-xs font-mono font-semibold bg-slate-50 text-slate-500 border rounded-full px-3 py-0.5 shadow-2xs flex items-center gap-1 select-text">
                        {loadingLegs ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Ricalcolo...
                          </>
                        ) : (
                          <>
                            <span>{index === 0 ? "Partenza da sede" : "Collegamento"}: <b>{formatDuration(legs[index].durationMin)}</b></span>
                            <span className="text-slate-300">|</span>
                            <span><b>{legs[index].distanceKm} km</b></span>
                          </>
                        )}
                      </span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                  )}

                  {/* Draggable Card */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group rounded-xl border bg-white shadow-xs p-4 space-y-3 hover:border-blue-300 transition select-text flex items-start gap-3 relative ${
                      draggedIndex === index ? "border-blue-300 bg-blue-50/10 opacity-40 shadow-inner" : ""
                    }`}
                  >
                    {/* Drag and Drop handle icon on left */}
                    <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-0.5 rounded transition">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header */}
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                        className="flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate select-text">
                            {visit.isDemo ? visit.azienda.replace(" demo", "") : visit.azienda}
                            {visit.isDemo && <span className="text-blue-500 ml-1 italic font-light font-mono text-[11px] select-text">demo</span>}
                          </h4>
                          <p className="text-xs text-slate-500 font-mono truncate select-text">{visit.indirizzo || "Indirizzo non inserito"}</p>
                        </div>

                        <span className="text-[10px] bg-slate-100 text-slate-600 border px-2 py-0.5 rounded font-bold tracking-tight select-text">
                          BOZZA {index + 1}
                        </span>
                      </div>

                      {/* Collapsible Area */}
                      {isExpanded && (
                        <div className="pt-3 border-t space-y-3 select-text">
                          {visit.notePreVisita && (
                            <div className="text-xs select-text">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5 select-text">Note/Appunti pre-visita</span>
                              <p className="italic bg-slate-50 border p-2 rounded-lg text-slate-600 whitespace-pre-wrap select-text">"{visit.notePreVisita}"</p>
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
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-lg transition"
                                title="Elimina definitivo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Return to home/office leg segment */}
            {legs[sandboxVisits.length] && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 ml-4 py-1 select-text">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] sm:text-xs font-mono font-semibold bg-slate-50 text-slate-500 border rounded-full px-3 py-0.5 shadow-2xs flex items-center gap-1 select-text">
                    {loadingLegs ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Ricalcolo...
                      </>
                    ) : (
                      <>
                        <span>Rientro a Casa o Sede: <b>{formatDuration(legs[sandboxVisits.length].durationMin)}</b></span>
                        <span className="text-slate-300">|</span>
                        <span><b>{legs[sandboxVisits.length].distanceKm} km</b></span>
                      </>
                    )}
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider select-text opacity-85">
                  <span>🏡 Fine Giornata: Rientro a {settings.startLocation}</span>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};
