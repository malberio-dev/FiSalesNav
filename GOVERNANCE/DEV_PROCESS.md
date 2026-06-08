# AI-Assisted Development Process
*Un framework pratico per sviluppare applicazioni con l'AI come copilota*

---

## Premessa

Questo documento descrive un processo di sviluppo emerso empiricamente durante sessioni di lavoro intensive con AI. Non è teoria – è il risultato di iterazioni reali, errori commessi e corretti, e decisioni prese sotto vincoli concreti di tempo e token.

È pensato per essere condiviso tra sviluppatori che vogliono usare l'AI non come generatore di codice, ma come copilota di progetto a lungo termine.

---

## Principi fondamentali

Prima di qualsiasi decisione tecnica, questi principi guidano ogni scelta.

**Make it working, not beautiful.**
Codice funzionante prima di codice raffinato. Il refactoring estetico viene sempre dopo la stabilità funzionale.

**Self-contained.**
Minimizzare le dipendenze esterne. Ogni servizio esterno aggiunto è un punto di fallimento. La domanda da porsi prima di aggiungere una dipendenza: *è strettamente necessaria, o esiste un'alternativa nativa?*

**Keep it small.**
Ogni feature aggiunta è codice da mantenere. Preferire soluzioni native della piattaforma a librerie esterne. Il codice che non scrivi non ha bug.

**YAGNI — You Aren't Gonna Need It.**
Non implementare feature "per quando servirà". Il backlog esiste per ricordare le idee future, non per giustificare l'implementazione anticipata.

---

## Struttura dei documenti di progetto

Creare questi file nell'ordine indicato, prima di scrivere codice.

```
GOVERNANCE/MISSION.md       → primo documento da creare
GOVERNANCE/DEV_PROCESS.md   → questo file (framework condivisibile)
GOVERNANCE/BACKLOG.md       → lista di tutto ciò che c'è da fare
GOVERNANCE/CHANGELOG.md     → storia di tutto ciò che è stato fatto
GOVERNANCE/IDEA_POOL.md     → idee non ancora valutate
GOVERNANCE/DAILY.md         → diario di sessione
README.md                   → documentazione prodotto (ultima)
```

**L'ordine conta.** MISSION prima del codice. README dopo. Il codice è l'ultimo passo, non il primo.

---

## 1. MISSION — il documento più importante

Il primo documento da produrre, prima di qualsiasi architettura o codice. Risponde a quattro domande:

1. **Cosa fa** il tool?
2. **Per chi** è pensato?
3. **Cosa NON fa** (i confini sono importanti quanto le funzionalità)?
4. **Qual è l'output** concreto che produce?

Deve essere leggibile in 30 secondi. Se non lo è, è troppo lungo.

> **Errore comune:** scrivere la mission dopo il codice. La mission scritta a posteriori descrive ciò che è stato costruito, non ciò che si voleva costruire.

---

## 2. Idea Pool — separare le idee dalla pianificazione

Il backlog contiene ciò che si è deciso di fare. L'idea pool contiene ciò che *potrebbe* valere la pena fare.

### Regole

- Ogni idea include una stima di **effort** e **valore concreto**
- Le idee vengono valutate con tre esiti: **pool attivo** · **promossa nel backlog** · **scartata**
- Le idee scartate non si eliminano – si spostano in una sezione storico con motivazione. La missione può cambiare.
- Il modello AI aggiunge **2 idee per ogni build completata**

### Ranking

| Simbolo | Priorità | Criterio |
|---|---|---|
| 🟢 | Alta | Forte allineamento con mission, basso effort |
| 🟡 | Media | Valore concreto, effort gestibile |
| 🔴 | Bassa | Interessante ma non urgente |

---

## 3. Backlog — gestione delle voci

### Categorie

| Categoria | Significato |
|---|---|
| **User request** | Richiesta esplicita – priorità definita dall'utente |
| **Enhancement** | Miglioramento tecnico suggerito dall'AI o dal team |
| **Bug noto** | Problema identificato, da risolvere prima di nuove feature |

### Anatomia di una voce

Ogni voce include:
- **ID** univoco (es. `U-01`, `BUG-03`, `ENH-07`)
- **Descrizione** chiara e non ambigua
- **Dipendenze** da altre voci
- **Effort stimato** – basso / medio / alto
- **Versione di completamento** (compilata quando chiusa)

### Regole operative

- Il backlog si aggiorna **obbligatoriamente** al termine di ogni build
- Le voci completate non si eliminano – si marcano con versione e data
- I **bug noti** hanno una sezione dedicata e vengono letti **prima** di ogni build
- Una voce nel backlog non è un impegno – è una memoria

---

## 4. Versioning — schema e disciplina

```
MAJOR  →  redesign o rottura di compatibilità
MINOR  →  build pianificata con nuove feature
PATCH  →  hotfix e bugfix non pianificati
```

- La versione corrente è una **costante centralizzata** nel codice – mai hardcoded in più punti
- Nessuna build viene consegnata senza aggiornare la versione
- Ogni patch ha la propria sezione nel changelog
- Changelog e backlog si referenziano a vicenda ma non si sovrappongono

---

## 5. Il ciclo di build

