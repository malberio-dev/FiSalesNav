import React, { useState, useEffect } from "react";
import { Clock, MapPin, Navigation, CheckCircle, ChevronDown, ChevronUp, RefreshCw, Briefcase, Plus, AlertCircle, Trash2, Search, Filter, Sparkles, Check, Edit } from "lucide-react";
import { SalesVisit, AppSettings } from "../types";
import { calculateRouteLegs, TravelLeg, optimizeRouteSequence, geocodeAddress } from "../utils/geo";

interface TodayTabProps {
  visits: SalesVisit[];
  settings: AppSettings;
  weekDates: string[];
  onUpdateVisit: (updated: SalesVisit) => void;
  onDeleteVisit: (id: string) => void;
  onOpenDebrief: (visit: SalesVisit) => void;
  onOpenAddModal: (date?: string) => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  visits,
  settings,
  weekDates = [],
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

  // Active date selection state for previewing other days
  const [selectedDate, setSelectedDate] = useState(() => {
    if (weekDates.includes(todayISO)) {
      return todayISO;
    }
    return weekDates[0] || todayISO;
  });

  // Month year navigation formatter (Issue #43)
  const getFormattedMonthYearForWeek = () => {
    if (!weekDates || weekDates.length === 0) return "";
    const first = new Date(weekDates[0]);
    const last = new Date(weekDates[weekDates.length - 1]);
    const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    if (first.getMonth() === last.getMonth()) {
      return `${months[first.getMonth()]} ${first.getFullYear()}`;
    } else {
      if (first.getFullYear() === last.getFullYear()) {
        return `${months[first.getMonth()]} - ${months[last.getMonth()]} ${last.getFullYear()}`;
      }
      return `${months[first.getMonth()]} ${first.getFullYear()} - ${months[last.getMonth()]} ${last.getFullYear()}`;
    }
  };

  // Search and filter state variables (GitHub Issue #108)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEsito, setFilterEsito] = useState("Tutti");
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Edit visit state variables (Issue #42)
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editAzienda, setEditAzienda] = useState("");
  const [editIndirizzo, setEditIndirizzo] = useState("");
  const [editOrario, setEditOrario] = useState("");
  const [editNotePreVisita, setEditNotePreVisita] = useState("");
  const [isValidatingEditAddress, setIsValidatingEditAddress] = useState(false);
  const [editAddressValidationStatus, setEditAddressValidationStatus] = useState<{valid: boolean; coords: [number, number]} | null>(null);

  const handleVerifyEditAddress = async () => {
    if (!editIndirizzo.trim()) return;
    setIsValidatingEditAddress(true);
    setEditAddressValidationStatus(null);
    try {
      const coords = await geocodeAddress(editIndirizzo);
      if (coords) {
        const savedSettings = localStorage.getItem("fsn:settings");
        const simulateWrong = savedSettings ? JSON.parse(savedSettings).simulateWrongAddresses : false;
        if (simulateWrong) {
          setEditAddressValidationStatus({ valid: false, coords: [0, 0] });
        } else {
          setEditAddressValidationStatus({ valid: true, coords });
        }
      } else {
        setEditAddressValidationStatus({ valid: false, coords: [0, 0] });
      }
    } catch (e) {
      setEditAddressValidationStatus({ valid: false, coords: [0, 0] });
    } finally {
      setIsValidatingEditAddress(false);
    }
  };

  const handleStartEdit = (visit: SalesVisit) => {
    setEditingVisitId(visit.id);
    setEditAzienda(visit.azienda);
    setEditIndirizzo(visit.indirizzo);
    setEditOrario(visit.orario);
    setEditNotePreVisita(visit.notePreVisita || "");
    setEditAddressValidationStatus(null);
  };

  const handleSaveEdit = (visit: SalesVisit) => {
    if (!editAzienda.trim() || !editIndirizzo.trim() || !editOrario.trim()) {
      alert("I campi Ragione Sociale, Indirizzo e Orario sono obbligatori!");
      return;
    }
    const updated: SalesVisit = {
      ...visit,
      azienda: editAzienda.trim(),
      indirizzo: editIndirizzo.trim(),
      orario: editOrario.trim(),
      notePreVisita: editNotePreVisita.trim(),
    };
    onUpdateVisit(updated);
    setEditingVisitId(null);
  };

  const handleCancelEdit = () => {
    setEditingVisitId(null);
  };

