import React, { useRef } from "react";
import { Database, Download, Upload, Settings, RefreshCw } from "lucide-react";

interface HeaderProps {
  appName: string;
  appVersion: string;
  weekKey: string;
  dbStatus: "online" | "syncing" | "offline";
  onDownloadSnapshot: () => void;
  onUploadSnapshot: (data: any) => void;
  onOpenSettings: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appName,
  appVersion,
  weekKey,
  dbStatus,
  onDownloadSnapshot,
  onUploadSnapshot,
  onOpenSettings,
  onPrevWeek,
  onNextWeek,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.visits || parsed.backlog)) {
          onUploadSnapshot(parsed);
        } else {
          alert("Errore: Il file snapshot caricato non è valido.");
        }
      } catch (err) {
        alert("Errore nella lettura dello snapshot JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // clear file select
  };

  const getDbStatusBadge = () => {
    switch (dbStatus) {
      case "online":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        );
      case "syncing":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Syncing
          </span>
        );
      case "offline":
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300/50">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Locale (DB)
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
          {/* Left Area: Logo, Name, Version */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/20">
              FSN
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">{appName}</h1>
              <p className="text-xs font-mono text-slate-500">{appVersion}</p>
            </div>
          </div>

          {/* Center Area: Current Week Identifier */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3.5 py-1.5 border border-slate-200">
            <span className="text-sm font-semibold text-slate-700 font-mono tracking-tight">
              Settimana {weekKey}
            </span>
          </div>

          {/* Right Area: DB status, Actions, Settings */}
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              {getDbStatusBadge()}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onDownloadSnapshot}
                className="p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                title="Scarica snapshot (Backup JSON)"
              >
                <Download className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={handleUploadClick}
                className="p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                title="Carica snapshot (Pianificazione complessa)"
              >
                <Upload className="w-4.5 h-4.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-px h-5 bg-slate-200 mx-1" />

              <button
                onClick={onOpenSettings}
                className="p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                title="Impostazioni utente e Prompt AI"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
