# CHANGELOG

Tutte le modifiche e gli aggiornamenti di versione apportati a **FiSalesNav**.

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
- **Sincronia Waypoints**: Corretto il formato del link a Google Maps per includere i waypoint intermedi esattamente nell'ordine pianificato dall'applicazione.

### Corretto
- **Fix Crash Startup**: Rimossa la richiesta di permessi `geolocation` bloccanti da `/metadata.json` poiché bloccava il caricamento dell'app nell'iframe prima di visualizzare l'interfaccia.
- **Risoluzione Elimina Visita**: Eliminato l'uso del `confirm` nativo del browser in `App.tsx` che impediva la rimozione delle visite nella visualizzazione calendario per vincoli sandbox dell'iframe.

---

## [v0.3.1] - Versioni Precedenti
- Inizializzazione della base di pianificazione visite, calendario, integrazione con debriefing assistito da AI (v0.3.1).
