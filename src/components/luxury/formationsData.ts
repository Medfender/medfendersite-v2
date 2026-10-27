export interface Formation {
  number: string;
  title: string;
  subtitle: string;
  instrumentation: string;
  body: string;
  slug: string;
  imageSrc: string;
  imageAlt: string;
}

export const formations: Formation[] = [
  {
    number: "01",
    title: "Formation Trio",
    subtitle: "Lounge · jazz · cocktails · soirées variées",
    instrumentation: "Piano, Guitare, Chanteur/Chanteuse",
    body:
      "Idéale pour des animations lounge, jazz, cocktails, ou des soirées variées internationales instrumentales ou vocales. La guitare, en duo avec le piano et la voix, apporte une touche mélodique et raffinée à vos événements.",
    slug: "formation-trio",
    imageSrc: "/images/site/formations/01-trio-lounge.jpg",
    imageAlt: "Piano, guitar, and vocal trio performing in intimate jazz lounge",
  },
  {
    number: "02",
    title: "Formation Quartet",
    subtitle: "Anniversaires · cocktails · répertoire varié",
    instrumentation: "Piano, Guitare, Chanteur/Chanteuse, Percussionniste",
    body:
      "Cette formule allégée ajoute une profondeur rythmique pour un répertoire varié. Souvent sollicitée pour des anniversaires et cocktails. Nous pouvons également travailler à partir d'une playlist personnalisée reçue 48 heures avant l'événement.",
    slug: "formation-quartet",
    imageSrc: "/images/site/formations/02-quartet-percussion.jpg",
    imageAlt: "Quartet with piano, guitar, vocals, and percussion on stage",
  },
  {
    number: "03",
    title: "Formation Quintet",
    subtitle: "Événements énergiques · festifs",
    instrumentation: "Piano, Guitare, Chanteur/Chanteuse, Bassiste, Batteur",
    body:
      "Cette formation enrichit l'ensemble avec l'ajout d'un batteur et d'un bassiste, créant une dynamique parfaite pour des événements plus énergiques et festifs. Le guitariste, pianiste et chanteurs restent au cœur de la prestation.",
    slug: "formation-quintet",
    imageSrc: "/images/site/formations/03-quintet-fullband.jpg",
    imageAlt: "Full rhythm section quintet with piano, guitar, bass, drums, and vocals",
  },
  {
    number: "04",
    title: "Formation Sextet",
    subtitle: "Grands événements · célébrations de fin d'année",
    instrumentation: "Piano, Guitare, Bassiste, Batteur, Chanteur et Chanteuse",
    body:
      "Notre formation la plus complète de base, recommandée pour les grands événements tels que les célébrations de fin d'année. Avec deux chanteurs et une section rythmique complète, cette configuration offre une performance riche et diversifiée.",
    slug: "formation-sextet",
    imageSrc: "/images/site/formations/04-sextet-gala.jpg",
    imageAlt: "Sextet with dual vocalists and full rhythm section at gala event",
  },
  {
    number: "05",
    title: "Grand Ensemble",
    subtitle: "Grands événements · scènes amples · cérémonies",
    instrumentation: "Jusqu'à 15 musiciens — section Gnaoua & section cuivres",
    body:
      "Pour les grands événements, possibilité de monter jusqu'à 15 musiciens sur scène, avec une section Gnaoua et une section cuivres complètes, pour une performance ample et festive.",
    slug: "grand-ensemble",
    imageSrc: "/images/site/formations/05-grand-ensemble-stage.jpg",
    imageAlt: "Grand ensemble of 15 musicians with brass and Gnaoua sections on large stage",
  },
];
