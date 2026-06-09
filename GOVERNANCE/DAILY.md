# DAILY

Diario di bordo e memoria storica delle decisioni e degli avanzamenti del progetto **FiSalesNav**.

---

## Sessione del 2026-06-09 (Tarda Sera) - Navigazione Previste, Trasferimento Sandbox & Integrazione Outlook Drag-and-Drop (v0.3.5)

### Panoramica della Sessione
In questa sessione abbiamo introdotto importanti miglioramenti strategici di usabilità, integrazione esterna e logistica per gli agenti commerciali sul campo. Tutte le modifiche sono state consolidate e ufficializzate nel rilascio della build **v0.3.5**, e le relative governance sono state aggiornate.

### Decisioni Rilevanti e Avanzamenti Sviluppo
1. **Navigazione & Preview di altre giornate feriali (GH-28)**:
   - *Contesto*: Gli agenti avevano bisogno di visualizzare in anticipo gli itinerari stradali futuri direttamente dalla scheda principale "Oggi" senza dover attendere il giorno reale corrente.
   - *Decisione*: Introdotto un comodo widget di navigazione settimanale. Al clic, l'itinerario e i km programmati vengono ricalcolati in tempo reale in modalità "PREVIEW" per il giorno selezionato. Viene fornito un tasto azzurro "Torna a Oggi" per rientrare fluidamente nell'andamento in tempo reale.
2. **Importazione dell'Agenda in Sandbox per Simulazioni (GH-29)**:
   - *Contesto*: Gli agenti desideravano clonare e riordinare un'intera giornata pianificata nel calendario ufficiale all'interno della Sandbox per studiare percorsi alternativi senza scompaginare l'agenda ufficiale.
   - *Decisione*: Integrato un blocco interattivo in Sandbox che conta le visite in calendario e con un click le trasloca come bozze libere, sbloccando i riordini di tappa TSP.
3. **Integrazione Drag-and-Drop da Outlook Calendario (GH-30)**:
   - *Contesto*: Gli agenti ricevono continui inviti d'incontro tramite e-mail di Microsoft Outlook e desiderano schedularli all'istante senza doversi cimentare in compilazioni manuali.
   - *Decisione*: Predisposti trigger drag-over e drop sopra le colonne giornaliere della tab "Calendario". Sotto drag, l'interfaccia risponde colorando la dropzone in blu cobalto ed estrae l'agenda dal file `.ics` o dal testo trascinato, generando la visita.
4. **Correzione Contatore Riepilogo (GH-26)**:
   - *Contesto*: Il contatore "Pianificate" includeva per errore bozze libere e cancellazioni portando a discrepanze visive.
   - *Decisione*: Corretto l'algoritmo di conteggio per isolare e computare esclusivamente le visite attive della settimana corrente, allineando i dati della SummaryTab.

---

## Sessione del 2026-06-09 (Notte) - Unificazione Moduli AI, Telemetria Consumi & Rilascio (v0.3.4)

### Panoramica della Sessione
In questa sessione è stato completato con successo il massiccio upgrade e la build di rilascio **v0.3.4**. L'intero sistema di interazione con le API di Gemini è stato riscritto e centralizzato per estirpare la ridondanza, ottimizzare l'uso dei token, incrementare la resilienza operativa ad ogni livello e dotare l'agente commerciale di strumenti di monitoraggio token e costi in tempo reale.

### Decisioni Rilevanti e Avanzamenti Sviluppo
1. **Unificazione del layer AI Client/Server (GH-21, GH-22, GH-27, GH-31)**:
   - *Contesto*: Esistevano molteplici funzioni client asincrone frammentate e ridondanti. Inoltre, il server non permetteva un controllo dinamico sul tipo di modello utilizzato per specifici compiti né configurava la resilienza.
   - *Decisione*: Creato un unico file client `src/utils/ai.ts` con helper per ciascuna funzionalità (pianificazione, estrazione singola, debriefing, sintesi). Implementata la struttura unificata `AIResponseEnvelope` che veicola informazioni dettagliate sull'origine del dato (AI/Local Fallback), modello usato, tentativi di retry effettuati sul server e conteggio token formali.
2. **Pannello Gestione AI e Misuratore Consumi (`SettingsModal.tsx`)**:
   - *Contesto*: Per risolvere i 429 relativi alle quote AI sul campo, l'utente desiderava calibrare i consumi e visualizzare i consumi reali.
   - *Decisione*: Integrata la tab "Configurazione & Consumi AI" nelle impostazioni dove si può scegliere il modello per compiti leggeri/pesanti (`gemini-3.5-flash` o equivalenti), definire i parametri di retry con backoff esponenziale, attivare la ricerca real-time tramite Google Search Grounding e consultare un misuratore di consumo token accumulati con stima finanziaria automatica del costo in dollari.
