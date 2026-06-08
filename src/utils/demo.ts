import { SalesVisit } from "../types";

const MILAN_EMILIA_CLIENTS = [
  { name: "Sidel Packaging", address: "Via Spezia 54, Parma (PR)", sector: "Packaging", size: "Grande (~600 dip)", contact: "Ing. Lorenzo Bianchi (Resp. R&D)" },
  { name: "Sacmi Group", address: "Via Selice Provinciale 17, Imola (BO)", sector: "Ceramica & Automazione", size: "Grande (~2000 dip)", contact: "Dr. Stefano Grandi (Resp. Acquisti)" },
  { name: "Marchesini Group", address: "Via Nazionale 34, Pianoro (BO)", sector: "Macchine Astucciatrici", size: "Grande (~1100 dip)", contact: "Gianluca Ferrari (Automazione)" },
  { name: "Coesia SpA", address: "Via Battindarno 91, Bologna (BO)", sector: "Sistemi Packaging", size: "Grande (~5000 dip)", contact: "Mauro Rambaldi (Senior Buyer)" },
  { name: "Tetra Pak", address: "Via Delfini 1, Modena (MO)", sector: "Food Processing", size: "Grande (~800 dip)", contact: "Ing. Chiara Gatti (Tech Coordinator)" },
  { name: "IMA Group", address: "Via Emilia 428, Ozzano dell'Emilia (BO)", sector: "Farma & Alimentare", size: "Grande (~1800 dip)", contact: "Roberto Mattei (Lead Engineer)" },
  { name: "Pelliconi SpA", address: "Via Tasso 12, Ozzano dell'Emilia (BO)", sector: "Tappi & Chiusure", size: "PMI (~350 dip)", contact: "Fabrizio Neri (Resp. Manutenzione)" },
  { name: "Chiesi Farmaceutici", address: "Via San Leonardo 96, Parma (PR)", sector: "Farmaceutico", size: "Grande (~1500 dip)", contact: "Dott.ssa Valeria Marchesi (Cleanroom Head)" },
  { name: "Dallara Automobili", address: "Via J.Dallara 1, Varano de' Melegari (PR)", sector: "Automotive/Carbon-fiber", size: "Media (~450 dip)", contact: "Ing. Paolo Rossini (Staging Coordinator)" },
  { name: "Barilla G. e R. Fratelli", address: "Via Mantova 166, Parma (PR)", sector: "Industria Alimentare", size: "Grande (~3000 dip)", contact: "Marco Moretti (Procedures Supervisor)" },
  { name: "System Logistics", address: "Via G. di Vittorio 21, Fiorano Modenese (MO)", sector: "Magazzini Automatici", size: "Media (~300 dip)", contact: "Enrico Franchini (Software Automation)" },
  { name: "System Ceramics", address: "Via Ghiarola Nuova 29, Fiorano Modenese (MO)", sector: "Stampa Digitale Piastrelle", size: "Grande (~900 dip)", contact: "Ing. Andrea Castelli (Sensori Termici)" },
  { name: "Giti SpA", address: "Viale Umbria 15, Rho (MI)", sector: "Automazione Elettrosaldati", size: "PMI (~120 dip)", contact: "Luigi Sironi (Progettazione Quadri)" },
  { name: "Goglio SpA", address: "Via dell'Ingegneria 10, Daverio (VA)", sector: "Impianti Confezionamento", size: "Media (~400 dip)", contact: "Silvio Cattaneo (Sistemi Pneumatici)" },
  { name: "SMC Italia", address: "Via Garibaldi 122, Carugate (MI)", sector: "Componentistica", size: "Grande (~550 dip)", contact: "Sig. Davide Brambilla (Technical Assist)" },
  { name: "Heidelberg Materials", address: "Via Stezzano 87, Bergamo (BG)", sector: "Cemento & Calcestruzzo", size: "Grande (~700 dip)", contact: "Franco Colleoni (Capo Impianti)" },
  { name: "Same Deutz-Fahr", address: "Viale Francesco Cassani 14, Treviglio (BG)", sector: "Trattori & Macchine Agricole", size: "Grande (~1400 dip)", contact: "Ingegner Matteo Bonomi (R&D Assemblaggio)" },
  { name: "Sices Group", address: "Via d'Adda 10, Lonate Ceppino (VA)", sector: "Quadristica Industriale", size: "PMI (~150 dip)", contact: "Alberto Galli (Production Specialist)" },
  { name: "Pietro Carnaghi", address: "Via Salvo d'Acquisto 7, Villa Cortese (MI)", sector: "Macchine Utensili/Torni", size: "Media (~280 dip)", contact: "Lucio Nebuloni (Cabin Wiring Manager)" },
  { name: "Mussi SpA", address: "Viale Stelvio 22, Busto Arsizio (VA)", sector: "Tessile e tintorie automatiche", size: "PMI (~85 dip)", contact: "Domenico Mussi (Titolare)" },
  { name: "Cosberg SpA", address: "Via Cascina Belvignate 18, Terno d'Isola (BG)", sector: "Sistemi di Assemblaggio", size: "PMI (~95 dip)", contact: "Ing. Vittorio Viscardi (Laser & Opto)" },
  { name: "Breton SpA", address: "Via Garibaldi 27, Castello di Godego (TV)", sector: "Lavorazione Pietra/Metalli", size: "Grande (~900 dip)", contact: "Dr. Roberto Pavan (Divisione Sensori)" },
  { name: "Fedegari Autoclavi", address: "Statale di Voghera 3, Albuzzano (PV)", sector: "Sterilizzazione & Farma", size: "Media (~450 dip)", contact: "Ing. Alessandro Fedegari (CEO / CTO)" },
  { name: "Cavanna Packaging", address: "Via Matteotti 104, Prato Sesia (NO)", sector: "Wrapping Macchine", size: "Media (~260 dip)", contact: "Piero Cavanna (Responsabile Innovazione)" },
  { name: "TenarisDalmine", address: "Piazza Caduti del Lavoro 1, Dalmine (BG)", sector: "Acciaieria e Tubi", size: "Grande (~2200 dip)", contact: "Geometra Osvaldo Gualandris (Manutentore)" },
];

