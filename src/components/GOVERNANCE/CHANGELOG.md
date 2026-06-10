# CHANGELOG

Tutte le modifiche e gli aggiornamenti di versione apportati a **FiSalesNav**.

---

## [v0.3.7] - 2026-06-10

### Aggiunto
- **Tappe Logistiche / Checkpoints Ad-Hoc (GH-39)**: Possibilità di inserire direttamente in timeline tappe logistiche non commerciali (Hotel, Casa, Ufficio, Pranzo) per modellare con flessibilità l'intera giornata di lavoro.
- **Scorciatoie Predefinite**: Inseriti pulsanti rapidi nel pannello di aggiunta visita manuale per pre-compilare all'istante le denominazioni delle tappe logistiche.
- **Stilizzazione Differenziata**: Le tappe logistiche fittizie sono disegnate con un colore grigio/ardesia high-contrast e badge "LOGISTICA" dedicato per separarle chiaramente dalle visite d'affari.

### Modificato / Ottimizzato
- **Rimozione Input Itinerario Ridondanti (GH-39)**: Eliminati i sottomoduli duplicati e verbosi delle impostazioni di viaggio in SettingsModal anziché confinarli lì, centralizzando l'interattività dell'agenda.
- **Rimozione Ricerca e Filtri in Oggi (GH-40)**: Pulizia integrale della casella di ricerca testuale e dei tag "Stato" dalla scheda "Oggi" per sgomberare l'interfaccia da carichi cognitivi superflui e focalizzarsi interamente sulla sequenza cronologica stradale.

### Corretto
- **Ripristino Memoria Importazione (GH-32)**: Corretto il comportamento del pannello d'importazione massiva che ora sbianca e pulisce l'area di testo e i precedenti stati intermedi non appena la lista degli appuntamenti viene importata con successo.

---

## [v0.3.6] - 2026-06-10

### Aggiunto
- **Validazione Indirizzo nel Form & In-Card (GH-36)**: Aggiunta la verifica integrata dell'indirizzo in tempo reale ("Verifica Indirizzo") sia nel modal di inserimento appuntamenti che nella card di modifica in-place. Restituisce le coordinate precise o notifica l'uso del fallback.
- **Modifica Appuntamenti In-Card (GH-42)**: Possibilità di correggere al volo azienda, indirizzo, data, orario d'agenda e note pre-visita premendo l'icona Matita/Edit direttamente sulla card nella schermata Oggi/Timeline senza dover eliminare l'evento.
- **Navigazione Calendario fino a 8 Settimane (GH-44)**: Rimozione del limite restrittivo di risonanza feriale ed estensione ad un buffer flessibile di 8 settimane anteriori e posteriori per pianificare l'agenda.
- **Indicatore Mese nel Calendario e Navigatore (GH-43)**: Visualizzazione dinamica del mese/anno in base alla settimana visualizzata sia sul titolo del blocco di anteprime in Oggi che nelle card del Calendario.
- **Miglioramento Parser Outlook ICS (GH-45)**: Il modulo drag-and-drop supporta ora righe multiriga (unfolding nativo) e l'importazione massiva di VEVENT multipli da un singolo file per impegni accorpati.

### Modificato / Ottimizzato
- **Semplificazione Punto di Partenza/Ritorno (GH-39)**: Unificazione dei punti di partenza o ritorno a casa basati sulle preferenze di indirizzo registrate in Settings, con calcolo coerente dei leg stradali.
- **Diagnostica e Telemetria Token in Tempo Reale (GH-38)**: Sistemati i metodi asincroni in `src/utils/ai.ts` per allineare cumulative e stime di costo nel SettingsModal al consumo effettivo a ogni chiamata dell'utente.
- **Opzione Simulazione Indirizzi Errati (GH-35)**: Aggiunto sotto Settings un elemento checkbox per simulare anomalie di geocodifica (debug) in modo da forzare e testare il comportamento resiliente e trasparente di fallback.
- **Raffinamento Filtri Oggi (GH-40)**: Pulizia e restyling visivo minimale della barra di ricerca rapida testuale e del filtro per Esito.
- **Formato Debriefing Semplificato (GH-41)**: Semplificazione dell'input di debriefing rapido post-visita con box a testo libero, relegando alla computazione AI la classificazione formale.
- **Documentazione Badge Offline-First (GH-37)**: Integrazione di un hover tooltip dettagliato sul badge del database nel Header che spiega la persistenza locale e il momentaneo stato di sincronizzazione.
- **Dati Demo Allineati (GH-46)**: Nuovi scaglionamenti orari sequenziali logistici e popolamento di visite completate d'esempio nei dati generati.

---

## [v0.3.5] - 2026-06-10

### Aggiunto / Modificato
- **Navigazione & Preview Feriale (GH-28)**: Aggiunta la possibilità di navigare e visualizzare in anteprima l'itinerario e le tratte di altre giornate della settimana corrente direttamente dalla scheda "Oggi" senza aspettare il giorno in corso.
- **Importazione in Sandbox (GH-29)**: Integrato un comodo box di importazione e trasloco delle visite del calendario feriale all'interno del modulo Sandbox per testing di sequenze e riordino di percorsi.
- **Supporto Drag-and-Drop Outlook (.ics / testo) (GH-30)**: Abilitati i trigger drag-over e drop sulle colonne giornaliere del Calendario per supportare l'inserimento istantaneo di impegni tramite file `.ics` o selezioni testuali.