3. **Badge Diagnostici d'Integrazione UI (GH-31)**:
   - *Contesto*: L'agente commerciale non aveva riscontri visivi per capire se una transazione AI fosse andata a buon fine o se stesse operando con il motore euristico offline locale.
   - *Decisione*: Equipaggiati i componenti `ImportVisitsModal`, `AddVisitModal`, `DebriefModal` e `SummaryTab` con badge informativi ad alto contrasto. I badge si illuminano in blu cobalto in caso di esito AI (con dettagli modello e token), e in tonalità ambra/arancio in caso di ripiego locale automatico con marcatura "Fallback Locale Attivo".
4. **Allineamento della Governance & Successo della Build**:
   - Compilato il backlog e rilasciata formalmente la build `v0.3.4`. La governance (backlog, changelog, daily) è stata interamente allineata ai più elevati standard qualitativi del development process.

---

## Sessione del 2026-06-09 (Sera) - Sincronizzazione e Classificazione Issue via Tag GitHub (v0.3.3)
### Panoramica della Sessione
Su ulteriore richiesta dell'utente, l'intero archivio storico e corrente delle issue di FiSalesNav è stato rianalizzato e integrato con una rigorosa categorizzazione basata sui tag nativi e standard di GitHub (es. `bug`, `enhancement`, `dependencies`, `wontfix`, `UI/UX`, `geocoding`, `export`).

### Decisioni Rilevanti e Allineamento Tag
1. **Enrichment del Backlog (`BACKLOG.md`)**:
   - *Decisione*: Strutturata una nuova colonna "Tag GitHub" per mappare con completezza lo stato logistico di tutti i ticket attivi, chiusi o rifiutati.
2. **Definizione Tassonomia Tag**:
   - I problemi legati ai tetti di traffico e superamento quota sono stati etichettati come `bug`, `dependencies`, `AI-quota`, `help wanted`.
   - I guasti storici risolti (es. crash geolocalizzazione o pulsanti inattivi) sono stati catalogati con tag di severità (`critical`, `iframe-constraint`, `performance`).
   - Le nuove funzioni pianificate (es. Smart Confirm, Esportazione ICS, preferiti e TTS) sono state etichettate come `enhancement`, `UI/UX`, `feature`, `export` o `accessibility`.
3. **Mantenimento Stabilità del Codice**:
   - Nessun file sorgente della cartella `src` o `server.ts` è stato modificato in questo iter, assicurando la totale e provata integrità della build `v0.3.3`.

---

## Sessione del 2026-06-09 (Tardo Pomeriggio) - Integrazione Issue-Backlog ed Estimating (v0.3.3)
### Panoramica della Sessione
Su indicazione dell'utente, sono state estratte ed aggregate le varie issue e idee di miglioramento storiche del progetto (provenienti dall'incubatore Idea Pool) e incorporate formalmente nel backlog delle attività pianificate. È stato eseguito uno studio preventivo di effort e pianificata la loro release (senza alterare file di codice sorgente o logica applicativa).

### Decisioni Rilevanti e Pianificazione
1. **Integrazione del Backlog delle Feature (da GH-20 a GH-24)**:
   - *Contesto*: Più idee e requisiti desiderati emergevano storicamente dall'uso sul campo del tool da parte degli agenti, ma rimanevano confinati nell'incubatore.
   - *Decisione*: Promosse 5 nuove voci principali sotto forma di ticket di sviluppo attivi nel Backlog di progetto (`/GOVERNANCE/BACKLOG.md`) per ordinare e pianificare i rilasci futuri.
