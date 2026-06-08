# BACKLOG

## Voci Aperte (In Corso o Pianificate)

| ID | Categoria | Descrizione | Dipendenze | Effort | Stato | Versione |
|---|---|---|---|---|---|---|
| **GH-18** / **U-04** | User request | **AI non cerca indirizzo completo durante parse**: Con un appunto sintetico come *"visita mercoledì da ratti guanzate"*, l'AI deve cercare l'indirizzo reale completo o valorizzarlo con provincia/CAP (*"Guanzate, CO, Italia"*). | Nessuna | Medio | **In Corso / Test** (Prompt in `server.ts` modificato con Google Search Grounding, in attesa di test finale) | - |

---

## Voci Completate

| ID | Categoria | Descrizione | Dipendenze | Effort | Data Chiusura | Versione |
|---|---|---|---|---|---|---|
| **GH-17** / **BUG-01** | Bug noto | **Tasto rimuovi non funzionante nel calendario**: Rimosso il `confirm` nativo del browser (bloccante/incompatibile con l'iframe) sostituendolo con cancellazione diretta. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **GH-16** / **U-01** | User request | **Itinerario giornata dal calendario**: Inserimento di un pulsante "Apri itinerario su Google Maps" con `waypoints` per ogni giorno nella visualizzazione calendario. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **GH-15** / **BUG-02** | Bug noto | **Risoluzione crash startup - Geolocalizzazione**: Rimosso blocco caricamento eliminando `geolocation` da `metadata.json` e parallelizzando le richieste OSM geocoding per renderle istantanee ed asincrone. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **GH-14** / **U-02** | User request | **Pulsante "Naviga" su ogni card visita**: Pulsante aggiunto per ogni visita giornaliera che rimanda direttamente alla navigazione Maps per quell'indirizzo specifico. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **GH-13** / **U-03** | User request | **Risoluzione discrepanza itinerario Maps**: Allineamento dell'ordine delle tappe tra planner ed itinerario aperto su Google Maps tramite corretto utilizzo di `waypoints` per evitare che l'ordine delle tappe si scompigli. | Nessuna | Medio | 2026-06-08 | v0.3.2 |
| **GH-12** | User request | **Rilavorazione tab sandbox**: La sandbox servirà a pianificare una giornata, quindi è utile avere una stima dei km dinamica e la possibilità di draggare le card delle visite per riordinarle. | Nessuna | Medio | 2026-06-08 | v0.3.1 |
| **GH-11** | User request | **Testo selezionabile**: Rendi tutti i testi dell'applicazione selezionabili e copiabili dall'agente di commercio. | Nessuna | Basso | 2026-06-08 | v0.3.1 |
| **GH-10** | Bug noto | **Stima km da indirizzo alternativo se non trovato**: Con i dati demo, tra alcuni indirizzi di transizione errati, la distanza era calcolata incorrettamente. Ora esegue una stima fall-back sul **Comune** in caso di indirizzo stradale non calcolabile. | Nessuna | Medio | 2026-06-08 | v0.3.1 |
| **GH-9** | User request | **Stime dei km totali e tempo di viaggio in visione "oggi"**: Nella visualizzazione "oggi", a fianco al titolo, data e numero visite inseriti i km stimati totali della giornata. | Nessuna | Medio | 2026-06-08 | v0.3.1 |
| **GH-8** | User request | **Funzione pulisci dati demo**: Nel pannello delle impostazioni, inserito un pulsante per rimuovere rapidamente tutte le visite marcate come demo e ripulire l'agenda. | Nessuna | Basso | 2026-06-08 | v0.3.1 |
| **GH-7** | User request | **Dati demo sandbox**: Popolamento della sandbox con dati e tappe demo per facilitare i test di ordinamento. | Nessuna | Basso | 2026-06-08 | v0.3.1 |
| **GH-6** | User request | **Rimuovi le informazioni sensibili dai dati demo**: Rimossi tutti i riferimenti a *"Pepperl+Fuchs"* o dati reali di aziende terze sensibili a favore di mock generici e neutri. | Nessuna | Basso | 2026-06-08 | v0.3.1 |
| **GH-5** | User request | **Rimuovi frecce di navigazione laterale settimana nell'header**: Feature duplicata raccordata solo sulla sezione Calendario per rendere pulito il design. | Nessuna | Basso | 2026-06-08 | v0.3.1 |
| **GH-4** | User request | **Aggiungi stima km/tempo verso casa nel giorno**: Visualizza anche la tratta finale (ritorno a casa come percorso ad anello chiuso all'ultimo punto della giornata). | Nessuna | Medio | 2026-06-08 | v0.3.1 |
| **GH-2** | User request | **Ottimizzazione itinerario nella visualizzazione "giorno"**: Spostamento/risoluzione della funzione "Ottimizza itinerario", ora confinata SOLO alla sandbox in quanto l'agenda stabilita con appuntamento cliente non deve essere sovrascritta o riorganizzata forzatamente. | Nessuna | Basso | 2026-06-08 | v0.3.1 |
| **GH-1** | User request | **Cambia colore base in blu anziché arancione**: Cambiato lo schema cromatico primario dell'intera applicazione in un moderno Blu/Cobalto, accoppiato con dettagli lavagna. | Nessuna | Basso | 2026-06-08 | v0.3.1 |

---

## Voci Rifiutate / Escluse

| ID | Categoria | Descrizione | Dipendenze | Effort | Data Chiusura | Esito / Motivazione |
|---|---|---|---|---|---|---|
| **GH-3** | User request | **Rimborso ACI nel riepilogo**: Calcoli sui rimborsi ACI e chilometrici all'interno della dashboard di sintesi settimanale. | Nessuna | Basso | 2026-06-08 | **Rifiutata / Chiusa**: Funzionalità non richiesta e non coerente con i limiti definiti in `MISSION.md` (non facciamo contabilità/CRM pesante). |

---

## Bug Noti ed Errori Identificati
*(Tutti i bug ereditati o registrati sul repository GitHub sono stati risolti e chiusi con successo).*
- Nessun bug aperto registrato alla data corrente.