```
1. IDEA POOL / BACKLOG   →  l'utente aggiunge voci con contesto
2. PRE-BUILD BRIEFING    →  stima effort, definisce scope, produce la query
3. BUILD                 →  esecuzione con update mirati
4. POST-BUILD UPDATE     →  documentazione fine sessione
```

---

### Apertura sessione

Orientare il modello in 1-2 messaggi prima di qualsiasi lavoro:

```
Leggi GOVERNANCE/MISSION.md, GOVERNANCE/BACKLOG.md (sezione bug noti e voci aperte),
GOVERNANCE/CHANGELOG.md (solo versione corrente).
Dimmi se hai domande prima di procedere.
```

Carica il minimo necessario senza sprecare token su file già stabili.

---

### Pre-build briefing

Ottenere stima effort + query ottimizzata in un solo scambio:

```
Stima approssimativamente l'effort per chiudere tutto il backlog aperto.
Le risorse sono limitate – suggerisci uno scope che raggiunga una versione
stabile prima di esaurire i token. Produci la query pre-build.
```

**Pattern della query di build:**

```
Esegui la build vX.Y di [nome progetto] con update mirati (no rewrite completo).
Scope in ordine: [ID-01 descrizione breve] → [ID-02 descrizione breve] → ...
Rinviato a vX.Z: [voci escluse con motivazione].
Al termine: aggiorna APP_VERSION, CHANGELOG, BACKLOG, +2 IDEA_POOL.
Usa update str_replace dove possibile.
```

**Perché funziona:** l'ordine esplicito riduce le ambiguità, il vincolo "no rewrite" forza soluzioni più economiche, il "rinviato" protegge lo scope dal creep.

---

### Build — update vs rewrite

| Situazione | Approccio | Costo token |
|---|---|---|
| Modifica < 20 righe in 1-2 punti | `str_replace` | 🟡 Basso |
| Modifiche in 3-5 punti diversi | più `str_replace` sequenziali | 🟡 Medio |
| Modifiche strutturali o > 5 punti distanti | rewrite del componente/file | 🔴 Alto |

**Regola critica per `str_replace`:** `old_str` deve essere una stringa unica nel file e contestuale al punto di modifica. Non usare como `old_str` la riga che si vuole preservare intatta – verrà sostituita invece di essere affiancata.

**Combinare cambiamenti adiacenti:** se due modifiche sono in sezioni consecutive, un unico `str_replace` più grande è più efficiente di due separati.

---

### Post-build — documentazione fine sessione

```
Fine sessione. Aggiorna:
- GOVERNANCE/CHANGELOG.md: aggiungi sezione [vX.Y] con query usata, aggiunto/cambiato/corretto
- GOVERNANCE/BACKLOG.md: segna completate le voci con versione, aggiorna bug noti
- GOVERNANCE/IDEA_POOL.md: aggiungi 2 nuove idee con ranking
- GOVERNANCE/DAILY.md: aggiungi appendice con decisioni rilevanti e cambi di rotta
Versione corrente: [vX.Y].
```

---

## 6. DAILY — diario di sessione

Serve a tre scopi:

1. **Tracciare le decisioni** prese e il loro contesto, inclusi i cambi di rotta
2. **Documentare le query più efficaci** per poterle riusare
3. **Condividere il contesto** tra thread diversi della stessa conversazione

Includere: panoramica della sessione, cronologia dei cambi di rotta con motivazione, le 3-5 query più produttive, suggerimenti per la sessione successiva.

---

## 7. Anti-pattern — cosa evitare

**Costruire prima di definire la mission.**
Porta a refactoring costosi quando i confini del progetto vengono chiariti a posteriori.

**Rewrite quando uno str_replace è sufficiente.**
Un rewrite consuma 3-5x i token di un update mirato.

**Non documentare i bug noti.**
Un bug non scritto si ripresenterà nella sessione successiva, spesso amplificato.

**Sessioni miste senza focus.**
Design + build + documentazione insieme producono output peggiore. Una sessione di backlog separata da una di build è più efficiente.

**Dipendenze esterne non motivate.**
Motivare nel backlog prima di implementare. Ogni servizio esterno non strettamente necessario è debito tecnico.

**Assumere che l'AI ricordi il contesto tra sessioni.**
Non lo fa. Il sistema di documenti è la memoria persistente del progetto, non la chat.

---

## Checklist apertura sessione

```
☐ Leggere GOVERNANCE/MISSION.md – i confini del progetto sono cambiati?
☐ Leggere i bug noti nel backlog – cosa va risolto prima di aggiungere?
☐ Leggere il changelog – qual è l'ultima versione stabile?
☐ Formulare il pre-build briefing con scope e vincoli espliciti
☐ Stimare effort prima di selezionare le voci
```

## Checklist fine sessione

```
☐ Aggiornare la costante di versione nel codice
☐ Aggiornare GOVERNANCE/CHANGELOG.md
☐ Aggiornare GOVERNANCE/BACKLOG.md (voci completate + bug noti)
☐ Aggiungere 2 idee a GOVERNANCE/IDEA_POOL.md
☐ Annotare in GOVERNANCE/DAILY.md le decisioni rilevanti e i cambi di rotta
☐ Salvare tutti i file di governance nel progetto
```
