# BACKLOG

## Voci Aperte (In Corso o Pianificate)

| ID | Categoria | Descrizione | Dipendenze | Effort | Stato | Versione |
|---|---|---|---|---|---|---|
| **U-04** | User request | **AI non cerca indirizzo completo durante parse**: con un appunto come "visita mercoledì da ratti guanzate", l'AI deve cercare l'indirizzo reale completo o valorizzarlo con provincia/CAP ("Guanzate, CO, Italia") | Nessuna | Medio | **Pronto per implementazione** (Prompt server.ts aggiornato, da testare) | - |

---

## Voci Completate

| ID | Categoria | Descrizione | Dipendenze | Effort | Data Chiusura | Versione |
|---|---|---|---|---|---|---|
| **U-01** | User request | **Itinerario giornata dal calendario**: Inserimento di un pulsante "Apri itinerario su Google Maps" per ogni giorno nella visualizzazione calendario. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **U-02** | User request | **Pulsante "Naviga" su ogni card visita**: Pulsante aggiunto per ogni visita giornaliera che rimanda direttamente alla navigazione Maps per quell'indirizzo. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **U-03** | User request | **Risoluzione discrepanza itinerario Maps**: Allineamento dell'ordine delle tappe tra planner ed itinerario aperto su Google Maps tramite corretto utilizzo di `waypoints`. | Nessuna | Medio | 2026-06-08 | v0.3.2 |
| **BUG-01** | Bug noto | **Tasto rimuovi non funzionante nel calendario**: Rimosso il `confirm` nativo del browser (bloccante/incompatibile con l'iframe) sostituendolo con cancellazione diretta. | Nessuna | Basso | 2026-06-08 | v0.3.2 |
| **BUG-02** | Bug noto | **Risoluzione crash startup (Geolocalizzazione)**: Rimosso blocco caricamento eliminando `geolocation` da `metadata.json` e parallelizzando le richieste OSM geocoding per renderle istantanee ed asincrone. | Nessuna | Basso | 2026-06-08 | v0.3.2 |

---

## Bug Noti ed Errori Identificati
*(Tutti i bug attuali sono stati risolti e chiusi nella versione v0.3.2).*
- Nessun bug aperto registrato alla data corrente.
