# Guida di Architettura e Deployment · FiSalesNav

Benvenuto nella documentazione tecnica ufficiale di **FiSalesNav**, l'assistente logistico di pianificazione itinerari e debriefing per agenti commerciali operanti sul territorio italiano.

---

## 1. Visione d'Insieme dell'Applicazione

**FiSalesNav** è un'applicazione full-stack moderna (React + Node.js Express) progettata per massimizzare la produttività degli agenti commerciali sul campo. Permette la gestione dell'agenda settimanale, il calcolo automatico dei chilometri, l'ottimizzazione degli itinerari in modalità Sandbox e la redazione assistita da Intelligenza Artificiale (Gemini 3.5) dei verbali d'incontro ("debriefing") pronti per essere inseriti nei CRM aziendali.

L'applicazione è progettata con una filosofia **offline-first & fail-safe**: in caso di assenza della chiave API Gemini o mancanza di connettività, l'intera logistica e l'estrazione dati continuano a funzionare egregiamente tramite algoritmi euristici locali e un solido parser interno di riserva.

---

## 2. Architettura di Sistema

L'applicazione segue un impianto **Full-Stack monolitico accoppiato**:

```
 ┌────────────────────────────────────────────────────────┐
 │                   BROWSER / CLIENT                     │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │                  SPA (React 19)                  │  │
 │  │                                                  │  │
 │  │  - Interfaccia Utente (Tailwind CSS v4 + Motion) │  │
 │  │  - Gestione dello Stato Locale (LocalStorage)    │  │
 │  │  - Geocoding OSM Nominatim (Async / Parallel)    │  │
 │  │  - Visualizzazioni (Oggi, Calendario, Sandbox)   │  │
 │  └────────────────────────┬─────────────────────────┘  │
 └───────────────────────────┼────────────────────────────┘
                             │
                      Chiamate API REST
                             │
 ┌───────────────────────────▼────────────────────────────┐
 │               SERVER DI BACKEND (Node.js)              │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │                   Express App                    │  │
 │  │                                                  │  │
 │  │  - API Proxy per Google GenAI SDK                │  │
 │  │  - Integrazione Search Grounding (Live Queries)  │  │
 │  │  - Middleware di Asset statici (Vite / Dist)     │  │
 │  └──────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────┘
```

### Flusso di Lavoro ed Hub Principali
- **Client-Side SPA (React 19 & Vite 6)**: Gestisce la visualizzazione dinamica e l'interazione utente. Le coordinate e i percorsi sono stimati direttamente nel browser tramite chiamate asincrone all'API OpenStreetMap (nominatim) con sistemi di caching preventivi per ridurre il carico di rete.
- **Server-Side API (Express)**: Funge da barriera di sicurezza per nascondere le chiavi API del modello linguistico e orchestrare le chiamate verso Google GenAI.
- **Strato di persistenza**: Per assecondare i requisiti di dinamicità dell'agenda d'aula mobile senza forzare CRM pesanti o database distribuiti, le pianificazioni personali vengono persistite localmente nel browser (`localStorage`). Ciò garantisce velocità istantanea e totale conformità con la privacy aziendale.

---

## 3. Dipendenze Tecnologiche

L'applicazione mantiene un insieme ultra-ottimizzato di librerie moderne dichiarate all'interno di `package.json`:

### Dipendenze Principali (`dependencies`)
- **`react` & `react-dom` (v19.0.1)**: Framework client-side reattivo dichiarativo.
- **`@google/genai` (v2.4.0)**: SDK di ultima generazione ufficiale di Google per l'interazione con Gemini.
- **`express` (v4.21.2)**: Server backend HTTP minimalista per Node.js.
- **`lucide-react` (v0.546.0)**: Set completo di icone vettoriali coerenti e ad alte prestazioni.
- **`motion` (v12.23.24)**: Motore di animazione fluido per le transizioni di cambi tab ed elementi drag&drop.
- **`xlsx` (v0.18.5)**: Utility di parsing e decodifica di fogli di calcolo Excel per l'importazione di pool clienti massivi.
- **`dotenv` (v17.2.3)**: Caricamento assistito delle variabili d'ambiente locali.

