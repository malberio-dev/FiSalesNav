# SCENARI DI TEST

Questo documento contiene gli scenari di test funzionali e i prompt pronti per il copia-incolla per convalidare le funzionalità dell'applicazione **FiSalesNav**, con particolare focus sugli assistenti basati su modelli generativi Gemini e sulle logiche di geolocalizzazione ed itinerario.

---

## Indice Scenari di Test
1. [Scenario 1: Pianificazione Massiva (Mass Import Planner)](#scenario-1-pianificazione-massiva-mass-import-planner)
2. [Scenario 2: Inserimento Rapido Singolo (Single Visit Parser)](#scenario-2-inserimento-rapido-singolo-single-visit-parser)
3. [Scenario 3: Debriefing Incontro (CRM Report Refiner)](#scenario-3-debriefing-incontro-crm-report-refiner)
4. [Scenario 4: Sintesi Settimanale (Weekly Summary for Management)](#scenario-4-sintesi-settimanale-weekly-summary-for-management)
5. [Scenario 5: Resilienza & Fallback Offline (Local Failover)](#scenario-5-resilienza--fallback-offline-local-failover)
6. [Scenario 6: Logistica, Coordinate & TSP (Sandbox Route Optimization)](#scenario-6-logistica-coordinate--tsp-sandbox-route-optimization)
7. [Scenario 7: Navigazione & Preview Feriale (Preview Altri Giorni)](#scenario-7-navigazione--preview-feriale-preview-altri-giorni)
8. [Scenario 8: Importazione Giornata Calendario in Sandbox](#scenario-8-importazione-giornata-calendario-in-sandbox)
9. [Scenario 9: Drag-And-Drop da Outlook (Outlook Sync Dnd)](#scenario-9-drag-and-drop-da-outlook-outlook-sync-dnd)
10. [Mappatura Chiudi-Issue del Repository (Issue Closure Mapping)](#10-mappatura-chiudi-issue-del-repository-issue-closure-mapping)

---

## Scenario 1: Pianificazione Massiva (Mass Import Planner)

### Obiettivo
Verificare la capacità del pianificatore AI di interpretare un testo destrutturato (e-mail, elenchi caotici o appunti di viaggio), estrarre le tappe e distribuirle equamente sui 5 giorni lavorativi della settimana di riferimento, compilando gli indirizzi esatti delle filiali.

### Istruzioni per il Test
1. Accedere all'applicazione e cliccare sul pulsante **"Importa con AI"** oppure **"Import Massivo"** presente nella visualizzazione calendario.
2. Copiare e incollare uno dei seguenti prompt di test nella casella di testo.
3. Cliccare su **"Pianifica Settimana con AI"**.
4. Esaminare la schermata di anteprima prima di confermare l'importazione.

### Prompt di Test 1.1: E-mail informale dell'ufficio commerciale (Molto disorganizzata)
```text
Ciao Marco,
ti lascio di seguito i referenti e i clienti che hanno chiesto una visita questa settimana su Bologna e Modena. Cerca di fare il possibile per incastrarli tutti:
- Marchesini Group a Castel Guelfo di Bologna: dicono che hanno una linea ferma mercoledì per aggiornare le barriere di sicurezza. Meglio andare martedì pomeriggio o mercoledì mattina presto.
- Sacmi a Imola: l'ing. Bianchi ci aspetta giovedì mattina per discutere di IO-Link su una pressa.
- Bonfiglioli a Calderara di Reno: sono interessati alla nuova gamma di motori brushless. Vorrebbero fare due chiacchiere lunedì, dicono che dopo le 14 sono liberi.
- Tetra Pak a Modena: passa a lasciare l'offerta aggiornata per i sensori fotoelettrici di livello se riesci giovedì o venerdì.
- Fare un salto rapido da System Ceramics a Fiorano Modenese per presentare il catalogo dei nuovi lettori di codici, preferibilmente venerdì sul tardi.
```

### Prompt di Test 1.2: Elenco sintetico misto con indicazioni geografiche parziali
```text
lun: caffè con Barilla a Pedrignano Parma verso le 15 per saluti.
martedì: Carpigiani ad Anzola dell'Emilia. Vedere reparto R&D.
giovedì: ratti guanzate (Como) alle 10:30.
venerdì: GD a Bologna alle 9. Ritiro campionatura.
Famar ad Abbiategrasso MI alle 15.
```

### Risultati Attesi
- **Estrazione accurata**: Ciascuna riga viene trasformata in un record di visita strutturato contenente Azienda, Indirizzo esteso, Data corretta (compresa tra il lunedì e il venerdì della settimana selezionata) e Orario verosimile.
- **Risoluzione degli Indirizzi (Google Search Grounding)**:
  - Per `"ratti guanzate"`, l'indirizzo deve contenere una dicitura simile a `"Via Tornese, 10, 22070 Guanzate CO, Italia"` o quantomeno `"Guanzate, CO, Italia"`.
  - Per `"Barilla a Pedrignano"`, l'indirizzo deve riflettere la sede ufficiale a Parma (`"Via Mantova, 166, Pedrignano, PR"` o simile).
- **Notifica diagnostica**: Nella schermata di anteprima viene visualizzato il badge blu **"Elaborato con Helper AI"**, con indicazione del modello (es. `gemini-3.5-flash`), dei token consumati e del numero di tentativi compiuti dal server.

---

## Scenario 2: Inserimento Rapido Singolo (Single Visit Parser)

### Obiettivo
Verificare l'estrazione logica di dettagli d'incontro da un singolo appunto vocale scritto in linguaggio naturale, con risoluzione dell'orario implicito e dell'indirizzo completo.

### Istruzioni per il Test
1. Selezionare una giornata del calendario (ad es. Martedì) e fare clic su **"Aggiungi Visita"**.
2. Rimanere nella tab **"✦ Inserimento Rapido AI"**.
3. Incollare uno dei seguenti prompt di prova e cliccare su **"Estrai e Compila Modulo"**.

### Prompt di Test 2.1: Appunto rapido con orario colloquiale e indirizzo parziale
```text
Visita martedì prima di pranzo alle undici e mezza da System Ceramics a Fiorano per verificare l'installazione delle barriere fotoelettriche sulla linea ceramica 4 con l'ing. Guidotti.
```

### Prompt di Test 2.2: Richiesta cliente con data e indirizzo specifici
```text
Incontro fissato per il 12 Giugno 2026 alle ore 15:30 da IMA SpA in Via Emilia 28 a Ozzano dell'Emilia per discutere dell'offerta di connettività Ethernet/IP. Note: portare la valigetta demo.
```

### Risultati Attesi
- L'applicazione esegue l'analisi e apre immediatamente la tab **"Moduli Strutturati"** pre-compilando tutti i campi:
  - **Azienda**: `"System Ceramics SpA"` o `"IMA SpA"`.
  - **Indirizzo**: Risolto in via stradale completa e geolocalizzabile (es: `"Via Ghiarola Nuova, 27, 41042 Fiorano Modenese MO"` o `"Via Emilia, 28, Ozzano dell'Emilia, BO"`).
  - **Data**: `"2026-06-12"` (per il test 2.2) o il giorno corrispondente al martedì correntemente selezionato (per il test 2.1).
  - **Orario**: `"11:30"` (per il test 2.1, decodificando "undici e mezza" e "prima di pranzo") o `"15:30"` (per il test 2.2).
  - **Note Pre-Visita**: Raccolgono le informazioni sull'ingegnere, sulla linea, sulle valigette o sui cataloghi da portare.

---

## Scenario 3: Debriefing Incontro (CRM Report Refiner)

### Obiettivo
Convalidare la capacità dell'intelligenza artificiale di redigere un report commerciale formale, privo di errori grammaticali ed espressamente strutturato per essere inserito nel CRM direzionale, partendo dagli appunti scritti d'istinto dall'agente in auto a fine visita.

### Istruzioni per il Test
1. Individuare una visita programmata e cliccare sul tasto **"Debriefing / Registra Esito"**.
2. Selezionare l'esito dell'incontro (ad es. **"Positivo (Trattativa avviata)"**).
3. Compilare i dati tecnici (es. Prodotti discussi, codice offerta formulata, passaggi futuri).
4. Copiare uno dei prompt disordinati nell'area **"Testo Libero / Note Rapide"** ed attivare la generazione premendo **"Migliora e Genera con AI"**.

### Scenario di Input 3.1: Note post-visita stenografiche dal campo
- **Azienda**: `Marchesini Group`
- **Prodotti Trattati**: `Serie SG4-M, IO-Link master`
- **N° Offerta CRM**: `OF26-8809`
- **Prossimo Passo**: `Quotare variante entro venerdì sera`
- **Note Rapide inserite**:
```text
Incontro con Rossi capofabbrica e Bianchi acquisti. Rossi entusiasta della SG4-M per il packaging farmaceutico, dice che risolve un bel problema di ingombro nella macchina astucciatrice. Bianchi invece fa storie sul prezzo, dice che il concorrente tedesco fa il 10% in meno ma non ha io-link integrato a bordo. Alla fine abbiamo concordato che gli faccio una variante scontata entro venerdì togliendo una prolunga di cavo che a loro non serve. Rossi spinge per testare la macchina su un prototipo ad agosto, se va bene ne comprano 40 pezzi all'anno. Ottimo potenziale.
```

### Risultati Attesi
- **Stile e Struttura**: Gemini compone un report in lingua italiana ad alto registro professionale, strutturato secondo i criteri inseriti nelle impostazioni (es. Contesto, Discussione, Next Steps).
- **Integrità dei Dati**: I codici di prodotto (`SG4-M`, `IO-Link master`), il numero dell'offerta (`OF26-8809`), i referenti (`Rossi`, `Bianchi`) e le scadenze (`venerdì`, `agosto`) vengono tutti fedelmente integrati ed elaborati all'interno della stesura.
- **Assenza di Informazioni Sensibili o Allucinazioni**: Il report non genera informazioni estranee o allucinazioni circa altri prodotti o scontistiche non esplicitate.

---

## Scenario 4: Sintesi Settimanale (Weekly Summary for Management)

### Obiettivo
Garantire che l'AI sappia collezionare, digerire e sintetizzare i vari debriefing compilati durante la settimana lavorativa per generare un'e-mail formale ed accattivante destinata al Direttore Vendite o all'Amministratore Delegato.

### Istruzioni per il Test
1. Verificare che ci siano almeno 3 o 4 visite marcate con esito **"Positivo"** o **"Da seguire"** aventi il relativo report CRM compilato nella settimana corrente. (È possibile ricorrere al pulsante **"Carica 30 Visite Demo"** nella tab Sandbox delle impostazioni per caricare una serie coerente di test).
2. Spostarsi sulla tab **"Riepilogo e Export CRM"** (o `SummaryTab`).
3. Fare clic su **"Genera Sintesi"**.

### Risultati Attesi
- Un testo discorsivo ed elegante (di circa 150-250 parole) che:
  - Esordisce indicando l'andamento generale positivo o problematico della settimana.
  - Evidenzia le trattative più calde (es. quelle con alto potenziale di vendita o riscontri più promettenti).
  - Racchiude le criticità emerse (prezzi alti, ritardi logistici dei cavi o dubbi tecnici dei clienti).
  - Delinea i prossimi passi concordati.
- Visualizzazione del badge informativo delle statistiche sul fondo per rendicontare il corretto uso delle risorse dell'API e il modello impiegato.

---

## Scenario 5: Resilienza & Fallback Offline (Local Failover)

### Obiettivo
Validare il robusto sistema di mitigazione dei blackout o dei blocchi di quote API (codice errore 429 / `RESOURCE_EXHAUSTED`). L'applicazione deve continuare a funzionare in totale assenza d'interconnessione o in presenza di API key disabilitata/superata, passando in automatico ad algoritmi di estrazione e composizione testuale locale, senza crashare e senza arrestare l'operato del venditore.

### Istruzioni per il Test
1. Aprire il pannello delle **"Impostazioni Applicazione"** e spostarsi sulla tab **"Configurazione & Consumi AI"**.
2. All'interno della console di sviluppo, o simulando un blocco delle connettività remota del server (ad esempio definendo una chiave non valida o superando di proposito la quota tramite molteplici chiamate rapide), forzare l'attivarsi del failover.
3. Eseguire un'operazione di pianificazione massiva, o un debriefing di incontro, o un riepilogo settimanale.

### Risultati Attesi
- **Nessun Blocco Clinico**: L'applicazione non mostra finestre bloccanti di crash, girandole di caricamento infinite o popup di errore JSON.
- **Generazione Alternativa**:
  - Per l'import massivo: Le righe vengono divise con algoritmi di string-regex locali e assegnate ordinatamente ai giorni disponibili.
  - Per il debriefing: Viene generata una sintesi prefissata locale che include l'azienda, i prodotti e le note originarie dell'agente.
- **Trasparenza Diagnostica (Badge Ambra)**: In tutti i pannelli dell'applicazione, al posto del badge azzurro, appare l'indicatore ambra **"Fallback Meccanico Locale"** contrassegnato con la dicitura `"Locale (Errore AI)"` o `"Locale (No API Key)"`. Il misuratore di consumo incrementa correttamente di `1` la voce "chiamate locali" conservando l'integrità dei dati storici.

---

## Scenario 6: Logistica, Coordinate & TSP (Sandbox Route Optimization)

### Obiettivo
Assicurarsi che l'algoritmo del commesso viaggiatore (TSP - Traveling Salesman Problem) e gli stimatori di distanza gestiscano correttamente le coordinate geografiche in Lombardia ed Emilia, ricalcolando la rotta ottimizzata ad anello chiuso con rientro a casa ed attivando i percorsi corretti su Google Maps.

### Istruzioni per il Test
1. Verificare che l'indirizzo di partenza (punto iniziale dell'anello) sia compilato nelle Impostazioni (ad es. `"Saronno, VA, Italia"` o `"Milano, MI"`).
2. Spostarsi sulla tab **"Sandbox Logistica"** (o `SandboxTab`).
3. Selezionare una delle giornate pre-popolate (aventi almeno 3 o 4 tappe in comuni diversi come Bologna, Fiorano, Imola o Modena).
4. Cliccare sul pulsante **"Ottimizza Itinerario (TSP)"**.
5. Cliccare su **"Apri intero itinerario su Google Maps"**.

### Risultati Attesi
- **Riordinamento logico**: Le card delle visite e la mappa coordinano un ricalcolo delle distanze stradali (espresse in Km e minuti totali storici). La sequenza delle tappe viene riorganizzata per minimizzare i chilometri da percorrere.
- **Chiusura ad Anello**: La stima chilometrica complessiva esplicitata in testa include l'ultima tratta finale, ovvero il viaggio di ritorno dall'ultima tappa della giornata fino all'abitazione registrata dell'agente di vendita.
- **Integrità Maps**: Google Maps si apre in una nuova finestra visualizzando l'esatto itinerario ordinato, impostando la casa dell'agente come partenza e come destinazione d'arrivo finale, ed inserendo tutte le tappe intermedie come punti di sosta (`waypoints`).
- **Resilienza Indirizzi**: Nel caso in cui una delle tappe presenti un indirizzo stradale inesistente o troncato (es: `"Azienda Demo, via sgangherata, Bologna"`), il geocoder riscontra l'anomalia ma esegue immediatamente il fallback calcolando le coordinate del baricentro del Comune di `"Bologna"`, impedendo che la mappa o la stima km totali falliscano.

---

## Scenario 7: Navigazione & Preview Feriale (Preview Altri Giorni)

### Obiettivo
Verificare che l'utente possa scorrere e visualizzare l'itinerario e le distanze stradali riordinate di ciascun giorno feriale della settimana selezionata, direttamente all'interno della scheda principale "Oggi", senza dover attendere il giorno stesso del calendario.

### Istruzioni per il Test
1. Accedere alla scheda **"Oggi"**.
2. Identificare il nuovo widget **"Navigazione e Preview Giornate"** posizionato sopra il titolo del percorso.
3. Cliccare sui vari giorni feriali dal lunedì al venerdì (es. cliccando sul martedì o sul giovedì feriale).

### Risultati Attesi
- L'intestazione dell'itinerario cambia mostrando la dicitura **"PREVIEW"** accoppiata alla data corretta scelta.
- Se il giorno feriale è diverso dal giorno solare reale correntemente in corso, appare il tasto azzurro **"Torna a Oggi"** che consente di rientrare fluidamente nell'andamento quotidiano reale.
- L'elenco mostra l'esatta sequenza delle visite pianificate per quel giorno, ricalcolando ed esplicitando in riga i chilometri complessivi (`🚗 X km`).

---

## Scenario 8: Importazione Giornata Calendario in Sandbox

### Obiettivo
Validare la facoltà di clonare/traslocare in blocco tutte le visite pianificate per un giorno della settimana all'interno del tavolo da disegno Sandbox, per studiare deviazioni, percorsi alternativi o suggerimenti di tappa senza scompaginare l'agenda ufficiale prima della conferma definitiva.

### Istruzioni per il Test
1. Creare o verificare che vi siano 3 o 4 visite inserite per una giornata della settimana (ad es. per il Mercoledì).
2. Spostarsi nella scheda **"Sandbox"**.
3. Sotto il testo descrittivo del modulo, localizzare la sezione **"Importa Giornata pianificata per ottimizzarla"**.
4. Cliccare sul pulsante feriale corrispondente (es. `Mercoledì [3 visite]`).

### Risultati Attesi
- L'applicazione mostra un avviso nativo richiedendo conferma del trasferimento feriale in Sandbox.
- Al clic su "Conferma", le visite di quella giornata vengono spostate nella Sandbox (la data viene azzerata liberando il calendario ufficiale).
- Le visite appaiono nell'elenco descrittivo della Sandbox, sbloccando la pianificazione manuale o l'ottimizzazione automatica TSP.

---

## Scenario 9: Drag-And-Drop da Outlook (Outlook Sync Dnd)

### Obiettivo
Convalidare la capacità dell'agente di importare in modo nativo e interattivo gli appuntamenti formati in Microsoft Outlook sul proprio PC, attraverso il trascinamento orizzontale dei file `.ics` o della selezione testuale delle e-mail d'invito d'incontro direttamente sopra la colonna del giorno prescelto.

### Istruzioni per il Test
1. Spostarsi nella scheda **"Calendario"**.
2. Trascinare un file di appuntamento del calendario `.ics` (o copiare un frammento di testo d'incontro come *"Visita Barilla alle ore 10:30 via Mantova Parma"*) dalla cartella del computer o dall'applicazione Outlook sopra uno dei giorni feriali (es. Giovedì).
3. Rilasciare l'elemento trascinato quando la colonna si colora.

### Risultati Attesi
- Entrando con l'elemento trascinato sopra la colonna feriale del giorno desiderato, l'interfaccia risponde istantaneamente applicando un overlay blu lucido e l'icona con la dicitura **"Rilascia l'incontro qui!"**.
- Al rilascio (`drop`), il file o testo viene processato localmente estraendo il titolo dell'incontro, l'ora (es. `10:30`), l'indirizzo stradale e i dettagli della riunione.
- Viene creato in automatico un nuovo record di visita strutturato inserito all'istante nel database per la data su cui è avvenuto il rilascio.

---

## 10. Mappatura Chiudi-Issue del Repository (Issue Closure Mapping)

Questo capitolo associa ciascun scenario di test eseguito con successo ai corrispondenti ticket (ID Issue) registrati nel **Backlog** di progetto. Al superamento di ciascun test, lo sviluppatore o il maintainer può procedere alla chiusura formale delle issue sul repository GitHub.

### Tabella delle Corrispondenze & Criteri di Chiusura

| ID Issue | Titolo Backlog / Descrizione | Scenario di Test Associato | Criterio di Accettazione per Chiusura | Stato di Rilascio |
|:---:|---|---|---|:---:|
| **GH-18** | **AI non cerca indirizzo completo durante parse** | [Scenario 1](#scenario-1-pianificazione-massiva-mass-import-planner) & [Scenario 2](#scenario-2-inserimento-rapido-singolo-single-visit-parser) | L'AI arricchisce input stringati (es. *"ratti guanzate"*) ricercando l'indirizzo esatto via Google Search Grounding e geolocalizzandolo, anziché limitarsi a trascrivere il testo inserito. | **v0.3.4** |
| **GH-21** | **Configurazione Modello AI** | [Scenario 5](#scenario-5-resilienza--fallback-offline-local-failover) & Pannello Impostazioni | I selettori dei profili modello (*fast* e *advanced*) rispondono dinamicamente ai salvataggi nelle impostazioni e variano il payload diretto inviato al server. | **v0.3.4** |
| **GH-22** | **Retry Chiamate AI con Exponential Backoff** | [Scenario 5](#scenario-5-resilienza--fallback-offline-local-failover) & Pannello Impostazioni | In caso di saturazione temporanea, il server effettua i tentativi impostati incrementando il ritardo, mostrando il computo dei retry nei log diagnostici. | **v0.3.4** |
| **GH-25** | **Persistenza errori di quota API Gemini** *(Graceful Fallback)* | [Scenario 5](#scenario-5-resilienza--fallback-offline-local-failover) | Il blocco o la mancanza temporanea della chiave non arresta l'applicazione e non restituisce errori 550 o JSON non validi. L'app esegue un parser euristico o formattatore locale fluido. | **v0.3.4** |
| **GH-26** | **Errore contatore visite nel Riepilogo** *(Contatori errati)* | [Scenario 4](#scenario-4-sintesi-settimanale-weekly-summary-for-management) | Il contatore "Pianificate" nella scheda Riepilogo computa e visualizza esclusivamente le visite pianificate collocate nel piano feriale settimanale, separandole accuratamente da bozze libere in Sandbox o cancellazioni allocate in Backlog. | **v0.4.0** |
| **GH-27** | **Gestione modello AI da settings** | Pannello Impostazioni AI | Distinzione operativa tra il modello ultra-leggero di routine (`gemini-3.1-flash-lite`, progettato per massime quote e consumo ridotto) e il modello completo di report (`gemini-3.5-flash`). | **v0.3.4** |
| **GH-28** | **Preview altri giorni nella scheda Oggi** | [Scenario 7](#scenario-7-navigazione--preview-feriale-preview-altri-giorni) | La scheda "Oggi" presenta un radiocomando con i 5 giorni feriali della settimana corrente. Cambiando la selezione, l'itinerario e le relative tratte si modificano per mostrare la giornata scelta in anteprima reale senza dover attendere il giorno in corso. | **v0.4.0** |
| **GH-29** | **Importazione calendario da sandbox** | [Scenario 8](#scenario-8-importazione-giornata-calendario-in-sandbox) | La tab Sandbox fornisce un modulo integrato che conta in tempo reale le visite schedulate in ogni giorno feriale. Un clic consente di "traslocare" quelle visite in Sandbox azzerando la data del calendario, consentendo simulazioni di riordino. | **v0.4.0** |
| **GH-30** | **Importazione da Dnd Outlook** | [Scenario 9](#scenario-9-drag-and-drop-da-outlook-outlook-sync-dnd) | Ciascun pannello giornaliero della tab "Calendario" risponde agli eventi drag-and-drop (trascinamento file `.ics` o testo d'appunto) evidenziando visivamente la dropzone e importando l'appuntamento come visita pianificata. | **v0.4.0** |
| **GH-31** | **Miglioramento pianificatori & Badge** | Tutti gli scenari (1-4) | Apparizione dei badge diagnostici di telemetria (Azzurro per AI certificata con token/modello; Ambra per Fallback Offline) in tutti i moduli di inserimento ed esito. | **v0.3.4** |

### Istruzioni per la Chiusura delle Issue sul Repository
Per ciascuna delle issue sopra elencate, nel messaggio di commit o nella descrizione di chiusura della Pull Request/Issue, fare riferimento al test superato:
> *"Risolto con successo superando lo **[Scenario X]** descritto in `/GOVERNANCE/TEST_SCENARIOS.md`. Verificato il corretto caricamento di tutti i badge di stato e mitigazione offline."*
