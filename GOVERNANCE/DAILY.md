# DAILY

Diario di bordo e memoria storica delle decisioni e degli avanzamenti del progetto **FiSalesNav**.

---

## Sessione del 2026-06-08 - Ottimizzazione Startup & Navigazione

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