  // Unfiltered planned stops for selectedDate (calculated sequentially)
  const plannedTodaysVisits = visits
    .filter((v) => v.data === selectedDate && v.esito !== "Cancellata/Backlog")
    .sort((a, b) => a.orario.localeCompare(b.orario));

  // Filtered stops shown in UI (Strictly simplified for GH-40 to focus on standard timeline sequence)
  const todaysVisits = plannedTodaysVisits;

  // Optimize today's route (GitHub Issue #102)
  const handleOptimizeRoute = async () => {
    if (plannedTodaysVisits.length <= 1) {
      alert("Pianifica almeno 2 visite per poter ottimizzare il percorso di viaggio!");
      return;
    }
    setIsOptimizing(true);
    try {
      const simplified = plannedTodaysVisits.map((v) => ({
        id: v.id,
        address: v.indirizzo || v.azienda,
      }));

      // TSP nearest neighbor solve
      const optimalIdsResult = await optimizeRouteSequence(startAddr, simplified);

      // Re-time sequentially starting from startTime
      let currentHour = parseInt(startTime.split(":")[0]) || 8;
      let currentMin = parseInt(startTime.split(":")[1]) || 0;

      // Update visit times in sequence
      optimalIdsResult.forEach((id, index) => {
        const found = visits.find((v) => v.id === id);
        if (found) {
          // calculate driving time of previous leg if available
          const drivingDuration = (legs && legs[index]) ? legs[index].durationMin : 25;
          currentMin += drivingDuration;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }

          const timeString = `${String(currentHour % 24).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
          
          onUpdateVisit({
            ...found,
            orario: timeString,
          });

          // Add typical visit length of 60 mins before the next leg starts
          currentMin += 60;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
        }
      });

      alert("🎉 [GitHub Feature #102] Itinerario ottimizzato in base alla distanza stradale ottimale! Orari di visita riprogrammati per ridurre le tratte di viaggio.");
    } catch (err) {
      console.error("Optimization failed:", err);
      alert("Errore durante l'ottimizzazione del percorso. Verifica la connessione.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Compute driving distances
  useEffect(() => {
    if (plannedTodaysVisits.length === 0) {
      setLegs([]);
      return;
    }

    const triggerRouting = async () => {
      setCalculating(true);
      try {
        const dests = plannedTodaysVisits.map((v) => v.indirizzo || v.azienda);
        const routeLegs = await calculateRouteLegs(startAddr, [...dests, startAddr]);
        setLegs(routeLegs);
      } catch (e) {
        console.error("Routing error:", e);
      } finally {
        setCalculating(false);
      }
    };

    triggerRouting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits, startAddr, plannedTodaysVisits.length]);

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
    if (todaysVisits.length === 0) return;
    const origin = startAddr;
    const destination = startAddr;
    const waypoints = todaysVisits.map((v) => v.indirizzo).join("|");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const getFormattedTodayDate = () => {
    const d = new Date(selectedDate);
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
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
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
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {plannedTodaysVisits.length > 0 && (
          <div className="mt-3.5">
            <button
              onClick={openEntireItineraryInMaps}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              Visualizza Itinerario su Google Maps
            </button>
          </div>
        )}
      </div>

      {/* GH-28 Navigation & Preview other days of current week */}
      <div className="rounded-2xl border bg-slate-50/50 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 select-none">
              Navigazione e Preview Giornate ({getFormattedMonthYearForWeek()})
            </h3>
            <p className="text-[11px] text-slate-500">Seleziona una giornata della settimana corrente per visualizzarne l'itinerario e ricalcolare i km</p>
          </div>
          {weekDates.includes(todayISO) && selectedDate !== todayISO && (
            <button
              onClick={() => setSelectedDate(todayISO)}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition select-none flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Torna a Oggi
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {weekDates.map((dateStr) => {
            const dateObj = new Date(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = todayISO === dateStr;
            const weekday = dateObj.toLocaleDateString("it-IT", { weekday: "short" });
            const dayNum = dateObj.getDate();
            const scheduledCount = visits.filter(v => v.data === dateStr && v.esito !== "Cancellata/Backlog").length;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition text-center select-none cursor-pointer relative ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-85">{weekday}</span>
                <span className="text-sm font-extrabold mt-1">{dayNum}</span>
                {scheduledCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                    isSelected ? "bg-white text-blue-600 border-blue-500" : "bg-slate-800 text-white border-white"
                  }`}>
                    {scheduledCount}
                  </span>
                )}
                {isToday && (
                  <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white animate-pulse" : "bg-blue-600"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Itinerary Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700 select-text">
          {selectedDate === todayISO ? "OGGI" : "PREVIEW"} &nbsp;&nbsp;&deg;&nbsp;&nbsp; {getFormattedTodayDate()} &nbsp;&nbsp;&deg;&nbsp;&nbsp; {todaysVisits.length} {todaysVisits.length === 1 ? "visita" : "visite"} {plannedTodaysVisits.length > 0 && `(🚗 ${calculating ? "Ricalcolo km..." : `${legs.reduce((sum, leg) => sum + parseFloat(leg.distanceKm || "0"), 0).toFixed(1)} km`})`}
        </h2>
        
        {plannedTodaysVisits.length !== todaysVisits.length && (
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5 font-bold animate-pulse">
            Risultati filtrati ({todaysVisits.length} di {plannedTodaysVisits.length})
          </span>
        )}
      </div>

      {/* Travel filtering panel removed per GH-40 to declutter and focus on sequential timeline */}

      {todaysVisits.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center bg-slate-50/50">
          <MapPin className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">Agenda Vuota</h3>
          <p className="mt-1 text-xs text-slate-500">Non ci sono visite pianificate per la giornata selezionata.</p>
          <button
            onClick={() => onOpenAddModal(selectedDate)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
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
          <div className="flex gap-4 items-start relative">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 border border-blue-500 z-10 -ml-[5.5px]">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-slate-400">{startTime}</p>
              <h4 className="text-sm font-bold text-slate-800">Partenza</h4>
              <p className="text-xs text-slate-500">{startAddr}</p>
            </div>
          </div>

          {/* Today's Stops */}
          {todaysVisits.map((visit) => {
            const isCompleted = !!visit.esito && visit.esito !== "Cancellata/Backlog";
            const isExpanded = expandedVisitId === visit.id;
            const realIndex = plannedTodaysVisits.findIndex((v) => v.id === visit.id);
            const leg = realIndex !== -1 ? legs[realIndex] : null;

            return (
              <div key={visit.id} className="space-y-4">
                
                {/* Distance Separator Banner */}
                <div className="flex items-center gap-2 ml-4 py-1">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] sm:text-xs font-mono font-semibold bg-slate-50 text-slate-500 border rounded-full px-3 py-0.5 shadow-xs flex items-center gap-1">
                    {calculating ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
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
                <div className="flex gap-4 items-start">
                  {/* Circle spine dot */}
                  <button
                    onClick={() => handleToggleExpand(visit.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border z-10 -ml-[5.5px] transition-colors focus:outline-hidden ${
                      isCompleted 
                        ? "bg-emerald-500 border-emerald-600 text-white" 
                        : visit.visitType === "logistic"
                        ? "bg-slate-700 border-slate-800 text-white hover:bg-slate-850"
                        : "bg-white border-blue-500 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : visit.visitType === "logistic" ? (
                      <span className="h-2 w-2 rounded-full bg-slate-200" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </button>

                  {/* Accordion Card */}
                  <div className={`flex-1 rounded-xl border overflow-hidden transition-all hover:border-slate-300 shadow-xs ${
                    visit.visitType === "logistic" 
                      ? "border-slate-200 bg-slate-50/90 text-slate-700" 
                      : "bg-white border-slate-200"
                  }`}>
                    
                    {/* Header trigger */}
                    <div
                      onClick={() => handleToggleExpand(visit.id)}
                      className={`p-4 cursor-pointer flex items-center justify-between gap-3 ${
                        visit.visitType === "logistic" ? "bg-slate-100/30" : "bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                            {visit.orario}
                          </span>
                          {visit.visitType === "logistic" && (
                            <span className="text-[9px] bg-slate-700 text-white border border-slate-800 font-extrabold px-1.5 py-0.2 rounded tracking-widest uppercase">
                              LOGISTICA
                            </span>
                          )}
                          {visit.isDemo && (
                            <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-1.5 py-0.2 rounded">
                              DEMO
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {visit.isDemo ? visit.azienda.replace(" demo", "") : visit.azienda}
                          {visit.isDemo && <span className="text-blue-500 ml-1 italic font-light font-mono text-[11px]">demo</span>}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                           {visit.indirizzo}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInGoogleMaps(visit.indirizzo);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 text-xs font-bold transition shadow-2xs cursor-pointer"
                          title="Naviga verso questo indirizzo"
                        >
                          <Navigation className="w-3.5 h-3.5 fill-blue-600 stroke-[1.5]" />
                          <span>Naviga</span>
                        </button>
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
                        {editingVisitId === visit.id ? (
                          <div className="space-y-3.5 bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs">
                            <h5 className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center justify-between pb-1.5 border-b select-none">
                              <span>Modifica Appuntamento</span>
                              <span className="text-[9px] font-mono text-slate-400 font-medium">ID: {visit.id}</span>
                            </h5>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Ragione Sociale Azienda</label>
                                <input
                                  type="text"
                                  value={editAzienda}
                                  onChange={(e) => setEditAzienda(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] font-bold uppercase text-slate-400">Indirizzo Cliente</label>
                                  <button
                                    type="button"
                                    onClick={handleVerifyEditAddress}
                                    disabled={isValidatingEditAddress || !editIndirizzo.trim()}
                                    className="text-[9px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 cursor-pointer"
                                  >
                                    {isValidatingEditAddress ? "Verifica..." : "Verifica Indirizzo"}
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={editIndirizzo}
                                  onChange={(e) => {
                                    setEditIndirizzo(e.target.value);
                                    setEditAddressValidationStatus(null);
                                  }}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                                />
                                {editAddressValidationStatus && (
                                  <div className={`mt-1 text-[10px] font-semibold flex items-center gap-1 ${
                                    editAddressValidationStatus.valid ? "text-emerald-600" : "text-amber-500"
                                  }`}>
                                    {editAddressValidationStatus.valid ? (
                                      <>
                                        <Check className="w-3 h-3 stroke-[2.5]" />
                                        Validato Coerente: {editAddressValidationStatus.coords[0].toFixed(4)}°, {editAddressValidationStatus.coords[1].toFixed(4)}°
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                                        Messa in bolla / Adesione Simulata: Calcolo km standard di ripiego.
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Note Commerciali Richieste (Pre-Visita)</label>
                                <textarea
                                  rows={2}
                                  value={editNotePreVisita}
                                  onChange={(e) => setEditNotePreVisita(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 resize-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3 items-end pt-1">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Orario Visita</label>
                                  <input
                                    type="time"
                                    value={editOrario}
                                    onChange={(e) => setEditOrario(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 transition cursor-pointer"
                                  >
                                    Annulla
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(visit)}
                                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
                                  >
                                    Salva
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
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
                              <div className="rounded-xl bg-blue-50/45 border border-blue-100 p-3.5 space-y-1">
                                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Report CRM Consolidato da Gemini</span>
                                <p className="text-xs font-serif leading-relaxed text-slate-800">{visit.report}</p>
                              </div>
                            )}

                            {/* Expandable Card Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                              <button
                                onClick={() => openInGoogleMaps(visit.indirizzo)}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
                              >
                                <Navigation className="w-3.5 h-3.5 fill-white" />
                                Ottieni Indicazioni
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStartEdit(visit)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                  title="Modifica appuntamento"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => onDeleteVisit(visit.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Rimuovi visita"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={() => onOpenDebrief(visit)}
                                  className="flex items-center gap-1 rounded-lg border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  {isCompleted ? "Aggiorna Debrief" : "Mark as " + (visit.isDemo ? "DONE" : "Effettuata")}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}

          {/* Return Home Leg */}
          {plannedTodaysVisits.length > 0 && legs[plannedTodaysVisits.length] && (
            <div className="space-y-4">
              {/* Distance Separator to Home */}
              <div className="flex items-center gap-2 ml-4 py-1">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] sm:text-xs font-mono font-semibold bg-slate-50 text-slate-500 border rounded-full px-3 py-0.5 shadow-xs flex items-center gap-1">
                  {calculating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                      Ricalcolo rientro...
                    </>
                  ) : (
                    <>
                      <span>Rientro a Casa o Sede: <b>{formatDuration(legs[plannedTodaysVisits.length].durationMin)}</b></span>
                      <span className="text-slate-300">|</span>
                      <span><b>{legs[plannedTodaysVisits.length].distanceKm} km</b></span>
                    </>
                  )}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Home Point Dot */}
              <div className="flex gap-4 items-start relative opacity-85">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 border border-blue-400 z-10 -ml-[5.5px]">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Rientro a Sede o Casa</h4>
                  <p className="text-xs text-slate-500">{startAddr}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
