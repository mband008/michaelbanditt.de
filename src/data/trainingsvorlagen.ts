export interface Trainingsvorlage {
  titel: string;
  kurztext: string;
  kennzeichnung: string;
  url: string;
  landingOeffentlich: boolean;
  ereignis: string;
  bild?: { src: string; alt: string; breite: number; hoehe: number };
}

export const firmenhandys: Trainingsvorlage = {
  titel: 'Firmenhandys im First-Level-Support – Android & iPhone',
  kurztext:
    'Acht Übungsfälle für Supportteams, die Tickets zu Firmenhandys sicherer aufnehmen, eingrenzen und weitergeben wollen. Einheiten mit je drei Fällen, kostenlose Probe mit zwei vollständigen Fällen.',
  kennzeichnung: 'Szenarien auf Basis aktueller Herstellerdokumentation, nicht am Gerät getestet.',
  url: 'https://firmenhandys.michaelbanditt.de/',
  landingOeffentlich: true,
  ereignis: 'trainingsvorlagen-produktseite',
  bild: {
    src: '/images/produktbild-firmenhandys-standard.webp',
    alt: 'Produktbild der Stufe Standard: Deckblatt des Teilnehmerhefts, Fall 1 und die Fallübersicht als Seitenstapel',
    breite: 480,
    hoehe: 480,
  },
};

export const anruferpruefung: Trainingsvorlage = {
  titel: 'Anruferprüfung am Helpdesk – Passwort- und MFA-Zurücksetzung',
  kurztext:
    'Helpdesk-Teams üben im Rollenspiel, Anrufende zu prüfen, bevor sie ein Passwort oder einen zweiten Faktor zurücksetzen.',
  kennzeichnung: 'Szenarien, Personen und Firmen sind erfunden. Keine Sicherheitsberatung und keine Risikoanalyse.',
  url: 'https://anruferpruefung.michaelbanditt.de/',
  landingOeffentlich: true,
  ereignis: 'trainingsvorlagen-anruferpruefung',
  bild: {
    src: '/images/produktbild-anruferpruefung-komplett.webp',
    alt: 'Produktbild der Stufe Komplett: Deckblatt der Anruferkarten, Karte 1 und die Arbeitsplatzkarte als Seitenstapel',
    breite: 480,
    hoehe: 480,
  },
};

export const trainingsvorlagen: Trainingsvorlage[] = [firmenhandys, anruferpruefung];