const PRE_VISIT_NOTES_TEMPLATES = [
  "Incontro per discutere la migrazione ai nuovi sensori induttivi con interfaccia IO-Link V1.1. Verificare ostacoli tecnici.",
  "Cliente interessato alle barriere a sicurezza intrinseca per zona ATEX 1/21. Portare catalogo barriere di sicurezza industriali.",
  "Sollecitare feedback sull'offerta per i lettori di codici a barre 2D serie ODT. Proporre prova tecnica sul campo.",
  "Nuovo progetto per magazzini automatici a temperatura controllata. Proporre sensori fotoelettrici serie R100/R200.",
  "Visita conoscitiva con il nuovo responsabile acquisti. Consolidare posizionamento rispetto ai concorrenti storici.",
  "Presentazione delle teste di lettura RFID UHF flessibili per tracciabilità pallet lungo la linea di montaggio.",
];

const TIMES = ["09:00", "10:30", "14:00", "15:30", "17:00"];

export function generateDemoVisits(weekKey: string, weekDates: string[]): SalesVisit[] {
  const result: SalesVisit[] = [];
  let visitIdCounter = 1001;

  // Let's build exactly 30 visits
  // Dates are distributed evenly over the weekDates.
  // We have 5 days, so 6 visits per day.
  // Exception to satisfy Issue #7: some visits will be created as "Sandbox" drafts (empty date)
  for (let visitIndex = 0; visitIndex < 30; visitIndex++) {
    const dayIndex = visitIndex % weekDates.length;
    // Every 6th visit is a Sandbox draft (no date/time pre-filled)
    const isSandbox = visitIndex % 6 === 5;
    const targetDate = isSandbox ? "" : weekDates[dayIndex];
    
    // Pick unique clients modulo 25
    const client = MILAN_EMILIA_CLIENTS[visitIndex % MILAN_EMILIA_CLIENTS.length];
    
    // Pick an orario based on visit sequence within the day
    const timeIndex = Math.floor(visitIndex / weekDates.length) % TIMES.length;
    let orario = isSandbox ? "" : TIMES[timeIndex];
    
    // If it's the 6th visit of the day, offset slightly to look realistic
    if (!isSandbox && Math.floor(visitIndex / weekDates.length) === 5) {
      orario = "18:00";
    }

    const notePreVisita = PRE_VISIT_NOTES_TEMPLATES[visitIndex % PRE_VISIT_NOTES_TEMPLATES.length];

    result.push({
      id: `demo_${visitIdCounter++}`,
      azienda: `${client.name} demo`,
      indirizzo: client.address,
      data: targetDate,
      orario: orario,
      notePreVisita: notePreVisita,
      quickNote: "",
      esito: "",
      prodotti: "",
      offerta: "",
      nextStep: "",
      report: "",
      isDemo: true,
    });
  }

  // Sort them sequentially: scheduled visits by date then time, and sandbox draft visits at the end
  return result.sort((a, b) => {
    if (!a.data && b.data) return 1;
    if (a.data && !b.data) return -1;
    if (!a.data && !b.data) return a.azienda.localeCompare(b.azienda);
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    return a.orario.localeCompare(b.orario);
  });
}