### Corretto
- **Fix Contatore Visite nel Riepilogo (GH-26)**: Corretto l'algoritmo di conteggio delle visite pianificate nella scheda "Riepilogo" escludendo e separando in modo preciso le tappe in Sandbox o allocate in Backlog.

---

## [v0.3.4] - 2026-06-09

### Aggiunto / Ottimizzato
- **Unificazione Moduli & Helper AI**: Consolidato l'intero layer client in un unico modulo riutilizzabile ed efficiente (`src/utils/ai.ts`). Creato un formato di busta standard `AIResponseEnvelope` per uniformare l'interazione con il backend.
- **Pannello Impostazioni AI e Telemetria Consumi**: Introdotta la nuova tab "AI" nel modulo `SettingsModal`, contenente:
  - Selettori del modello preferito per compiti rapidi/parser (`fastModel`) ed estesi/report (`advancedModel`).
  - Sliders per personalizzare la resilienza alle quote (numero di retry e delay iniziale di backoff).
  - Gestione in locale delle statistiche di consumo reali (visualizzazione dei token totali/prompt/risposte, efficacia delle chiamate con calcolo automatico del costo stimato in dollari).
  - Switch per abilitare o disabilitare il servizio di Google Search Grounding.
- **Visualizzazione Badge Diagnostici AI**: Inseriti indicatori visivi e didascalici dedicati in tutti i moduli (Pianificatore Massivo, Inserimento Rapido, Debriefing, Riepilogo Settimanale), che mostrano all'utente:
  - Se il contenuto è stato certificato con successo tramite Helper AI o se ha usufruito del Fallback Meccanico Locale.
  - Il modello specifico impiegato per la chiamata.
  - Il quantitativo di Token elaborati per quella singola transazione.
  - Il computo dei retry necessari al server per bypassare gli intasamenti di quota temporanei.

---

## [v0.3.3] - 2026-06-09

### Aggiunto / Ottimizzato
- **Robustezza Fallback Quota API**: Implementazione di un meccanismo di ripiego (graceful fallback) automatico a tutela di tutti gli endpoint di Gemini API. In caso di errore di quota (Resource Exhausted 429), API keys malconfigurate o problemi di rete remota, l'applicazione non lancia eccezioni critiche sul client ma risponde istantaneamente con un parser locale o un generatore di sintesi testuale di emergenza, notificando lo stato tramite warning strutturato.
- **Supporto Registro di Sviluppo Multi-giorno**: Aggiornata la struttura di `DAILY.md` in modalità cumulativa sequenziale per non sovrascrivere la cronologia e preservare la tracciabilità delle decisioni storiche.

---

## [v0.3.2] - 2026-06-08

### Query di Build Utilizzata
```
Esegui la build v0.3.2 di FiSalesNav con update mirati.
Scope in ordine:
- BUG-02 Risoluzione crash startup (Rimozione Geolocation permissions da metadata, parallelizzazione geocoding in geo.ts)
- BUG-01 Tasto rimuovi non funzionante (Rimozione confirm nativo bloccato dall'iframe)
- U-01 Itinerario giornata dal calendario (Pulsante di navigazione giornata in CalendarTab)
- U-02/U-03 Pulsante "Naviga" singolo e allineamento waypoint nell'itinerario Google Maps
Al termine: aggiorna APP_VERSION, CHANGELOG, BACKLOG (con +2 idee nel pool attivo).
```

### Aggiunto
- **Pulsante itinerario su calendario**: Aggiunta l'icona ed il pulsante per generare ed aprire l'itinerario del giorno completo su Google Maps direttamente dalla cella del calendario.
- **Tasto "Naviga" singolo**: Inserito un pulsante blu "Naviga" su ciascuna card di visita nella visualizzazione giornaliera per guidare l'utente alla tappa corrente.
- **Integrazione Google Search Grounding**: Abilitati i tool di ricerca online di Google per le chiamate strutturate a Gemini nel server così da risolvere indirizzi non completamente esplicitati (es. "ratti guanzate").

### Modificato / Ottimizzato
- **Parallelizzazione Geocoding**: Le richieste di geocodifica degli indirizzi a OSM e calcolo delle tratte sono state totalmente parallelizzate in `geo.ts` con `Promise.all` per evitare blocchi sequenziali.
- **Timeout restrittivi**: Abbassati i timeout sulle chiamate di rete in `geo.ts` da `3500ms`/`2000ms` a `1200ms` con abort controller per garantire stabilità e caricamento fluido in qualsiasi condizione di rete debole.
- **Sincronia Waypoints**: Corretto il formato del link a Google Maps per incluirvi i waypoint intermedi esattamente nell'ordine pianificato dall'applicazione.

### Corretto
- **Fix Crash Startup**: Rimossa la richiesta di permessi `geolocation` bloccanti da `/metadata.json` poiché bloccava il caricamento dell'app nell'iframe prima di visualizzare l'interfaccia.
- **Risoluzione Elimina Visita**: Eliminato l'uso del `confirm` nativo del browser in `App.tsx` che impediva la rimozione delle visite nella visualizzazione calendario per vincoli sandbox dell'iframe.

---

## [v0.3.1] - Versioni Precedenti
- Inizializzazione della base di pianificazione visite, calendario, integrazione con debriefing assistito da AI (v0.3.1).
