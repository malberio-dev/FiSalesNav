import React, { useState, useEffect } from "react";
import { Clock, MapPin, Navigation, CheckCircle, ChevronDown, ChevronUp, RefreshCw, Briefcase, Plus, AlertCircle, Trash2 } from "lucide-react";
import { SalesVisit, AppSettings } from "../types";
import { calculateRouteLegs, TravelLeg } from "../utils/geo";

interface TodayTabProps {
  visits: SalesVisit[];
  settings: AppSettings;
  onUpdateVisit: (updated: SalesVisit) => void;
  onDeleteVisit: (id: string) => void;
  onOpenDebrief: (visit: SalesVisit) => void;
  onOpenAddModal: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  visits,
  settings,
  onUpdateVisit,
  onDeleteVisit,
  onOpenDebrief,
  onOpenAddModal,
}) => {
  const [startAddr, setStartAddr] = useState(settings.startLocation);
  const [startTime, setStartTime] = useState(settings.startTime);
  const [legs, setLegs] = useState<TravelLeg[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  // Sync with settings updates
  useEffect(() => {
    setStartAddr(settings.startLocation);
    setStartTime(settings.startTime);
  }, [settings.startLocation, settings.startTime]);

  // Today's date filter
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysVisits = visits
    .filter((v) => v.data === todayISO && v.esito !== "Cancellata/Backlog")
    .sort((a, b) => a.orario.localeCompare(b.orario));

  // Compute driving distances
  useEffect(() => {
    if (todaysVisits.length === 0) {
      setLegs([]);
      return;
    }

    const triggerRouting = async () => {
      setCalculating(true);
      try {
        const dests = todaysVisits.map((v) => v.indirizzo || v.azienda);
        const routeLegs = await calculateRouteLegs(startAddr, dests);
        setLegs(routeLegs);
      } catch (e) {
        console.error("Routing error:", e);
      } finally {
        setCalculating(false);
      }
    };

    triggerRouting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits, startAddr, todaysVisits.length]);

  const handleToggleExpand = (id: string) => {
    setExpandedVisitId(expandedVisitId === id ? null : id);
  };

  const getEsitoColor = (esito: string) => {
    switch (esito) {
      case "Positivo":
        return "text-emerald-700 bg-emerald-55 border-emerald-200";
      case "Da seguire":
        return "text-amber-700 bg-amber-55 border-amber-200";
      case "Negativo":
        return "text-rose-700 bg-rose-55 border-rose-200";
      default:
        return "text-slate-600 bg-slate-55 border-slate-200";
    }
  };

  const openInGoogleMaps = (dest: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startAddr)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const openEntireItineraryInMaps = () => {
    const stopsStr = todaysVisits.map((v) => encodeURIComponent(v.indirizzo)).join("/");
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(startAddr)}/${stopsStr}`;
    window.open(url, "_blank");
  };

  const getFormattedTodayDate = () => {
    const d = new Date();
    const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const months = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  };

  return (
    <div className="space-y-5">
      
      {/* Starting point pre-configured config */}
      <div className="rounded-xl border bg-white p-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Impostazioni Inizio Viaggio</h3>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Partenza Base</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={startAddr}
                onChange={(e) => setStartAddr(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Orario Partenza</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {todaysVisits.length > 0 && (
          <button
            onClick={openEntireItineraryInMaps}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            Visualizza Itinerario Completo su Google Maps
          </button>
        )}
      </div>

      {/* Itinerary Title */}
      <div className="flex items-center border-b pb-2">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
          OGGI &nbsp;&nbsp;&nbsp;&nbsp;°&nbsp;&nbsp;&nbsp;&nbsp; {getFormattedTodayDate()} &nbsp;&nbsp;&nbsp;&nbsp;°&nbsp;&nbsp;&nbsp;&nbsp; {todaysVisits.length} {todaysVisits.length === 1 ? "visita pianificata" : "visite pianificate"}
        </h2>
      </div>

      {todaysVisits.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center bg-slate-50/50">
          <MapPin className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">Agenda Vuota</h3>
          <p className="mt-1 text-xs text-slate-500">Non ci sono visite pianificate per la giornata odierna.</p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Pianifica Ora
          </button>
        </div>
      ) : (
        <div className="relative pl-4 space-y-6">
          {/* Vertical Timeline spine */}
          <div className="absolute left-6 top-1 bottom-1 w-0.5 bg-slate-200 -z-10" />

          {/* Start Point Dot */}
          <div className="flex gap-4 items-start relative select-none">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 border border-orange-500 z-10 -ml-[5.5px]">
              <span className="h-2 w-2 rounded-full bg-orange-600" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-slate-400">{startTime}</p>
              <h4 className="text-sm font-bold text-slate-800">Partenza</h4>
              <p className="text-xs text-slate-500">{startAddr}</p>
            </div>
          </div>

          {/* Today's Stops */}
          {todaysVisits.map((visit, index) => {
            const isCompleted = !!visit.esito && visit.esito !== "Cancellata/Backlog";
            const isExpanded = expandedVisitId === visit.id;
            const leg = legs[index];

            return (
              <div key={visit.id} className="space-y-4">
                
                {/* Distance Separator Banner */}
                <div className="flex items-center gap-2 ml-4 py-1">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] sm:text-xs font-mono font-semibold bg-slate-50 text-slate-500 border rounded-full px-3 py-0.5 shadow-xs flex items-center gap-1">
                    {calculating ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-orange-500" />
                        Ricalcolo distanze...
                      </>
                    ) : leg ? (
                      <>
                        <span><b>{formatDuration(leg.durationMin)}</b></span>
                        <span className="text-slate-300">|</span>
                        <span><b>{leg.distanceKm} km</b></span>
                      </>
                    ) : (
                      "Connessione itinerario..."
                    )}
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Visit Stop banner */}
                <div className="flex gap-4 items-start select-none">
                  {/* Circle spine dot */}
                  <button
                    onClick={() => handleToggleExpand(visit.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border z-10 -ml-[5.5px] transition-colors focus:outline-hidden ${
                      isCompleted 
                        ? "bg-emerald-500 border-emerald-600 text-white" 
                        : "bg-white border-orange-500 text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-orange-600" />
                    )}
                  </button>

                  {/* Accordion Card */}
                  <div className="flex-1 rounded-xl border bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300">
                    
                    {/* Header trigger */}
                    <div
                      onClick={() => handleToggleExpand(visit.id)}
                      className="p-4 cursor-pointer flex items-center justify-between gap-3 bg-white"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                            {visit.orario}
                          </span>
                          {visit.isDemo && (
                            <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-100 font-bold px-1.5 py-0.2 rounded">
                              DEMO
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {visit.isDemo ? visit.azienda.replace(" demo", "") : visit.azienda}
                          {visit.isDemo && <span className="text-orange-500 ml-1 italic font-light font-mono text-[11px]">demo</span>}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {visit.indirizzo}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isCompleted && (
                          <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 uppercase ${getEsitoColor(visit.esito)}`}>
                            {visit.esito}
                          </span>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expandable details body with navigation */}
                    {isExpanded && (
                      <div className="border-t bg-slate-50/50 p-4 space-y-3.5 text-xs">
                        <div className="pb-3 border-b text-slate-700">
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Indirizzo Cliente</span>
                            <p className="font-medium font-mono text-slate-800">{visit.indirizzo}</p>
                          </div>
                        </div>

                        {visit.notePreVisita && (
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Note Commerciali Richieste (Pre-Visita)</span>
                            <p className="font-serif leading-relaxed text-slate-700 bg-white p-2.5 rounded-lg border italic">
                              "{visit.notePreVisita}"
                            </p>
                          </div>
                        )}

                        {visit.quickNote && (
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Informazioni / Appunti di follow-up</span>
                            <p className="font-sans leading-relaxed text-slate-600 bg-slate-100/50 p-2.5 rounded-lg border">
                              {visit.quickNote}
                            </p>
                          </div>
                        )}

                        {/* CRM Report Output Preview */}
                        {visit.report && (
                          <div className="rounded-xl bg-orange-50/45 border border-orange-100 p-3.5 space-y-1">
                            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-orange-600">Report CRM Consolidato da Gemini</span>
                            <p className="text-xs font-serif leading-relaxed text-slate-800">{visit.report}</p>
                          </div>
                        )}

                        {/* Expandable Card Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                          <button
                            onClick={() => openInGoogleMaps(visit.indirizzo)}
                            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition"
                          >
                            <Navigation className="w-3.5 h-3.5 fill-white" />
                            Ottieni Indicazioni
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onDeleteVisit(visit.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Rimuovi visita"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => onOpenDebrief(visit)}
                              className="flex items-center gap-1 rounded-lg border border-orange-200 px-3.5 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {isCompleted ? "Aggiorna Debrief" : "Mark as " + (visit.isDemo ? "DONE" : "Effettuata")}
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

        </div>
      )}

    </div>
  );
};
