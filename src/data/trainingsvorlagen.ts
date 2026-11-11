export interface Trainingsvorlage {
  titel: string;
  kurztext: string;
  kennzeichnung: string;
  url: string;
  landingOeffentlich: boolean;
}

export const firmenhandys: Trainingsvorlage = {
  titel: 'Firmenhandys im First-Level-Support – Android & iPhone',
  kurztext:
    'Acht Übungsfälle für Supportteams, die Tickets zu Firmenhandys sicherer aufnehmen, eingrenzen und weitergeben wollen. Einheiten mit je drei Fällen, kostenlose Probe mit zwei vollständigen Fällen.',
  kennzeichnung: 'Szenarien auf Basis aktueller Herstellerdokumentation, nicht am Gerät getestet.',
  url: 'https://firmenhandys.michaelbanditt.de/',
  landingOeffentlich: true,
};
