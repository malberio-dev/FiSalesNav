# DAILY

Diario di bordo e memoria storica delle decisioni e degli avanzamenti del progetto **FiSalesNav**.

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

### Query Più Efficaci
- *Logica di Robustezza Fallback Geocoding*:
  ```typescript
  // Se la geocodifica dell'indirizzo completo non risponde, ripiega sul nome del Comune
  async function geocodeWithFallback(address: string, city: string) {
    let coords = await geocodeAddress(address);
    if (!coords && city) {
      coords = await geocodeAddress(city);
    }
    return coords;
  }
  ```

### Suggerimenti per la Sessione Successiva
- Introdurre indicatori sui chilometri totali stimati e i debriefing AI nella vista giornaliera.
- Risolvere i bug associati ai permessi di geolocalizzazione nell'iframe e al tasto elimina.

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
Risoluzione e mitigazione degli errori di runtime legati ai limiti di quota del client (`RESOURCE_EXHAUSTED` o errori codificati `429`). È stato creato e validato un robusto meccanismo di auto-fallback locale e silenzioso per garantire l'altissima disponibilità dell'applicazione anche in totale assenza o affaticamento della chiave API Gemini remota. Successivamente, su indicazione dell'utente, la persistenza di limiti rigidi della chiave utente è stata inserita e tracciata formalmente nel Backlog di progetto.

### Decisioni Rilevanti e Rimozione Bug
1. **Motori di Ripiego Offline per i 4 Endpoint AI (`server.ts`)**:
   - *Contesto*: Qualsiasi errore di quota (es. codice 429 quota superata) rispondeva con uno stato HTTP 500 che bloccava e inficiava il corretto utilizzo del piano visite o debriefing da parte dell'agente.
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
