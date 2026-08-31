import { departmentData } from './departments.js'

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80',
]

const PORTRAIT_POOL = [
  'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1564541558234-ef406c118d0c?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1655313893399-e9d607e1d84c?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1595743826997-87eb67a31872?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1596604820148-da737958af16?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1748180799911-05ff4dba03ea?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1530785602389-07594beb8b73?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1593351799227-75df2026356b?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1647316897340-6b6de5597c0f?auto=format&fit=crop&w=200&q=80',
]

// Curated (hand-written) families don't carry an explicit ethnicGroup field,
// so we map them here to reuse the same enrichment pools as generated ones.
const CURATED_ETHNIC_GROUP = {
  "houedji": "Fon",
  "dossou-yovo": "Fon",
  "kombetto": "Somba",
  "aihounhin": "Adja",
  "sabi-kolo": "Bariba",
  "codjia": "Fon",
}

const ethnicGroupExtras = {
  "Fon": {
    language: "Fon",
    traditions: "Cultes vodoun, tissage et musique traditionnelle",
    firstNames: [
      "Ahanhanzo", "Hounsou", "Agbodjè", "Mathieu", "Victoire", "Jean", "Marie", "Sènan", "Akouavi", "Coovi",
      "Dègbévi", "Djifa", "Gbèfon", "Sossou", "Kokou",
    ],
  },
  "Adja": {
    language: "Adja",
    traditions: "Rites agraires et cérémonies liées au fleuve",
    firstNames: [
      "Dansou", "Akoua", "Sédjro", "Voviwè", "Kokouvi", "Aïssia", "Hounnou", "Sohou",
      "Dogbé", "Adannou", "Kouévi", "Amavi", "Dosseh", "Gnansounou", "Sètondji",
    ],
  },
  "Yoruba-Nago": {
    language: "Yoruba / Nago",
    traditions: "Cultes orisha et fêtes communautaires",
    firstNames: [
      "Adekunlé", "Yétondé", "Wassiou", "Ramatou", "Fassilatou", "Séro", "Osseni", "Sanni",
      "Babatoundé", "Adéyemi", "Ganiou", "Rachidatou", "Moufoutaou", "Adisa", "Fadilatou",
    ],
  },
  "Bariba": {
    language: "Bariba",
    traditions: "Tradition équestre et fêtes de la Gaani",
    firstNames: [
      "Séro", "Bio", "Yerima", "Fanta", "Gnima", "Sabi", "Orou", "Wangrin",
      "Sina", "Karimou", "Mamane", "Chabi", "Sounon", "Djibirilou", "Idrissou",
    ],
  },
  "Dendi": {
    language: "Dendi",
    traditions: "Commerce caravanier et hospitalité",
    firstNames: [
      "Boubacar", "Fatima", "Amadou", "Aïcha", "Souley", "Ramata",
      "Hassane", "Zeinabou", "Alassane", "Moumouni", "Aminatou", "Yacouba", "Salamatou", "Boureima", "Rakiatou",
    ],
  },
  "Peul": {
    language: "Peul (Fulfulde)",
    traditions: "Élevage transhumant et poésie orale",
    firstNames: [
      "Amadou", "Aïssatou", "Ibrahim", "Fatoumata", "Saliou", "Djibril",
      "Oumarou", "Hawa", "Abdoulaye", "Kadiatou", "Souleymane", "Ramatoulaye", "Bocar", "Aminata", "Hamidou",
    ],
  },
  "Somba": {
    language: "Ditammari",
    traditions: "Architecture des tata et rites de passage",
    firstNames: [
      "Yentema", "Natta", "Tammari", "Boukpessi", "Sambieni", "Konde",
      "Pitiki", "Tandja", "Kombetto", "Damè", "Kpatakpéto", "Yembila", "N'Tcha", "Kotoko", "Béssa",
    ],
  },
  "Mina": {
    language: "Mina",
    traditions: "Pêche, commerce côtier et cultes du fleuve",
    firstNames: [
      "Kpodar", "Adanhounme", "Kpatinvoh", "Tossou", "Djidonou", "Amoussou",
      "Dogbévi", "Klousseh", "Sena", "Edem", "Ayélé", "Kossivi", "Sètondji", "Améganvi", "Dzidzogbé",
    ],
  },
}

const personalityRoles = [
  "Chef de famille et gardien·ne des traditions",
  "Enseignant·e et promoteur/trice de l'éducation",
  "Artisan·e et musicien·ne",
  "Entrepreneur/euse et membre de l'association familiale",
  "Conteur/euse et dépositaire de la mémoire orale",
  "Agricultrice/eur et gardien·ne du foyer familial",
]

const placeRoles = ["Lieu d'origine", "Installation d'une branche", "Nouvelle génération", "Alliances et liens historiques"]

const professions = [
  "Commerçant·e", "Agriculteur/trice", "Enseignant·e", "Artisan·e", "Tisserand·e",
  "Pêcheur/euse", "Chef de famille", "Musicien·ne", "Guérisseur/euse traditionnel·le",
  "Notable", "Menuisier/ère", "Couturier/ère", "Infirmier/ère", "Conteur/euse",
]

const spouseSurnames = [
  "Kpatcha", "Dossou", "Zinsou", "Agbo", "Adjovi", "Hounsou", "Sacca", "Alapini",
  "Boukari", "Yerima", "Gbaguidi", "Amoussou", "Sohou", "Aïhounhin", "Codjia",
]

const religions = ["Vodun", "Christianisme", "Islam", "Religion traditionnelle"]

const traits = [
  "Respecté·e", "Travailleur/euse", "Visionnaire", "Discret/ète",
  "Généreux/euse", "Courageux/euse", "Rassembleur/euse", "Patient·e",
]

const milestoneTemplates = {
  birth: (place) => `Naissance à ${place}.`,
  school: () => `Entre à l'école.`,
  career: (job, place) => `Débute son activité de ${job.toLowerCase()} à ${place}.`,
  milestone: (name) => `Participe à un moment marquant pour la famille ${name}.`,
  retirement: () => `Se retire, et se consacre à la famille et à la transmission des valeurs.`,
  death: (place) => `Décès à ${place}.`,
}

const archiveCategories = ["Photo", "Lettre", "Acte", "Document", "Objet"]

const DOCUMENT_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1561812938-f6e60cbf95e3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1760307837453-ce60cb209e52?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522442676585-c751dab71864?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584445584400-1a7cc5de77ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1760307837850-13db8b0d94cb?auto=format&fit=crop&w=800&q=80',
]

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return h >>> 0
}

