import React, { useState } from "react";
import { Calendar, Plus, Sparkles, Check, ChevronLeft, ChevronRight, HelpCircle, Search, Navigation } from "lucide-react";
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
  onAddVisit: (v: SalesVisit) => void;
  startLocation: string;
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
  onAddVisit,
  startLocation,
}) => {
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  const getDayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const openDayItineraryInMaps = (dayVisits: SalesVisit[]) => {
    if (dayVisits.length === 0) return;
    const origin = startLocation;
    const destination = startLocation;
    const waypoints = dayVisits.map((v) => v.indirizzo).join("|");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
    window.open(url, "_blank");
  };

  // GH-30 Outlook Drag and Drop Parsers
  const handleUrlOutlookDrop = async (e: React.DragEvent<HTMLDivElement>, dateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);

    // 1. Handle dropped files (like .ics)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.slice(-4).toLowerCase() === ".ics" || file.type.includes("calendar")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          parseAndInsertIcs(content, dateStr);
        };
        reader.readAsText(file);
        return;
      }
    }

    // 2. Handle dropped plain text or raw data transfer
    const droppedText = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text");
    if (droppedText) {
      if (droppedText.includes("BEGIN:VCALENDAR")) {
        parseAndInsertIcs(droppedText, dateStr);
      } else {
        parseAndInsertGenericText(droppedText, dateStr);
      }
    }
  };

  const parseAndInsertIcs = (icsText: string, dateStr: string) => {
    try {
      const lines = icsText.split(/\r?\n/);
      const events: Array<{ summary: string; location: string; description: string; timeInput: string }> = [];
      let currentEvent: { summary: string; location: string; description: string; timeInput: string } | null = null;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Unfold folded lines if any
        while (i + 1 < lines.length && (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))) {
          line += lines[i + 1].substring(1);
          i++;
        }

        const upperLine = line.toUpperCase();

        if (upperLine.startsWith("BEGIN:VEVENT")) {
          currentEvent = { summary: "", location: "", description: "", timeInput: "09:00" };
        } else if (upperLine.startsWith("END:VEVENT") && currentEvent) {
          events.push(currentEvent);
          currentEvent = null;
        } else if (currentEvent) {
          if (upperLine.startsWith("SUMMARY:")) {
            currentEvent.summary = line.substring(8).trim();
          } else if (upperLine.startsWith("LOCATION:")) {
            currentEvent.location = line.substring(9).trim();
          } else if (upperLine.startsWith("DESCRIPTION:")) {
            currentEvent.description = line.substring(12).trim().replace(/\\n/g, "\n");
          } else if (upperLine.startsWith("DTSTART:")) {
            const val = line.substring(line.indexOf(":") + 1).trim();
            const match = val.match(/T(\d{2})(\d{2})/);
            if (match) {
              currentEvent.timeInput = `${match[1]}:${match[2]}`;
            }
          } else if (upperLine.startsWith("DTSTART;")) {
            const val = line.substring(line.indexOf(":") + 1).trim();
            const match = val.match(/T(\d{2})(\d{2})/);
            if (match) {
              currentEvent.timeInput = `${match[1]}:${match[2]}`;
            }
          }
        }
      }

      // If no VEVENT tags found but text matches some standard fields, fallback to single entry
      if (events.length === 0) {
        let summary = "";
        let location = "";
        let description = "";
        let timeInput = "09:00";
        for (const line of lines) {
          if (line.toUpperCase().startsWith("SUMMARY:")) {
            summary = line.substring(8).trim();
          } else if (line.toUpperCase().startsWith("LOCATION:")) {
            location = line.substring(9).trim();
          } else if (line.toUpperCase().startsWith("DESCRIPTION:")) {
            description = line.substring(12).trim().replace(/\\n/g, "\n");
          } else if (line.toUpperCase().startsWith("DTSTART:")) {
            const val = line.substring(line.indexOf(":") + 1).trim();
            const match = val.match(/T(\d{2})(\d{2})/);
            if (match) {
              timeInput = `${match[1]}:${match[2]}`;
            }
          }
        }
        events.push({
          summary: summary || "Nuovo Incontro Outlook",
          location: location || "Indirizzo da inserire",
          description: description || "Importato da appuntamento Outlook.",
          timeInput,
        });
      }

      let count = 0;
      for (const ev of events) {
        const title = ev.summary || "Nuovo Incontro Outlook";
        const newVisit = {
          id: `outlook_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          azienda: title,
          indirizzo: ev.location || "Indirizzo da inserire",
          data: dateStr,
          orario: ev.timeInput,
          notePreVisita: ev.description || "Importato da appuntamento Outlook.",
          quickNote: "",
          esito: "",
          prodotti: "",
          offerta: "",
          nextStep: "",
          report: "",
        };
        onAddVisit(newVisit);
        count++;
      }

      alert(`🎉 [Outlook Sync] Importanti con successo ${count} appuntamenti per il giorno ${dateStr}!`);
    } catch (e) {
      console.error(e);
      alert("Si è verificato un errore nel parsing dell'appuntamento ICS.");
    }
  };

  const parseAndInsertGenericText = (text: string, dateStr: string) => {
    try {
      const timeMatch = text.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/);
      const timeInput = timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}` : "09:00";

      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      const summary = lines[0] ? lines[0].substring(0, 50).trim() : "Visita Importata";
      const description = text;

      const newVisit = {
        id: `outlook_txt_${Date.now()}`,
        azienda: summary,
        indirizzo: "Indirizzo da definire",
        data: dateStr,
        orario: timeInput,
        notePreVisita: description,
        quickNote: "",
        esito: "",
        prodotti: "",
        offerta: "",
        nextStep: "",
        report: "",
      };

      onAddVisit(newVisit);
      alert(`🎉 Importato con successo il testo dell'appuntamento: "${summary}" alle ${timeInput} per il giorno ${dateStr}!`);
    } catch (e) {
      alert("Errore nel parsing dell'incontro testuale.");
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

      {/* GH-30 Outlook Sync Hint banner */}
      <div className="bg-blue-50/40 border border-blue-100/70 p-3 rounded-xl text-center text-xs text-slate-600 flex items-center justify-center gap-2 select-none shadow-3xs">
        <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
        <span><b>Suggerimento drag-drop Outlook:</b> trascina qui un appunto o un file appuntamento del calendario <b>.ics</b> per pianificarlo all'istante sulla giornata scelta!</span>
      </div>

      {/* 5 Working Days list */}
      <div className="space-y-4">
        {weekDates.map((dateStr) => {
          const isToday = dateStr === todayISO;
          const isDragOver = dragOverDate === dateStr;
          
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
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDate(dateStr);
              }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={(e) => handleUrlOutlookDrop(e, dateStr)}
              className={`rounded-2xl border p-4 transition-all duration-200 relative ${
                isDragOver ? "border-dashed border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/20 scale-[1.01]" :
                isToday ? "border-blue-200 ring-2 ring-blue-500/10 shadow-md bg-white" : "border-slate-250 bg-white shadow-xs"
              }`}
            >
              {isDragOver && (
                <div className="absolute inset-0 bg-blue-600/95 rounded-2xl flex flex-col items-center justify-center text-white z-25 pointer-events-none p-4 text-center">
                  <Sparkles className="w-8 h-8 text-blue-200 animate-bounce mb-2" />
                  <p className="text-xs font-extrabold uppercase tracking-widest">Rilascia l'incontro qui!</p>
                  <p className="text-[10px] text-blue-100 mt-1">L'agenda Outlook verrà importata e memorizzata per sbloccare l'itinerario</p>
                </div>
              )}
              
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
                  
                  {dayVisits.length > 0 && (
                    <button
                      onClick={() => openDayItineraryInMaps(dayVisits)}
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition"
                      title="Apri intero itinerario su Google Maps"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  )}

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
