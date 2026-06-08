# BACKLOG

## Voci Aperte (In Corso o Pianificate)

| ID | Categoria | Descrizione | Dipendenze | Effort | Stato | Versione |
|---|---|---|---|---|---|---|
| **U-04** / **GH-18** | User request | **AI non cerca indirizzo completo durante parse (GitHub #18)**: Con un appunto sintetico come "visita mercoledì da ratti guanzate", l'AI deve cercare l'indirizzo reale completo o valorizzarlo con provincia/CAP ("Guanzate, CO, Italia") | Nessuna | Medio | **In Corso / Test** (Prompt in server.ts modificato con Google Search Grounding, in attesa di test) | - |

---

## Voci Completate

| ID | Categoria | Descrizione | Dipendenze | Effort | Data Chiusura | Versione |
|---|---|---|---|---|---|---|
| **U-01** / **GH-16** | User request | **Itinerario giornata dal calendario (GitHub #16)**: Inserimento di un pulsante "Apri itinerario su Google Maps" per ogni giorno nella visualizzazione calendario. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **U-02** / **GH-14** | User request | **Pulsante "Naviga" su ogni card visita (GitHub #14)**: Pulsante aggiunto per ogni visita giornaliera che rimanda direttamente alla navigazione Maps per quell'indirizzo. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **U-03** / **GH-13** | User request | **Risoluzione discrepanza itinerario Maps (GitHub #13)**: Allineamento dell'ordine delle tappe tra planner ed itinerario aperto su Google Maps tramite corretto utilizzo di `waypoints`. | Nessuna | Medio | 2026-06-08 | v0.3.2 |
| **BUG-01** / **GH-17** | Bug noto | **Tasto rimuovi non funzionante nel calendario (GitHub #17)**: Rimosso il `confirm` nativo del browser (bloccante/incompatibile con l'iframe) sostituendolo con cancellazione diretta. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **BUG-02** / **GH-15** | Bug noto | **Risoluzione crash startup - Geolocalizzazione (GitHub #15)**: Rimosso blocco caricamento eliminando `geolocation` da `metadata.json` e parallelizzando le richieste OSM geocoding per renderle istantanee ed asincrone. | Nessuna | Basso | 2026-06-08 | v0.3.2 |

---

## Bug Noti ed Errori Identificati
*(Tutti i bug attuali importati dal repository sono stati risolti e chiusi nella versione v0.3.2).*
- Nessun bug aperto o non gestito registrato alla data corrente.