### Dipendenze di Sviluppo (`devDependencies`)
- **`typescript` (v5.8.2)**: Controllo e compilazione statica rigorosa del codice sorgente.
- **`vite` (v6.2.3)**: Bundler di sviluppo ultra-rapido per l'interfaccia React.
- **`@tailwindcss/vite` (v4.1.14)**: Plugin integrativo di compilazione nativa dei fogli di stile Tailwind CSS v4.
- **`tsx` (v4.21.0)**: Esecutore TypeScript a riga di comando per caricare il server di sviluppo in tempo reale.
- **`esbuild` (v0.25.0)**: Compilatore e bundler ultra-rapido adoperato per confezionare il modulo Express di produzione.

---

## 4. Vincoli Architetturali e di Sicurezza

Per un corretto funzionamento strutturale, i seguenti vincoli di progettazione sono rigorosamente implementati e non devono essere modificati in produzione:

1. **Gestione Sicura dei Segreti (API Key)**:
   - La chiave API `GEMINI_API_KEY` deve essere conservata esclusivamente sul lato server come variabile di ambiente.
   - Non deve mai essere esposta al client o inserita in diciture prefissate con `VITE_`.
   - Il client comunica con l'AI unicamente delegando alle API locali interne (`/api/ai/*`).

2. **Rete e Porte di Ingress (Nginx / Reverse Proxy)**:
   - Il server Express di produzione **deve rimanere vincolato esclusivamente ad ascoltare sull'host `0.0.0.0` alla porta `3000`**.
   - Eventuali bilanciatori o proxy esterni (come quelli di Cloud Run o AWS ECS) instraderanno il traffico pubblico direttamente verso la porta interna 3000.

3. **Integrità del Pacchetto di Produzione (CJS Server Bundling)**:
   - A causa delle discrepanze di risoluzione dei moduli ESM nativi in Node.js, il server backend viene compilato in formato CommonJS (`.cjs`) all'interno di un unico bundle autosufficiente sotto `dist/server.cjs` tramite `esbuild`.
   - Nel formato di produzione, le dipendenze native pesanti vengono lasciate come esterne (`--packages=external`) per velocizzare i tempi di bootstrap del container ed abbattere drasticamente i cold start.

---

## 5. Configurazione delle Variabili Ambientali

L'applicazione richiede una minima configurazione ambientale documentata sul file `.env.example`:

```env
# Chiave API ufficiale di Google AI Studio per l'interazione con Gemini
GEMINI_API_KEY=tuo_codice_api_segreto

# Ambiente di esecuzione (sviluppo o produzione)
NODE_ENV=production
```

Se la variabile `GEMINI_API_KEY` non è presente nel container di produzione, l'applicazione non andrà in errore all'avvio, ma disabiliterà automaticamente le funzioni avanzate di traduzione, grounding di geocodifica AI e sintesi settimanale, informando l'agente tramite tooltip discreti all'interno della dashboard principale.

---

## 6. Pipeline di Build e Esecuzione in Produzione

Per effettuare la compilazione e avviare FiSalesNav su qualsiasi server cloud o container Docker, adoperare i seguenti script standardizzati:

### Fase 1: Installazione delle Dipendenze
```bash
npm install
```

### Fase 2: Compilazione del Progetto
Eseguendo lo script di build, avvengono contemporaneamente due operazioni distinte coordinate:
1. **Frontend**: Vite compila e minimizza la React SPA piazzandola nella cartella statica `/dist`.
2. **Backend**: `esbuild` pacchettizza il file `server.ts` unificandone i percorsi relativi ed esportando l'eseguibile Node `dist/server.cjs` completo di sourcemap.

```bash
npm run build
```

### Fase 3: Avvio dell'Applicazione
Avvia il server Express unificato in modalità produzione, che risponderà sulla porta 3000 servendo contemporaneamente sia le rotte API che i file statici del client:

```bash
npm start
```

---

## 7. Linee Guida per il Deployment (Cloud Run / Docker)

Per deployare FiSalesNav in un ambiente containerizzato (come Google Cloud Run, AWS App Runner, Heroku o VPS generica), si consiglia l'utilizzo del seguente **Dockerfile multistage** ottimizzato:

```dockerfile
# --- Fase di Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Fase di Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

Questo processo di deployment assicura un container finale ultra-leggero (inferiore a 150MB), velocissimo all'avvio e privo di strumenti di sviluppo spuri, garantendo la massima sicurezza e stabilità per l'agente commerciale.