function mulberry32(seed) {
  let state = seed
  return function () {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

export function enrichFamily(family) {
  const ethnicGroup = CURATED_ETHNIC_GROUP[family.slug] ?? family.ethnicGroup ?? "Fon"
  const extras = ethnicGroupExtras[ethnicGroup] ?? ethnicGroupExtras["Fon"]
  const rng = mulberry32(hashString(family.slug))
  const dept = departmentData[family.department]
  const localitySet = new Set(dept?.stories?.map((s) => s[1]) ?? [])
  localitySet.add(family.department)
  const localities = [...localitySet]
  // Some departments only yield one or two distinct localities; cycling
  // through them (rather than padding with placeholders) keeps every
  // localities[i] access below safe without introducing fake place names.
  const localityAt = (i) => localities[i % localities.length]

  const founderYear = 1700 + Math.floor(rng() * 100)
  function personYears(offset) {
    const birth = founderYear + offset + Math.floor(rng() * 10)
    const stillLiving = rng() > 0.8 && offset > 130
    const death = birth + 55 + Math.floor(rng() * 25)
    return stillLiving ? `${birth} - présent` : `${birth} - ${death}`
  }
  function personName() {
    return `${pick(rng, extras.firstNames)} ${family.name}`
  }

  function person(offset, place) {
    return { name: personName(), years: personYears(offset), place, photo: pick(rng, PORTRAIT_POOL) }
  }

  const tree = {
    founder: { name: personName(), years: `${founderYear} - ${founderYear + 60 + Math.floor(rng() * 20)}`, place: localityAt(0), photo: pick(rng, PORTRAIT_POOL) },
    branches: [
      {
        label: "Branche A",
        sublabel: `Lignée de ${localityAt(0)}`,
        children: [
          person(55, localityAt(0)), person(60, localityAt(0)),
          person(95, localityAt(0)), person(100, localityAt(1)),
        ],
      },
      {
        label: "Branche B",
        sublabel: `Lignée de ${localityAt(1)}`,
        children: [
          person(65, localityAt(1)), person(70, localityAt(2)),
          person(105, localityAt(1)), person(110, localityAt(2)),
        ],
      },
    ],
  }

  const archives = Array.from({ length: 5 }, (_, i) => {
    const category = archiveCategories[i % archiveCategories.length]
    const year = 1900 + Math.floor(rng() * 90)
    return {
      category,
      year,
      title: `${category} de la famille ${family.name}`,
      image: category === 'Photo' ? pick(rng, PORTRAIT_POOL) : pick(rng, DOCUMENT_IMAGE_POOL),
    }
  })

  const personalities = Array.from({ length: 4 }, (_, i) => ({
    name: personName(),
    years: personYears(90 + i * 15),
    role: personalityRoles[Math.floor(rng() * personalityRoles.length)],
    photo: pick(rng, PORTRAIT_POOL),
  }))

  const places = localities.slice(0, 4).map((locality, i) => ({
    name: locality,
    role: placeRoles[i % placeRoles.length],
    image: pick(rng, IMAGE_POOL),
  }))

  return {
    language: extras.language,
    traditions: extras.traditions,
    localities,
    firstImplantation: family.timeline?.[0]?.[0] ?? "Origines",
    verified: !family.generated,
    historyPhoto: pick(rng, IMAGE_POOL),
    tree,
    archives,
    personalities,
    places,
  }
}

// Exact, hand-specified reference tree for the Houédji family (used as the
// visual reference case for the tree page). Every other family still gets a
// procedurally generated tree below.
const HOUEDJI_TREE_SPEC = [
  { id: 'h1', parentId: null, generation: 1, branch: 'founder', name: 'Ahahnanzo Houédji', birth: 1840, death: 1915, city: 'Ouidah' },
  { id: 'h2', parentId: 'h1', generation: 2, branch: 'paternal', name: 'Hounsou Houédji', birth: 1865, death: 1942, city: 'Ouidah' },
  { id: 'h3', parentId: 'h1', generation: 2, branch: 'maternal', name: 'Agbodjè Houédji', birth: 1872, death: 1948, city: 'Ouidah' },
  { id: 'h4', parentId: 'h2', generation: 3, branch: 'paternal', name: 'Mathieu Houédji', birth: 1896, death: 1970, city: 'Cotonou' },
  { id: 'h5', parentId: 'h2', generation: 3, branch: 'paternal', name: 'Victoire Houédji', birth: 1900, death: 1975, city: 'Porto-Novo' },
  { id: 'h6', parentId: 'h3', generation: 3, branch: 'maternal', name: 'Jean Houédji', birth: 1902, death: 1981, city: 'Cotonou' },
  { id: 'h7', parentId: 'h3', generation: 3, branch: 'maternal', name: 'Marie Houédji', birth: 1905, death: 1988, city: 'Porto-Novo' },
  { id: 'h8', parentId: 'h4', generation: 4, branch: 'paternal', name: 'Paul Houédji', birth: 1925, death: 1997, city: 'Cotonou' },
  { id: 'h9', parentId: 'h4', generation: 4, branch: 'paternal', name: 'Colette Houédji', birth: 1928, death: 2010, city: 'Cotonou' },
  { id: 'h10', parentId: 'h5', generation: 4, branch: 'paternal', name: 'Antoine Houédji', birth: 1930, death: 2015, city: 'Porto-Novo' },
  { id: 'h11', parentId: 'h5', generation: 4, branch: 'paternal', name: 'Georgette Houédji', birth: 1933, death: 2018, city: 'Porto-Novo' },
  { id: 'h12', parentId: 'h6', generation: 4, branch: 'maternal', name: 'Bernard Houédji', birth: 1936, death: 2002, city: 'Cotonou' },
  { id: 'h13', parentId: 'h6', generation: 4, branch: 'maternal', name: 'Lucie Houédji', birth: 1940, death: 2016, city: 'Cotonou' },
  { id: 'h14', parentId: 'h7', generation: 4, branch: 'maternal', name: 'Michel Houédji', birth: 1943, death: 2020, city: 'Porto-Novo' },
  { id: 'h15', parentId: 'h7', generation: 4, branch: 'maternal', name: 'Dominique Houédji', birth: 1948, death: null, city: 'Porto-Novo' },
]

function buildHouedjiTree(family) {
  const extras = ethnicGroupExtras['Fon']
  const rng = mulberry32(hashString('houedji:exact-tree'))

  function bioFor(p) {
    if (!p.parentId) {
      return `${p.name} est reconnu·e comme l'ancêtre fondateur·rice de la famille Houédji. Originaire de ${p.city}, ${p.death ? 'il/elle a marqué son époque par' : 'il/elle continue de marquer la famille par'} ses valeurs de travail, d'unité et de respect des traditions qui ont façonné les générations suivantes.`
    }
    return `${p.name} est l'un·e des piliers de la famille Houédji. ${p.death ? 'Il/elle a consacré sa vie' : 'Il/elle consacre sa vie'} au travail et à la transmission des valeurs de travail, d'unité et de dignité, et a joué un rôle essentiel dans l'installation de plusieurs membres de la famille à ${p.city}.`
  }

  const byId = Object.fromEntries(HOUEDJI_TREE_SPEC.map((p) => [p.id, p]))
  const members = HOUEDJI_TREE_SPEC.map((p) => {
    const stillLiving = p.death === null
    return {
      id: p.id,
      parentId: p.parentId,
      generation: p.generation,
      branch: p.branch,
      name: p.name,
      alias: `${pick(rng, extras.firstNames)} ${p.name.split(' ')[0]}`,
      sex: rng() > 0.5 ? 'M' : 'F',
      years: stillLiving ? `${p.birth} - présent` : `${p.birth} - ${p.death}`,
      birthYear: p.birth,
      deathYear: p.death,
      birthPlace: p.city,
      deathPlace: stillLiving ? null : p.city,
      place: p.city,
      photo: pick(rng, PORTRAIT_POOL),
      profession: pick(rng, professions),
      religion: pick(rng, religions),
      languages: [extras.language, "Français"],
      spouseInfo: rng() > 0.15 && HOUEDJI_TREE_SPEC.some((c) => c.parentId === p.id)
        ? { name: `${pick(rng, extras.firstNames)} ${pick(rng, spouseSurnames)}`, years: `${p.birth - 3} - ${stillLiving ? 'présent' : p.death - 5}`, photo: pick(rng, PORTRAIT_POOL) }
        : null,
      childrenCount: HOUEDJI_TREE_SPEC.filter((c) => c.parentId === p.id).length,
      bio: bioFor(p),
      traits: [pick(rng, traits), pick(rng, traits), pick(rng, traits)],
      milestones: [
        { year: p.birth, icon: 'gift', text: milestoneTemplates.birth(p.city) },
        { year: p.birth + 19, icon: 'file', text: milestoneTemplates.school() },
        { year: p.birth + 24, icon: 'star', text: milestoneTemplates.career(pick(rng, professions), p.city) },
        ...(p.parentId ? [] : [{ year: p.birth + 45, icon: 'building', text: `Devient la référence de la famille Houédji.` }]),
        ...(p.death ? [
          { year: p.death - 10, icon: 'clock', text: milestoneTemplates.retirement() },
          { year: p.death, icon: 'users', text: milestoneTemplates.death(p.city) },
        ] : []),
      ],
    }
  })

  const hounsou = members.find((m) => m.id === 'h2')
  if (hounsou) {
    hounsou.sex = 'M'
    hounsou.spouseInfo = { name: 'Ahouandjino Victoire', years: '1868 - 1945', photo: pick(rng, PORTRAIT_POOL) }
  }

  const mathieu = members.find((m) => m.id === 'h4')
  if (mathieu) {
    mathieu.alias = 'Tchayé Mathieu'
    mathieu.profession = 'Instituteur'
    mathieu.languages = ['Fon', 'Français']
    mathieu.religion = 'Vodun'
    mathieu.traits = ['Respecté', 'Travailleur', 'Visionnaire']
    mathieu.bio = "Mathieu est l'un des piliers de la famille Houédji. Instituteur respecté, il a consacré sa vie à l'éducation des jeunes et à la transmission des valeurs de travail, d'unité et de dignité. Il a joué un rôle essentiel dans l'installation de plusieurs membres de la famille à Cotonou."
    mathieu.photo = 'https://images.unsplash.com/photo-1564541558234-ef406c118d0c?auto=format&fit=crop&w=400&q=80'
    mathieu.birthDateFull = '15 juin 1896'
    mathieu.deathDateFull = '10 février 1970'
    mathieu.birthPlaceFull = 'Cotonou, Littoral'
    mathieu.spouseInfo = { name: 'Victoire Houédji', years: '1900 - 1975', photo: pick(rng, PORTRAIT_POOL) }
    mathieu.milestones = [
      { year: 1896, icon: 'gift', text: 'Naissance à Cotonou.' },
      { year: 1915, icon: 'file', text: "Entre à l'école normale d'instituteurs." },
      { year: 1920, icon: 'star', text: "Débute sa carrière d'instituteur à Ouidah." },
      { year: 1945, icon: 'building', text: "Participe à la création d'une école à Cotonou." },
      { year: 1960, icon: 'clock', text: 'Prend sa retraite après une longue carrière.' },
      { year: 1970, icon: 'users', text: 'Décès à Cotonou, le 10 février.' },
    ]
    mathieu.familyLinksOverride = {
      children: [
        { name: 'Jean Houédji', years: '1920 - 1981', photo: pick(rng, PORTRAIT_POOL) },
        { name: 'Marie Houédji', years: '1924 - 1988', photo: pick(rng, PORTRAIT_POOL) },
        { name: 'Paul Houédji', years: '1927 - 1992', photo: pick(rng, PORTRAIT_POOL) },
        { name: 'Colette Houédji', years: '1930 - 2010', photo: pick(rng, PORTRAIT_POOL) },
      ],
    }
  }

  return members
}

// Builds the full, detailed 4-generation tree used by the private "Ma
// famille" tree page: 1 founder, 2 children, 4 grandchildren, 8
// great-grandchildren (15 people), each with biographical detail for the
// side panel. Deterministic per family slug, distinct from the lighter
// 7-person tree used on the public family page.
export function buildFamilyTree(family) {
  if (family.slug === 'houedji') return buildHouedjiTree(family)
  const ethnicGroup = CURATED_ETHNIC_GROUP[family.slug] ?? family.ethnicGroup ?? "Fon"
  const extras = ethnicGroupExtras[ethnicGroup] ?? ethnicGroupExtras["Fon"]
  const rng = mulberry32(hashString(`${family.slug}:full-tree`))
  const dept = departmentData[family.department]
  const localitySet = new Set(dept?.stories?.map((s) => s[1]) ?? [])
  localitySet.add(family.department)
  const localities = [...localitySet]
  const localityAt = (i) => localities[i % localities.length]

  const founderYear = 1700 + Math.floor(rng() * 80)

  const usedFirstNames = new Set()
  function personName() {
    let first = pick(rng, extras.firstNames)
    let tries = 0
    while (usedFirstNames.has(first) && tries < 40) {
      first = pick(rng, extras.firstNames)
      tries += 1
    }
    usedFirstNames.add(first)
    return `${first} ${family.name}`
  }

  const usedPortraits = new Set()
  function pickPortrait() {
    let photo = pick(rng, PORTRAIT_POOL)
    let tries = 0
    while (usedPortraits.has(photo) && tries < 40) {
      photo = pick(rng, PORTRAIT_POOL)
      tries += 1
    }
    usedPortraits.add(photo)
    return photo
  }
  function bioFor(name, isFounder, birth, death) {
    if (isFounder) {
      return `${name} est reconnu·e comme l'ancêtre fondateur·rice de la famille ${family.name}. Originaire de ${localityAt(0)}, ${death ? 'il/elle a marqué son époque par' : 'il/elle continue de marquer la famille par'} ses valeurs de travail, d'unité et de respect des traditions qui ont façonné les générations suivantes.`
    }
    return `${name} est l'un·e des piliers de la famille ${family.name}. ${death ? 'Il/elle a consacré sa vie' : 'Il/elle consacre sa vie'} au travail et à la transmission des valeurs de travail, d'unité et de dignité, et a joué un rôle essentiel dans l'installation de plusieurs membres de la famille à ${localityAt(0)}.`
  }
  function makeSpouseInfo(birth, death) {
    const sBirth = birth - 4 + Math.floor(rng() * 8)
    const sDeath = death ? sBirth + 55 + Math.floor(rng() * 20) : null
    return {
      name: `${pick(rng, extras.firstNames)} ${pick(rng, spouseSurnames)}`,
      years: sDeath ? `${sBirth} - ${sDeath}` : `${sBirth} - présent`,
      photo: pickPortrait(),
    }
  }
  function milestonesFor(name, birth, death, birthPlace, deathPlace, profession, isFounder) {
    const list = [
      { year: birth, icon: 'gift', text: milestoneTemplates.birth(birthPlace) },
      { year: birth + 19, icon: 'file', text: milestoneTemplates.school() },
      { year: birth + 24, icon: 'star', text: milestoneTemplates.career(profession, birthPlace) },
    ]
    if (isFounder) {
      list.push({ year: birth + 45, icon: 'building', text: `Devient la référence de la famille ${name.split(' ').slice(1).join(' ')}.` })
    } else {
      list.push({ year: birth + 49, icon: 'building', text: milestoneTemplates.milestone(name.split(' ').slice(1).join(' ')) })
    }
    if (death) {
      list.push({ year: death - 10, icon: 'clock', text: milestoneTemplates.retirement() })
      list.push({ year: death, icon: 'users', text: milestoneTemplates.death(deathPlace) })
    }
    return list
  }

  let counter = 0
  function makePerson({ parentId, generation, offset, branch, hasChildren }) {
    counter += 1
    const birth = founderYear + offset + Math.floor(rng() * 8)
    const stillLiving = rng() > 0.72 && offset > 170
    const death = stillLiving ? null : birth + 55 + Math.floor(rng() * 25)
    const name = personName()
    const incomplete = !parentId ? false : rng() < 0.12
    const birthPlace = localityAt(counter % localities.length)
    const deathPlace = death ? localityAt((counter + 1) % localities.length) : null
    const profession = pick(rng, professions)
    const sex = rng() > 0.5 ? 'M' : 'F'
    return {
      id: `m${counter}`,
      parentId,
      generation,
      branch: !parentId ? 'founder' : (incomplete ? 'incomplete' : branch),
      name,
      alias: `${pick(rng, extras.firstNames)} ${name.split(' ')[0]}`,
      sex,
      years: death ? `${birth} - ${death}` : `${birth} - présent`,
      birthYear: birth,
      deathYear: death,
      birthPlace,
      deathPlace,
      place: birthPlace,
      photo: pickPortrait(),
      profession,
      religion: pick(rng, religions),
      languages: [extras.language, "Français"],
      spouseInfo: hasChildren && rng() > 0.15 ? makeSpouseInfo(birth, death) : null,
      childrenCount: 0,
      bio: bioFor(name, !parentId, birth, death),
      traits: [pick(rng, traits), pick(rng, traits), pick(rng, traits)],
      milestones: milestonesFor(name, birth, death, birthPlace, deathPlace, profession, !parentId),
    }
  }

  const founder = makePerson({ parentId: null, generation: 1, offset: 0, hasChildren: true })
  const members = [founder]

  const gen2 = ['paternal', 'maternal'].map((branch, i) =>
    makePerson({ parentId: founder.id, generation: 2, offset: 55 + i * 10, branch, hasChildren: true })
  )
  members.push(...gen2)

  const gen3 = gen2.flatMap((parent) =>
    [0, 1].map((i) => makePerson({ parentId: parent.id, generation: 3, offset: 95 + i * 5, branch: parent.branch, hasChildren: true }))
  )
  members.push(...gen3)

  const gen4 = gen3.flatMap((parent) =>
    [0, 1].map((i) => makePerson({ parentId: parent.id, generation: 4, offset: 140 + i * 5, branch: parent.branch, hasChildren: false }))
  )
  members.push(...gen4)

  for (const m of members) {
    m.childrenCount = members.filter((c) => c.parentId === m.id).length
  }

  return members
}

export const STORY_THEMES = [
  { id: 'traditions', label: 'Traditions & coutumes', icon: 'shield' },
  { id: 'quotidien', label: 'Vie quotidienne', icon: 'home' },
  { id: 'transmission', label: 'Transmission des valeurs', icon: 'users' },
  { id: 'voyages', label: 'Voyages & migrations', icon: 'sail' },
  { id: 'evenements', label: 'Événements marquants', icon: 'calendar' },
]

const STORY_IMAGE_POOL = [...IMAGE_POOL]

function findMember(members, name) {
  return members.find((m) => m.name === name) ?? members[0]
}

function houedjiStoriesFeed(members) {
  const mathieu = findMember(members, 'Mathieu Houédji')
  const marie = findMember(members, 'Marie Houédji')
  const jean = findMember(members, 'Jean Houédji')
  const paul = findMember(members, 'Paul Houédji')
  const victoire = findMember(members, 'Victoire Houédji')
  const antoine = findMember(members, 'Antoine Houédji')

  const raw = [
    { type: 'Histoire', theme: 'voyages', title: 'Le départ de nos ancêtres de Ouidah', excerpt: "Le récit du grand-père Mathieu Houédji sur les raisons qui ont poussé notre famille à quitter Ouidah au début du XXe siècle.", author: mathieu, date: '2023-05-15', readTime: '12 min', comments: 8, image: STORY_IMAGE_POOL[0], featured: true },
    { type: 'Anecdote', theme: 'transmission', title: 'Quand Maman Victoire cachait nos cahiers', excerpt: "Une anecdote transmise avec tendresse, qui continue de faire sourire toute la famille.", author: marie, date: '2024-04-02', readTime: '4 min', comments: 3, image: victoire.photo },
    { type: 'Récit oral', theme: 'quotidien', title: 'Les souvenirs de Tonton Jean sur la maison familiale', excerpt: "Un enregistrement précieux où Jean raconte, avec ses propres mots, les souvenirs qui ont marqué la famille.", author: jean, date: '2024-02-10', readTime: '9 min', comments: 5, image: STORY_IMAGE_POOL[1], media: 'video' },
    { type: 'Histoire', theme: 'evenements', title: "La création de l'école Houédji à Cotonou", excerpt: "Comment Mathieu Houédji a participé à la fondation d'une école qui a marqué plusieurs générations.", author: paul, date: '2023-11-22', readTime: '10 min', comments: 4, image: STORY_IMAGE_POOL[2] },
    { type: 'Histoire', theme: 'quotidien', title: 'La vie quotidienne à Ouidah dans les années 1950', excerpt: "Un témoignage précieux sur la vie de tous les jours, les traditions et les valeurs transmises.", author: victoire, date: '2024-01-08', readTime: '10 min', comments: 5, image: STORY_IMAGE_POOL[3] },
    { type: 'Anecdote', theme: 'evenements', title: 'Le jour où grand-père a sauvé le village', excerpt: "Une anecdote héroïque racontée par les anciens de la famille.", author: antoine, date: '2023-12-17', readTime: '6 min', comments: 3, image: STORY_IMAGE_POOL[4] },
    { type: 'Récit oral', theme: 'transmission', title: 'Les contes du soir de Maman Victoire', excerpt: "Les histoires que maman racontait à ses enfants chaque soir avant de se coucher.", author: marie, date: '2023-11-03', readTime: '8 min', comments: 4, image: mathieu.photo, media: 'audio' },
    { type: 'Histoire', theme: 'voyages', title: "L'installation de la première branche à Cotonou", excerpt: "Comment nos ancêtres ont posé les fondations de notre avenir à Cotonou.", author: mathieu, date: '2023-10-30', readTime: '12 min', comments: 6, image: STORY_IMAGE_POOL[0] },
    { type: 'Anecdote', theme: 'traditions', title: 'La fête mémorable de 1972', excerpt: "Une célébration dont toute la famille se souvient encore aujourd'hui.", author: paul, date: '2023-09-16', readTime: '7 min', comments: 2, image: STORY_IMAGE_POOL[2] },
    { type: 'Récit oral', theme: 'transmission', title: 'Témoignage de grand-mère sur la transmission', excerpt: "Les valeurs et les leçons que grand-mère nous a transmises.", author: victoire, date: '2023-08-12', readTime: '9 min', comments: 7, image: victoire.photo, media: 'audio' },
  ]

  return raw.map((s, i) => ({
    id: `story-${i}`,
    type: s.type,
    theme: s.theme,
    title: s.title,
    text: s.excerpt,
    excerpt: s.excerpt,
    author: s.author.name,
    authorId: s.author.id,
    authorPhoto: s.author.photo,
    date: s.date,
    readTime: s.readTime,
    comments: s.comments,
    image: s.image,
    media: s.media ?? null,
    featured: s.featured ?? false,
  }))
}

const storyTitleTemplates = {
  Histoire: [
    (m, loc) => `Le départ vers ${loc}`,
    (m, loc) => `L'installation de la première branche à ${loc}`,
    (m, loc, decade) => `La vie quotidienne à ${loc} dans les années ${decade}`,
    (m) => `Le mariage traditionnel de ${m}`,
    (m, loc) => `La création d'une école à ${loc}`,
  ],
  Anecdote: [
    (m) => `Le jour où ${m} a sauvé le village`,
    (m) => `Quand ${m} cachait les cahiers`,
    (m, loc, decade, year) => `La fête mémorable de ${year}`,
    (m) => `Une leçon inoubliable de ${m}`,
  ],
  'Récit oral': [
    (m) => `Les souvenirs de ${m} sur la maison familiale`,
    (m) => `Les contes du soir de ${m}`,
    (m) => `Témoignage de ${m} sur la transmission`,
  ],
}
const storyExcerptTemplates = {
  Histoire: (m, loc) => `Le récit de ${m} sur les raisons qui ont marqué l'histoire de notre famille à ${loc}.`,
  Anecdote: (m) => `Une anecdote transmise par ${m}, qui continue de faire sourire toute la famille.`,
  'Récit oral': (m) => `Un enregistrement précieux où ${m} raconte, avec ses propres mots, les souvenirs qui ont marqué la famille.`,
}

function genericStoriesFeed(family, extras, members, rng) {
  const types = ['Histoire', 'Histoire', 'Anecdote', 'Récit oral', 'Histoire', 'Anecdote', 'Récit oral', 'Histoire', 'Anecdote', 'Récit oral', 'Histoire', 'Anecdote']
  const eligible = members.filter((m) => m.parentId)
  const pool = eligible.length ? eligible : members
  const baseYear = 2022

  return types.map((type, i) => {
    const author = pick(rng, pool)
    const authorFirst = author.name.split(' ')[0]
    const locality = pick(rng, extras.localities)
    const decade = 1940 + Math.floor(rng() * 6) * 10
    const year = 1960 + Math.floor(rng() * 60)
    const template = pick(rng, storyTitleTemplates[type])
    const title = template(authorFirst, locality, decade, year)
    const excerpt = storyExcerptTemplates[type](authorFirst, locality)
    const monthIdx = Math.floor(rng() * 12)
    const day = 1 + Math.floor(rng() * 27)
    const date = `${baseYear - Math.floor(i / 3)}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const theme = STORY_THEMES[i % STORY_THEMES.length].id
    const media = type === 'Récit oral' ? (rng() > 0.5 ? 'video' : 'audio') : null
    return {
      id: `story-${i}`,
      type,
      theme,
      title,
      text: excerpt,
      excerpt,
      author: author.name,
      authorId: author.id,
      authorPhoto: author.photo,
      date,
      readTime: `${4 + Math.floor(rng() * 9)} min`,
      comments: Math.floor(rng() * 9),
      image: type === 'Récit oral' ? author.photo : pick(rng, STORY_IMAGE_POOL),
      media,
      featured: i === 0,
    }
  })
}

export function buildStoriesFeed(family, extras, members) {
  if (family.slug === 'houedji') return houedjiStoriesFeed(members)
  const rng = mulberry32(hashString(`${family.slug}:stories`))
  return genericStoriesFeed(family, extras, members, rng)
}

export const MEMORY_TYPES = [
  { id: 'Photo', label: 'Photos', icon: 'image' },
  { id: 'Vidéo', label: 'Vidéos', icon: 'video' },
  { id: 'Document', label: 'Documents', icon: 'file' },
  { id: 'Audio', label: 'Audio', icon: 'mic' },
  { id: 'Objet', label: 'Objets', icon: 'gift' },
  { id: 'Lieu', label: 'Lieux', icon: 'pin' },
]

export const MEMORY_CATEGORIES = [
  'Cérémonies & fêtes', 'Vie quotidienne', 'Documents officiels', 'Portraits', 'Maisons & lieux', 'Voyages & migrations',
]

function houedjiMemoriesFeed(members) {
  const mathieu = findMember(members, 'Mathieu Houédji')
  const marie = findMember(members, 'Marie Houédji')
  const jean = findMember(members, 'Jean Houédji')
  const paul = findMember(members, 'Paul Houédji')
  const victoire = findMember(members, 'Victoire Houédji')
  const antoine = findMember(members, 'Antoine Houédji')

  const raw = [
    { type: 'Photo', category: 'Cérémonies & fêtes', title: 'Photo de famille à Ouidah', year: '1952', place: 'Ouidah, Atlantique', author: mathieu, image: STORY_IMAGE_POOL[0] },
    { type: 'Vidéo', category: 'Vie quotidienne', title: 'Témoignage de Papa Houédji', year: '2018', place: 'Cotonou, Littoral', author: jean, image: mathieu.photo, duration: '12:45' },
    { type: 'Document', category: 'Documents officiels', title: 'Lettre de mon arrière-grand-père', year: '1921', place: 'Ouidah, Atlantique', author: victoire, image: DOCUMENT_IMAGE_POOL[0] },
    { type: 'Lieu', category: 'Maisons & lieux', title: 'La maison familiale à Ouidah', year: '1960', place: 'Ouidah, Atlantique', author: mathieu, image: STORY_IMAGE_POOL[2] },
    { type: 'Vidéo', category: 'Cérémonies & fêtes', title: 'Fête des retrouvailles 2022', year: '2022', place: 'Porto-Novo, Ouémé', author: paul, image: STORY_IMAGE_POOL[1], duration: '08:20' },
    { type: 'Document', category: 'Documents officiels', title: 'Acte de naissance de grand-père', year: '1940', place: 'Porto-Novo, Ouémé', author: marie, image: DOCUMENT_IMAGE_POOL[3] },
    { type: 'Vidéo', category: 'Vie quotidienne', title: 'Musique traditionnelle à Ouidah', year: '1975', place: 'Ouidah, Atlantique', author: antoine, image: antoine.photo, duration: '06:12' },
    { type: 'Photo', category: 'Portraits', title: 'Maman Victoire', year: '2015', place: 'Cotonou, Littoral', author: jean, image: victoire.photo },
    { type: 'Objet', category: 'Vie quotidienne', title: 'Tabouret royal Houédji', year: 'XIXe siècle', place: 'Ouidah, Atlantique', author: mathieu, authorName: 'Famille Houédji', image: STORY_IMAGE_POOL[3] },
    { type: 'Vidéo', category: 'Cérémonies & fêtes', title: 'Danses vodun à Ouidah', year: '1988', place: 'Ouidah, Atlantique', author: antoine, image: STORY_IMAGE_POOL[4], duration: '09:31' },
    { type: 'Document', category: 'Documents officiels', title: 'Certificat de scolarité', year: '1958', place: 'Cotonou, Littoral', author: mathieu, image: DOCUMENT_IMAGE_POOL[4] },
    { type: 'Lieu', category: 'Maisons & lieux', title: "Le port d'Ouidah", year: '1930', place: 'Ouidah, Atlantique', author: victoire, image: STORY_IMAGE_POOL[0] },
    { type: 'Audio', category: 'Vie quotidienne', title: 'Chant traditionnel enregistré', year: '2019', place: 'Ouidah, Atlantique', author: marie, image: marie.photo, duration: '03:40' },
    { type: 'Audio', category: 'Voyages & migrations', title: 'Conte audio de grand-mère', year: '2020', place: 'Cotonou, Littoral', author: victoire, image: victoire.photo, duration: '05:15' },
  ]

  return raw.map((m, i) => ({
    id: `memory-${i}`,
    type: m.type,
    category: m.category,
    title: m.title,
    year: m.year,
    place: m.place,
    author: m.authorName ?? m.author.name,
    authorId: m.author.id,
    authorPhoto: m.author.photo,
    image: m.image,
    duration: m.duration ?? null,
  }))
}

const memoryTitleTemplates = {
  Photo: [(m, loc) => `Photo de famille à ${loc}`, (m, loc) => `Portrait de ${m} à ${loc}`],
  Vidéo: [(m, loc) => `Témoignage de ${m}`, (m, loc) => `Souvenirs filmés à ${loc}`],
  Document: [(m, loc) => `Lettre de la famille`, (m, loc) => `Acte officiel de ${loc}`],
  Audio: [(m, loc) => `Enregistrement de ${m}`, (m, loc) => `Chant traditionnel de ${loc}`],
  Objet: [(m, loc) => `Objet de famille conservé à ${loc}`],
  Lieu: [(m, loc) => `La maison familiale de ${loc}`, (m, loc) => `Vue sur ${loc}`],
}

function genericMemoriesFeed(family, extras, members, rng) {
  const types = ['Photo', 'Photo', 'Vidéo', 'Document', 'Photo', 'Document', 'Vidéo', 'Photo', 'Objet', 'Lieu', 'Audio', 'Document', 'Photo', 'Vidéo']
  const pool = members.length ? members : [{ id: 'x', name: family.name, photo: PORTRAIT_POOL[0] }]

  return types.map((type, i) => {
    const author = pick(rng, pool)
    const authorFirst = author.name.split(' ')[0]
    const locality = pick(rng, extras.localities)
    const template = pick(rng, memoryTitleTemplates[type])
    const title = template(authorFirst, locality)
    const year = String(1900 + Math.floor(rng() * 110))
    const hasDuration = type === 'Vidéo' || type === 'Audio'
    return {
      id: `memory-${i}`,
      type,
      category: pick(rng, MEMORY_CATEGORIES),
      title,
      year,
      place: locality,
      author: author.name,
      authorId: author.id,
      authorPhoto: author.photo,
      image: type === 'Document' ? pick(rng, DOCUMENT_IMAGE_POOL) : (hasDuration ? author.photo : pick(rng, STORY_IMAGE_POOL)),
      duration: hasDuration ? `0${Math.floor(rng() * 9)}:${String(Math.floor(rng() * 60)).padStart(2, '0')}` : null,
    }
  })
}

export function buildMemoriesFeed(family, extras, members) {
  if (family.slug === 'houedji') return houedjiMemoriesFeed(members)
  const rng = mulberry32(hashString(`${family.slug}:memories`))
  return genericMemoriesFeed(family, extras, members, rng)
}

export const TIMELINE_BADGES = ['Origines', 'Naissance', 'Migration', 'Installation', 'Héritage', 'Génération']
const TIMELINE_ICONS = ['home', 'gift', 'sail', 'building', 'star', 'users']

function houedjiTimelineFeed(members) {
  const ahahnanzo = findMember(members, 'Ahahnanzo Houédji')
  const victoire = findMember(members, 'Victoire Houédji')
  const jean = findMember(members, 'Jean Houédji')
  const mathieu = findMember(members, 'Mathieu Houédji')
  const paul = findMember(members, 'Paul Houédji')
  const marie = findMember(members, 'Marie Houédji')

  const raw = [
    {
      year: '1840', era: 'XVIIIe siècle', icon: 'home', badge: 'Origines',
      title: 'Installation à Ouidah',
      description: "Notre ancêtre fondateur Ahahnanzo Houédji s'installe à Ouidah comme commerçant et y bâtit sa première maison.",
      fullDescription: "Ahahnanzo Houédji quitte son village d'origine pour s'installer à Ouidah, un important centre commercial du royaume du Danxomè. Il y devient négociant et bâtit les fondations de notre lignée.",
      author: ahahnanzo, place: 'Ouidah, Atlantique', image: STORY_IMAGE_POOL[0],
      keyPerson: { name: 'Ahahnanzo Houédji', role: 'Ancêtre fondateur', photo: ahahnanzo.photo },
      keywords: ['Origines', 'Ouidah', 'Installation', 'Commerce'],
    },
    {
      year: '1912', era: null, icon: 'gift', badge: 'Naissance',
      title: 'Naissance de Hounsou Houédji',
      description: 'Naissance de Hounsou Houédji, fils de Ahahnanzo Houédji et de Adjo Victoire.',
      fullDescription: "Hounsou Houédji naît à Ouidah, second enfant d'Ahahnanzo. Il grandit dans le commerce familial et deviendra à son tour un pilier de la famille.",
      author: victoire, place: 'Ouidah, Atlantique', image: victoire.photo,
      keyPerson: { name: 'Hounsou Houédji', role: 'Fils du fondateur', photo: victoire.photo },
      keywords: ['Naissance', 'Ouidah', 'Filiation'],
    },
    {
      year: '1945', era: null, icon: 'sail', badge: 'Migration',
      title: "Départ d'une branche vers Cotonou",
      description: 'Une partie de la famille déménage à Cotonou pour saisir de nouvelles opportunités liées au commerce et à l\'administration.',
      fullDescription: "Poussée par l'essor économique de Cotonou, une branche de la famille Houédji quitte Ouidah pour s'y installer, ouvrant une nouvelle page de l'histoire familiale.",
      author: jean, place: 'Cotonou, Littoral', image: STORY_IMAGE_POOL[1],
      keyPerson: { name: 'Jean Houédji', role: 'Initiateur de la migration', photo: jean.photo },
      keywords: ['Migration', 'Cotonou', 'Commerce'],
    },
    {
      year: '1970', era: null, icon: 'building', badge: 'Installation',
      title: 'Installation à Cotonou',
      description: "La famille s'établit définitivement à Cotonou et s'implique dans différents secteurs d'activités.",
      fullDescription: "Mathieu Houédji, instituteur respecté, incarne cette nouvelle génération installée à Cotonou, entre enseignement et transmission des valeurs familiales.",
      author: mathieu, place: 'Cotonou, Littoral', image: mathieu.photo,
      keyPerson: { name: 'Mathieu Houédji', role: 'Pilier de la branche de Cotonou', photo: mathieu.photo },
      keywords: ['Installation', 'Cotonou', 'Éducation'],
    },
    {
      year: '2001', era: null, icon: 'star', badge: 'Héritage',
      title: "Création de l'association familiale",
      description: 'Création de l\'association « Famille Houédji » pour préserver notre histoire et transmettre nos valeurs.',
      fullDescription: "Sous l'impulsion de Paul Houédji, la famille se dote d'une association pour documenter ses archives, organiser ses retrouvailles et transmettre sa mémoire aux jeunes générations.",
      author: paul, place: 'Cotonou, Littoral', image: STORY_IMAGE_POOL[2],
      keyPerson: { name: 'Paul Houédji', role: 'Fondateur de l\'association', photo: paul.photo },
      keywords: ['Héritage', 'Association', 'Transmission'],
    },
    {
      year: 'Aujourd\'hui', era: '2024', icon: 'users', badge: 'Génération',
      title: 'La nouvelle génération',
      description: 'Les descendants continuent de faire vivre notre héritage à travers le monde.',
      fullDescription: "Dispersée entre le Bénin et la diaspora, la nouvelle génération Houédji reste unie autour de son histoire commune, portée par des outils comme Béninto.",
      author: marie, place: 'Monde entier', image: STORY_IMAGE_POOL[3],
      keyPerson: { name: 'Marie Houédji', role: 'Voix de la nouvelle génération', photo: marie.photo },
      keywords: ['Génération', 'Diaspora', 'Transmission'],
    },
  ]

  return raw.map((e, i) => ({
    id: `tl-${i}`,
    year: e.year,
    period: e.year,
    era: e.era,
    icon: e.icon,
    badge: e.badge,
    title: e.title,
    text: e.title,
    description: e.description,
    fullDescription: e.fullDescription,
    author: e.author.name,
    authorId: e.author.id,
    authorPhoto: e.author.photo,
    place: e.place,
    image: e.image,
    keyPerson: e.keyPerson,
    keywords: e.keywords,
    documents: [DOCUMENT_IMAGE_POOL[i % DOCUMENT_IMAGE_POOL.length], DOCUMENT_IMAGE_POOL[(i + 1) % DOCUMENT_IMAGE_POOL.length], STORY_IMAGE_POOL[i % STORY_IMAGE_POOL.length]],
  }))
}

function genericTimelineFeed(family, extras, members, rng) {
  const pool = members.length ? members : [{ id: 'x', name: family.name, photo: PORTRAIT_POOL[0] }]
  return family.timeline.map(([period, text], i) => {
    const author = pick(rng, pool)
    const badge = TIMELINE_BADGES[i % TIMELINE_BADGES.length]
    const place = pick(rng, extras.localities)
    return {
      id: `tl-${i}`,
      year: period,
      period,
      era: null,
      icon: TIMELINE_ICONS[i % TIMELINE_ICONS.length],
      badge,
      title: text,
      text,
      description: text,
      fullDescription: `${text} Cet épisode reste gravé dans la mémoire de la famille ${family.name}.`,
      author: author.name,
      authorId: author.id,
      authorPhoto: author.photo,
      place,
      image: pick(rng, STORY_IMAGE_POOL),
      keyPerson: { name: author.name, role: 'Témoin de cet épisode', photo: author.photo },
      keywords: [badge, place.split(',')[0], family.name],
      documents: [pick(rng, DOCUMENT_IMAGE_POOL), pick(rng, DOCUMENT_IMAGE_POOL), pick(rng, STORY_IMAGE_POOL)],
    }
  })
}

export function buildTimelineFeed(family, extras, members) {
  if (family.slug === 'houedji') return houedjiTimelineFeed(members)
  const rng = mulberry32(hashString(`${family.slug}:timeline`))
  return genericTimelineFeed(family, extras, members, rng)
}

export const DOCUMENT_CATEGORIES = ['Actes officiels', 'Lettres', 'Certificats', 'Contrats', 'Factures', 'Autres']
const DOCUMENT_FORMATS = ['PDF', 'JPG', 'PNG']

function houedjiDocumentsFeed(members) {
  const mathieu = findMember(members, 'Mathieu Houédji')
  const antoine = findMember(members, 'Antoine Houédji')
  const victoire = findMember(members, 'Victoire Houédji')
  const jean = findMember(members, 'Jean Houédji')
  const marie = findMember(members, 'Marie Houédji')
  const hounsou = findMember(members, 'Hounsou Houédji')
  const ahahnanzo = findMember(members, 'Ahahnanzo Houédji')
  const paul = findMember(members, 'Paul Houédji')

  const raw = [
    { format: 'PDF', category: 'Actes officiels', title: 'Acte de naissance de Mathieu Houédji', year: '1920', place: 'Ouidah, Atlantique', author: mathieu, documentDate: '12 mars 1920', description: "Acte de naissance officiel de Mathieu Houédji, né le 12 mars 1920 à Ouidah.", addedAt: '28 avril 2024 à 14:35' },
    { format: 'JPG', category: 'Actes officiels', title: 'Acte de mariage de Hounsou & Adjo', year: '1892', place: 'Ouidah, Atlantique', author: antoine, documentDate: '4 juin 1892', description: "Acte de mariage de Hounsou Houédji et Adjo Victoire, célébré à Ouidah.", addedAt: '25 avril 2024 à 09:10' },
    { format: 'PDF', category: 'Lettres', title: "Lettre de mon arrière-grand-père", year: '1921', place: 'Ouidah, Atlantique', author: victoire, documentDate: '2 février 1921', description: "Lettre manuscrite adressée à la famille restée à Ouidah.", addedAt: '22 avril 2024 à 18:42' },
    { format: 'PNG', category: 'Certificats', title: 'Certificat de scolarité Jean Houédji', year: '1935', place: 'Porto-Novo, Ouémé', author: jean, documentDate: '10 juillet 1935', description: "Certificat attestant la scolarité de Jean Houédji.", addedAt: '20 avril 2024 à 11:05' },
    { format: 'PDF', category: 'Contrats', title: 'Contrat de vente de maison familiale', year: '1968', place: 'Cotonou, Littoral', author: mathieu, documentDate: '15 mars 1968', description: "Contrat notarié de vente d'une maison de la famille à Cotonou.", addedAt: '18 avril 2024 à 16:20' },
    { format: 'JPG', category: 'Lettres', title: 'Lettre de Maman Victoire', year: '1954', place: 'Porto-Novo, Ouémé', author: marie, documentDate: '9 septembre 1954', description: "Lettre personnelle écrite par Victoire Houédji.", addedAt: '15 avril 2024 à 08:30' },
    { format: 'PDF', category: 'Actes officiels', title: 'Acte de décès de Papa Houédji', year: '1981', place: 'Cotonou, Littoral', author: jean, documentDate: '3 janvier 1981', description: "Acte de décès officiel établi à Cotonou.", addedAt: '12 avril 2024 à 13:55' },
    { format: 'JPG', category: 'Autres', title: 'Titre foncier de la maison à Ouidah', year: '1972', place: 'Ouidah, Atlantique', author: hounsou, documentDate: '21 mai 1972', description: "Titre foncier de la maison familiale d'Ouidah.", addedAt: '10 avril 2024 à 10:15' },
    { format: 'PNG', category: 'Autres', title: 'Registre commercial de Ahanhanzo Houédji', year: '1940', place: 'Cotonou, Littoral', author: ahahnanzo, documentDate: '1940', description: "Registre des transactions commerciales de la famille.", addedAt: '5 avril 2024 à 17:00' },
    { format: 'PDF', category: 'Certificats', title: 'Certificat de baptême Paul Houédji', year: '1927', place: 'Ouidah, Atlantique', author: victoire, documentDate: '19 avril 1927', description: "Certificat de baptême de Paul Houédji.", addedAt: '2 avril 2024 à 09:40' },
    { format: 'JPG', category: 'Lettres', title: 'Lettre envoyée de France', year: '1962', place: 'Paris, France', author: jean, documentDate: '28 novembre 1962', description: "Lettre envoyée par un membre de la famille installé en France.", addedAt: '30 mars 2024 à 19:25' },
    { format: 'PDF', category: 'Factures', title: "Facture de l'atelier familial", year: '1958', place: 'Cotonou, Littoral', author: paul, documentDate: '14 juin 1958', description: "Facture liée aux activités commerciales de la famille.", addedAt: '27 mars 2024 à 12:10' },
  ]

  return raw.map((d, i) => ({
    id: `doc-${i}`,
    format: d.format,
    category: d.category,
    title: d.title,
    year: d.year,
    place: d.place,
    author: d.author.name,
    authorId: d.author.id,
    authorPhoto: d.author.photo,
    documentDate: d.documentDate,
    description: d.description,
    addedAt: d.addedAt,
    image: DOCUMENT_IMAGE_POOL[i % DOCUMENT_IMAGE_POOL.length],
    src: DOCUMENT_IMAGE_POOL[i % DOCUMENT_IMAGE_POOL.length],
    type: d.category,
  }))
}

const documentTitleTemplates = {
  'Actes officiels': [(m, loc) => `Acte de naissance de ${m}`, (m, loc) => `Acte de mariage à ${loc}`, (m, loc) => `Acte de décès à ${loc}`],
  Lettres: [(m, loc) => `Lettre de ${m}`, (m, loc) => `Lettre envoyée à ${loc}`],
  Certificats: [(m, loc) => `Certificat de scolarité de ${m}`, (m, loc) => `Certificat de baptême de ${m}`],
  Contrats: [(m, loc) => `Contrat de vente à ${loc}`, (m, loc) => `Contrat familial de ${loc}`],
  Factures: [(m, loc) => `Facture de l'atelier de ${loc}`],
  Autres: [(m, loc) => `Titre foncier à ${loc}`, (m, loc) => `Registre familial de ${loc}`],
}

function genericDocumentsFeed(family, extras, members, rng) {
  const categories = ['Actes officiels', 'Actes officiels', 'Lettres', 'Certificats', 'Contrats', 'Lettres', 'Actes officiels', 'Autres', 'Autres', 'Certificats', 'Lettres', 'Factures']
  const pool = members.length ? members : [{ id: 'x', name: family.name, photo: PORTRAIT_POOL[0] }]

  return categories.map((category, i) => {
    const author = pick(rng, pool)
    const authorFirst = author.name.split(' ')[0]
    const locality = pick(rng, extras.localities)
    const template = pick(rng, documentTitleTemplates[category])
    const title = template(authorFirst, locality)
    const year = String(1900 + Math.floor(rng() * 110))
    const day = 1 + Math.floor(rng() * 27)
    const month = pick(rng, ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'])
    const image = pick(rng, DOCUMENT_IMAGE_POOL)
    return {
      id: `doc-${i}`,
      format: pick(rng, DOCUMENT_FORMATS),
      category,
      title,
      year,
      place: locality,
      author: author.name,
      authorId: author.id,
      authorPhoto: author.photo,
      documentDate: `${day} ${month} ${year}`,
      description: `${title}, conservé par la famille ${family.name}.`,
      addedAt: `${day} ${month} 2024 à ${8 + Math.floor(rng() * 10)}:00`,
      image,
      src: image,
      type: category,
    }
  })
}

export function buildDocumentsFeed(family, extras, members) {
  if (family.slug === 'houedji') return houedjiDocumentsFeed(members)
  const rng = mulberry32(hashString(`${family.slug}:documents`))
  return genericDocumentsFeed(family, extras, members, rng)
}