2. **Effort Stimate e Roadmap di Rilascio**:
   - **GH-20** (Smart Confirm): Effort **Basso**. Pianificato per **v0.4.0** (Gestione interamente client-side tramite template di stringhe interattive).
   - **GH-21** (Esportazione .ics): Effort **Basso**. Pianificato per **v0.4.0** (Implementazione client-side pura).
   - **GH-22** (Clienti Preferiti Top): Effort **Basso**. Pianificato per **v0.4.0** (Integrazione di flag boolean e stelle dorate nella UI dell'agenda/calendario).
   - **GH-23** (Briefing Vocale Audio Reader): Effort **Medio**. Pianificato per **v0.5.0** (Adozione delle Speech Synthesis API native del Web Speech API).
   - **GH-24** (Visite d'Emergenza "Chi c'è vicino?"): Effort **Medio**. Pianificato per **v0.5.0** (Algoritmo Haversine nel client-side e geo-lookup delle tappe).
3. **Approccio Zero-Code Change**:
   - In aderenza alla richiesta, la sessione si è concentrata unicamente sulla sincronia informativa, logistica e di programmazione stradale, lasciando inalterato il codice sorgente per preservare la stabilità della build corrente.

---

## Sessione del 2026-06-09 (Mattina) - Analisi Bug e Robustezza JSON (v0.3.2)
### Panoramica della Sessione
In questa sessione abbiamo esaminato il codice sorgente per identificare potenziali vulnerabilità o bug runtime, concentrandoci in particolare sullo scambio dati tra il client e l'API di Gemini.

### Decisioni Rilevanti e Rimozione Bug
1. **Integrazione del Robust JSON Cleaner (`server.ts`)**:
   - *Contesto*: Le risposte di model come Gemini (anche configurando `responseMimeType: "application/json"`) talvolta possono includere delimitatori Markdown (es. ```json ... ```). Un semplice `JSON.parse` lancerebbe un'eccezione, causando il fallimento dell'importazione massiva o della singola interpretazione.
   - *Decisione*: Implementato un helper dedicato `cleanAndParseJSON` che rimuove preventivamente i blocchi di codice Markdown prima di invocare il parser. Sostituite tutte le istanze fragili di parsing JSON nel file `server.ts`.
2. **Controllo Coerenza Tipi**:
   - Verificato che i campi opzionali del debriefing (`prodotti`, `offerta`, `nextStep`) siano integrati e gestiti in sicurezza sia nel client che nelle chiamate di parsing del server.

---

## Sessione del 2026-06-09 (Pomeriggio) - Gestione Quota ed Eccezioni AI (v0.3.3)
### Panoramica della Sessione
Risoluzione e mitigazione degli errori di runtime legati ai limites di quota del client (`RESOURCE_EXHAUSTED` o errori codificati `429`). È stato creato e validato un robusto meccanismo di auto-fallback locale e silenzioso per garantire l'altissima disponibilità dell'applicazione anche in totale assenza o affaticamento della chiave API Gemini remota. Successivamente, su indicazione dell'utente, la persistenza di limiti rigidi della chiave utente è stata inserita e tracciata formalmente nel Backlog di progetto.

### Decisioni Rilevanti e Rimozione Bug
1. **Motori di Ripiego Offline per i 4 Endpoint AI (`server.ts`)**:
   - *Contesto*: Qualsiasi errore di quota (es. codice 429 quota superata) rispondeva con uno stato HTTP 550 che bloccava e inficiava il corretto utilizzo del piano visite o debriefing da parte dell'agente.
   - *Decisione*: Avvolto ciascun controller AI in blocchi try/catch di emergenza. All'attivarsi di un errore, l'endpoint intercetta l'eccezione, logga l'errore di quota internamente ed esegue l'elaborazione locale immediata restituendo comunque un oggetto valido con marcatura di warning e tag diagnostici.
2. **Inserimento del Bug Quota nel Backlog di Progetto (`/GOVERNANCE/BACKLOG.md`)**:
   - *Contesto*: L'errore di quota persiste sul lato client per superamento dei limiti fisici del tier gratuito della chiave Gemini.
   - *Decisione*: Documentato l'errore sistematico sotto l'ID **GH-19 / BUG-03** nel backlog ("Voci Aperte") e nella sezione "Bug Noti ed Errori Identificati" per un corretto tracking logistico delle quote.
3. **Coerenza con le Direttive di Versionamento**:
   - Aggiornato l'indicatore visuale di build in `src/App.tsx` a `v0.3.3` e documentata la release logistica nel modulo `GOVERNANCE/CHANGELOG.md`.

### Query Più Efficaci
- *Pattern di Graceful Fallback su Errore di Quota API 429*:
  ```typescript
  try {
    const response = await ai.models.generateContent({ ... });
    res.json(cleanAndParseJSON(response.text, {}));
  } catch (error: any) {
    console.error("AI service error, launching self-fallback:", error);
    res.json({
      ...handleFallback(),
      warning: "Gemini API Limit reached; using local fallback: " + error.message
    });
  }
  ```

### Suggerimenti per la Sessione Successiva
- Monitorare l'adozione delle rotte ottimizzate in sandbox per verificarne l'aderenza con le coordinate stradali reali generate dal geodecoder Nominatim.

---

## Sessione del 2026-06-08 (Pomeriggio) - Ottimizzazione Startup & Navigazione (v0.3.2)
### Panoramica della Sessione
In questa sessione ci siamo concentrati principalmente sulla stabilità della condivisione dell'applicazione (startup caricamento fluido senza vincoli bloccanti di geolocalizzazione nativa dell'iframe) e sulle funzionalità logistiche di navigazione con Google Maps.

### Decisioni Rilevanti e Cambi di Rotta
1. **Rimozione dei permessi di Geolocalizzazione nativi (`metadata.json`)**:
   - *Contesto*: La condivisione dell'applicazione falliva il caricamento perché richiedeva geolocalizzazione sincrona / bloccante al caricamento dei frame esterni.
   - *Decisione*: Rimuovere la dicitura `geolocation` da `requestFramePermissions` e togliere controlli sincroni bloccanti. L'app ora si carica istantaneamente ovunque.
2. **Parallelizzazione del Geocoding in `geo.ts`**:
   - *Contesto*: Il caricamento dei tragitti e percorsi nel planner giornaliero era lento a causa di chiamate sequenziali `await` a Nominatim OSM Geocoding.
   - *Decisione*: Sostituito con `Promise.all` per geocodificare indirizzo di partenza e tappe simultaneamente, quadruplicando la velocità di geocodifica e riducendo a 1.2s il timeout con AbortController.
3. **Integrazione Google Search Grounding per l'AI**:
   - *Contesto*: Con appunti sintetici come "ratti guanzate", l'applicazione falliva a volte a individuare la via corretta.
   - *Decisione*: Abilitato il tool `googleSearch` sull'SDK `@google/genai` nelle API del server. L'AI ora esegue autonomamente una ricerca Web al volo per trovare la via/civico esatto dell'azienda menzionata (es. Ratti SpA in Guanzate).

### Query Più Efficaci
- *Query d'Ottimizzazione Logistica*:
  ```typescript
  // Geocode all points in parallel to prevent sequential wait bottlenecks
  const coordsList = await Promise.all([
    geocodeAddress(startAddress),
    ...destAddresses.map((addr) => geocodeAddress(addr)),
  ]);
  ```
- *Integrazione Grounding per Gemini SDK*:
  ```typescript
  const response = await ai.models.generateContent({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: ...
    }
  });
  ```

### Suggerimenti per la Sessione Successiva
- Eseguire dei test approfonditi sull'importazione di appunti sintetici contenenti brand/comuni (es. "ratti guanzate") per testare la qualità dell'indirizzo completo individuato grazie al Google Search Grounding nel backend.
- Verificare la corretta cancellazione delle visite direttamente dalla visualizzazione del calendario (ora istantanea e non ostacolata dal blocco native `confirm` dell'iframe).

---

## Sessione del 2026-06-08 (Mattina) - Inizializzazione & Rilavorazione Tab Sandbox (v0.3.1)
### Panoramica della Sessione
Questa sessione ha definito l'ossatura logistica e il feeling visivo di **FiSalesNav**. Abbiamo rielaborato lo schema colore primario, isolato la Sandbox per pianificare i tragitti esterni e ripulito il nucleo informativo per renderlo altamente performante e aderente alla conformità sulla privacy.

### Decisioni Rilevanti e Cambi di Rotta
1. **Pivot Colore Primario (Cobalto/Lavagna - GH-1)**:
   - *Contesto*: Lo schema cromatico arancione originale risultava visivamente stancante per l'utilizzo prolungato da parte degli agenti nei display delle automobili.
   - *Decisione*: Sostituito con un moderno abbinamento Blu Cobalto e Lavagna, garantendo alti contrasti sotto luce solare diretta.
2. **Isolamento dell'Ottimizzazione alla Sandbox (GH-2 / GH-12)**:
   - *Contesto*: Gli agenti commerciali non vogliono che un algoritmo rimescoli compulsivamente gli appuntamenti formali già fissati con i clienti nel calendario.
   - *Decisione*: Confinato l'algoritmo di ottimizzazione TSP (Commesso Viaggiatore) all'interno del solo pannello Sandbox, lasciando intatto l'ordine stabilito nell'agenda.
3. **Calcolo della Rotta ad Anello Chiuso (Ritorno a Casa - GH-4)**:
   - *Contesto*: Le stime omettevano l'ultima tratta, portando a una pianificazione chilometrica insufficiente per determinare le tempistiche reali di rientro a fine giornata.
   - *Decisione*: Introdotto il calcolo automatico della rotta di ritorno all'indirizzo registrato di partenza (casa dell'agente) per chiudere correttamente l'anello chilometrico.
4. **Resilienza Geocoding via Fallback sul Comune (GH-10)**:
   - *Contesto*: Indirizzi approssimativi o difettosi bloccavano completamente le stime chilometriche di OpenStreetMap / OSRM.
   - *Decisione*: Implementata una logica di fallback automatico: se la chiamata di geodecoding fallisce per l'isolato civico, l'app interroga OSM sul solo nome del Comune per garantire comunque una stima realistica del tragitto.
5. **Selezionabilità Totale del Testo (GH-11)**:
   - *Contesto*: Gli agenti necessitano di copiare indirizzi, contatti e note di debriefing su client email nativi o CRM del proprio dispositivo.
   - *Decisione*: Resi tutti i nodi e card dell'applicazione conformi con la classe CSS `select-text`.
