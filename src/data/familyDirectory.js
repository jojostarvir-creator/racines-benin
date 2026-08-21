import { registeredFamilies } from './registeredFamilies.js'
import { departmentData } from './departments.js'

function normalize(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function slugify(name) {
  return normalize(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a2f?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=85',
]

const ethnicGroupProfiles = {
  "Fon": {
    originLabel: "Peuple Fon",
    taglineTemplates: ["Héritiers des traditions du Danxomè", "Gardien·ne·s d'un héritage fon", "Une lignée enracinée dans le royaume fon"],
    descriptionTemplates: [
      "Une famille fon dont la mémoire se transmet depuis plusieurs générations, entre rites, noms et récits du royaume du Danxomè.",
      "Issue du cœur du pays fon, cette lignée a traversé les bouleversements de l'histoire tout en conservant ses usages et son nom."
    ],
    timelinePool: [
      ["Époque du royaume du Danxomè", "La famille s'inscrit dans la vie de la cour ou des cultes vodoun de la région."],
      ["Période coloniale", "La lignée traverse les bouleversements administratifs tout en conservant son nom et ses usages."],
      ["Indépendance du Bénin", "Les descendants s'installent dans les grandes villes tout en gardant un lien avec le village d'origine."],
      ["Milieu du XXe siècle", "La famille voit certains de ses membres rejoindre l'administration ou le commerce naissant."],
      ["Aujourd'hui", "La famille continue de transmettre son nom et ses récits aux nouvelles générations."]
    ]
  },
  "Adja": {
    originLabel: "Peuple Adja",
    taglineTemplates: ["Une lignée issue des migrations adja", "Gardien·ne·s des traditions du pays adja"],
    descriptionTemplates: [
      "Descendante des grandes migrations adja depuis Tado, cette famille a essaimé entre le Mono, le Couffo et leurs environs.",
      "Une famille adja marquée par les traditions agraires et spirituelles transmises de génération en génération."
    ],
    timelinePool: [
      ["Migrations depuis Tado", "Les ancêtres quittent Tado et s'installent progressivement dans la région."],
      ["Fondation du village", "La famille participe à la fondation d'une communauté le long des cours d'eau."],
      ["Période coloniale", "La lignée conserve ses cultes et son nom malgré les bouleversements administratifs."],
      ["XXe siècle", "Certains membres de la famille migrent vers les villes côtières."],
      ["Aujourd'hui", "Les cérémonies familiales continuent de rassembler la lignée chaque année."]
    ]
  },
  "Yoruba-Nago": {
    originLabel: "Peuple Yoruba / Nago",
    taglineTemplates: ["Une lignée nago du sud-est du Bénin", "Héritiers d'une tradition yoruba-nago"],
    descriptionTemplates: [
      "Une famille d'origine yoruba-nago, dont l'histoire est liée aux échanges culturels et religieux entre le Bénin et le Nigeria voisin.",
      "Issue des communautés nago de l'Ouémé et du Plateau, cette lignée a préservé langue, cultes et savoir-faire ancestraux."
    ],
    timelinePool: [
      ["Installation dans la région", "La famille s'établit parmi les communautés nago de l'est du pays."],
      ["Échanges avec le pays yoruba", "Des liens commerciaux et religieux se tissent avec les cités yoruba voisines."],
      ["Période coloniale", "La lignée conserve sa langue et ses cultes malgré les frontières nouvellement tracées."],
      ["XXe siècle", "La famille s'agrandit et essaime vers Porto-Novo et les villes du Plateau."],
      ["Aujourd'hui", "Les descendants perpétuent certains rites et fêtes traditionnelles nago."]
    ]
  },
  "Bariba": {
    originLabel: "Peuple Bariba",
    taglineTemplates: ["Cavaliers et conteurs du Borgou", "Une lignée issue des royaumes bariba"],
    descriptionTemplates: [
      "Une famille bariba dont l'histoire est liée aux royaumes du Borgou et à la tradition équestre de la région.",
      "Issue du pays bariba, cette lignée a longtemps été associée aux cavaliers et aux conteurs de la Gaani."
    ],
    timelinePool: [
      ["Fondation des royaumes bariba", "Les ancêtres participent à la vie des royaumes fondateurs du Borgou."],
      ["Époque des grandes courses", "La famille se distingue par ses cavaliers lors des fêtes de la Gaani."],
      ["Période coloniale", "La lignée conserve son rang et ses traditions malgré l'administration coloniale."],
      ["XXe siècle", "Certains descendants rejoignent l'administration ou l'agriculture dans la région de Parakou."],
      ["Aujourd'hui", "Les récits de la famille sont encore contés lors des fêtes annuelles du Borgou."]
    ]
  },
  "Dendi": {
    originLabel: "Peuple Dendi",
    taglineTemplates: ["Une lignée commerçante du Nord-Est", "Héritiers des routes commerciales dendi"],
    descriptionTemplates: [
      "Une famille dendi dont l'histoire est liée aux routes commerciales qui reliaient autrefois la vallée du Niger au reste du pays.",
      "Issue du Nord-Est du Bénin, cette lignée a longtemps vécu du commerce fluvial et caravanier."
    ],
    timelinePool: [
      ["Installation le long du fleuve", "Les ancêtres s'établissent le long des routes commerciales du Nord-Est."],
      ["Essor du commerce caravanier", "La famille prospère grâce aux échanges entre la vallée du Niger et l'intérieur des terres."],
      ["Période coloniale", "La lignée s'adapte aux nouvelles frontières et continue son activité commerciale."],
      ["XXe siècle", "Certains membres de la famille s'installent à Malanville et dans les communes voisines."],
      ["Aujourd'hui", "La famille reste connue pour son sens du commerce et de l'hospitalité."]
    ]
  },
  "Peul": {
    originLabel: "Peuple Peul",
    taglineTemplates: ["Une lignée peule du septentrion", "Gardien·ne·s des traditions pastorales"],
    descriptionTemplates: [
      "Une famille peule dont l'histoire est marquée par la transhumance et l'élevage à travers le nord du Bénin.",
      "Issue des communautés peules du septentrion, cette lignée a transmis un mode de vie pastoral séculaire."
    ],
    timelinePool: [
      ["Grandes transhumances", "Les ancêtres parcourent les pâturages du nord au fil des saisons."],
      ["Installation progressive", "La famille s'établit durablement autour de points d'eau et de marchés."],
      ["Période coloniale", "La lignée conserve son mode de vie malgré les nouvelles frontières administratives."],
      ["XXe siècle", "Certains membres se sédentarisent tandis que d'autres perpétuent l'élevage."],
      ["Aujourd'hui", "La famille garde un lien fort avec le bétail et les traditions pastorales."]
    ]
  },
  "Somba": {
    originLabel: "Peuple Somba / Betammaribe",
    taglineTemplates: ["Bâtisseurs de tata somba", "Une lignée des montagnes de l'Atacora"],
    descriptionTemplates: [
      "Une famille somba dont l'histoire est liée à l'architecture unique des tata et aux rites de passage de l'Atacora.",
      "Issue des montagnes de l'Atacora, cette lignée a transmis un savoir-faire architectural et spirituel séculaire."
    ],
    timelinePool: [
      ["Installation dans les montagnes", "Les ancêtres s'établissent dans les massifs de l'Atacora."],
      ["Édification des tata somba", "La famille participe à la construction de ces maisons-forteresses caractéristiques."],
      ["Période coloniale", "La lignée résiste aux tentatives d'assimilation tout en préservant ses rites."],
      ["XXe siècle", "Les rites de passage transmis par la famille rassemblent encore tout le village."],
      ["Aujourd'hui", "La famille perpétue les cérémonies initiatiques propres à la région."]
    ]
  },
  "Mina": {
    originLabel: "Peuple Mina",
    taglineTemplates: ["Une lignée côtière du Mono", "Héritiers des traditions mina"],
    descriptionTemplates: [
      "Une famille mina installée le long des rives du Mono, entre pêche, commerce et traditions religieuses côtières.",
      "Issue des communautés mina du sud-ouest, cette lignée a conservé un lien fort avec le fleuve et la côte."
    ],
    timelinePool: [
      ["Installation sur la côte", "Les ancêtres s'établissent le long du littoral et des rives du Mono."],
      ["Essor du commerce côtier", "La famille développe des activités liées à la pêche et aux échanges maritimes."],
      ["Période coloniale", "La lignée conserve ses cultes malgré les bouleversements de l'époque."],
      ["XXe siècle", "Certains membres de la famille migrent vers Grand-Popo et Comè."],
      ["Aujourd'hui", "La famille perpétue les cérémonies liées au fleuve et à la mer."]
    ]
  }
}

const surnameDirectory = [
  // Alibori — Dendi, Peul, Bariba
  { name: "Boukari", department: "Alibori", ethnicGroup: "Dendi" },
  { name: "Idrissou", department: "Alibori", ethnicGroup: "Dendi" },
  { name: "Alassane", department: "Alibori", ethnicGroup: "Peul" },
  { name: "Moussa", department: "Alibori", ethnicGroup: "Dendi" },
  { name: "Saliou", department: "Alibori", ethnicGroup: "Peul" },
  { name: "Djibril", department: "Alibori", ethnicGroup: "Dendi" },
  { name: "Yarou", department: "Alibori", ethnicGroup: "Bariba" },
  { name: "Gansari", department: "Alibori", ethnicGroup: "Dendi" },
  { name: "Wabi", department: "Alibori", ethnicGroup: "Dendi" },
  { name: "Sabi", department: "Alibori", ethnicGroup: "Bariba" },

  // Atacora — Somba, Waama, Peul
  { name: "N'Tcha", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Yentema", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Tamou", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Boukpessi", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Natta", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Sambieni", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Kpatchavi", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Dassoundo", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Konde", department: "Atacora", ethnicGroup: "Somba" },
  { name: "Kperou", department: "Atacora", ethnicGroup: "Peul" },

  // Donga — Yoruba-Nago (Bassila), Lokpa, Peul
  { name: "Baba-Moussa", department: "Donga", ethnicGroup: "Peul" },
  { name: "Chitou", department: "Donga", ethnicGroup: "Yoruba-Nago" },
  { name: "Djeri", department: "Donga", ethnicGroup: "Yoruba-Nago" },
  { name: "Gbedo", department: "Donga", ethnicGroup: "Yoruba-Nago" },
  { name: "Karimou", department: "Donga", ethnicGroup: "Peul" },
  { name: "Bonou", department: "Donga", ethnicGroup: "Yoruba-Nago" },
  { name: "Seko", department: "Donga", ethnicGroup: "Yoruba-Nago" },
  { name: "Youssao", department: "Donga", ethnicGroup: "Peul" },
  { name: "Iroukora", department: "Donga", ethnicGroup: "Yoruba-Nago" },
  { name: "Bagoudou", department: "Donga", ethnicGroup: "Peul" },

  // Borgou — Bariba, Peul, Dendi
  { name: "Gomina", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Yerima", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Kora", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Seidou", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Orou Guiwa", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Baba", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Sabi Bio", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Sina", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Orou Sanni", department: "Borgou", ethnicGroup: "Bariba" },
  { name: "Gnonlonfoun", department: "Borgou", ethnicGroup: "Bariba" },

  // Collines — Idaasha, Mahi, Tchabe, Fon
  { name: "Igue", department: "Collines", ethnicGroup: "Yoruba-Nago" },
  { name: "Alao", department: "Collines", ethnicGroup: "Yoruba-Nago" },
  { name: "Yabi", department: "Collines", ethnicGroup: "Fon" },
  { name: "Sokegbe", department: "Collines", ethnicGroup: "Fon" },
  { name: "Adje", department: "Collines", ethnicGroup: "Fon" },
  { name: "Gansou", department: "Collines", ethnicGroup: "Fon" },
  { name: "Chabi", department: "Collines", ethnicGroup: "Bariba" },
  { name: "Toko", department: "Collines", ethnicGroup: "Yoruba-Nago" },
  { name: "Adekambi", department: "Collines", ethnicGroup: "Yoruba-Nago" },
  { name: "Sagbo", department: "Collines", ethnicGroup: "Fon" },

  // Zou — Fon
  { name: "Houngbo", department: "Zou", ethnicGroup: "Fon" },
  { name: "Adjovi", department: "Zou", ethnicGroup: "Fon" },
  { name: "Agbo", department: "Zou", ethnicGroup: "Fon" },
  { name: "Zinsou", department: "Zou", ethnicGroup: "Fon" },
  { name: "Gbaguidi", department: "Zou", ethnicGroup: "Fon" },
  { name: "Hounkpatin", department: "Zou", ethnicGroup: "Fon" },
  { name: "Hounnou", department: "Zou", ethnicGroup: "Fon" },
  { name: "Akindes", department: "Zou", ethnicGroup: "Fon" },
  { name: "Houessou", department: "Zou", ethnicGroup: "Fon" },
  { name: "Ahouansou", department: "Zou", ethnicGroup: "Fon" },

  // Couffo — Adja
  { name: "Ahouandjinou", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Kougbenou", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Gbenou", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Aizan", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Sohou", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Kpadonou", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Agbomahena", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Houngue", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Dansou", department: "Couffo", ethnicGroup: "Adja" },
  { name: "Hounnou-Gan", department: "Couffo", ethnicGroup: "Adja" },

  // Mono — Adja / Mina
  { name: "Kponou", department: "Mono", ethnicGroup: "Mina" },
  { name: "Amoussou", department: "Mono", ethnicGroup: "Mina" },
  { name: "Kpodar", department: "Mono", ethnicGroup: "Mina" },
  { name: "Tossou", department: "Mono", ethnicGroup: "Mina" },
  { name: "Adanhounme", department: "Mono", ethnicGroup: "Mina" },
  { name: "Kpatinvoh", department: "Mono", ethnicGroup: "Mina" },
  { name: "Amoussouga", department: "Mono", ethnicGroup: "Mina" },
  { name: "Djidonou", department: "Mono", ethnicGroup: "Mina" },
  { name: "Dossou", department: "Mono", ethnicGroup: "Adja" },
  { name: "Adjahoui", department: "Mono", ethnicGroup: "Adja" },

  // Atlantique — Fon, Xwla, Aizo
  { name: "Houinsou", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Agossou", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Dossa", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Adjaho", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Aplogan", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Houessinon", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Dagba", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Zomahoun", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Ahouanmenou", department: "Atlantique", ethnicGroup: "Fon" },
  { name: "Djossou", department: "Atlantique", ethnicGroup: "Fon" },

  // Ouémé — Gun, Yoruba-Nago
  { name: "Sacca", department: "Ouémé", ethnicGroup: "Yoruba-Nago" },
  { name: "Yessoufou", department: "Ouémé", ethnicGroup: "Yoruba-Nago" },
  { name: "Alapini", department: "Ouémé", ethnicGroup: "Yoruba-Nago" },
  { name: "Zannou", department: "Ouémé", ethnicGroup: "Fon" },
  { name: "Adjahouinou", department: "Ouémé", ethnicGroup: "Fon" },
  { name: "Aguemon", department: "Ouémé", ethnicGroup: "Fon" },
  { name: "Agbota", department: "Ouémé", ethnicGroup: "Fon" },
  { name: "Loko", department: "Ouémé", ethnicGroup: "Fon" },
  { name: "Kinhou", department: "Ouémé", ethnicGroup: "Fon" },
  { name: "Adjovi-Boco", department: "Ouémé", ethnicGroup: "Fon" },

  // Plateau — Yoruba-Nago, Idaasha
  { name: "Osseni", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Adjibade", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Sanni", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Alarou", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Wanou", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Adjagba", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Tairou", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Fanou", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Idohou", department: "Plateau", ethnicGroup: "Yoruba-Nago" },
  { name: "Kpinsoton", department: "Plateau", ethnicGroup: "Yoruba-Nago" },

  // Littoral — mixte urbain, Cotonou
  { name: "Talon", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Soglo", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Houngbédji", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Glele", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Sinzogan", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Adande", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Ahanhanzo", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Agbodjan", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Sossou", department: "Littoral", ethnicGroup: "Fon" },
  { name: "Djogbenou", department: "Littoral", ethnicGroup: "Fon" },
]

const directory = (() => {
  const seen = new Set()
  const list = []
  for (const entry of surnameDirectory) {
    const key = normalize(entry.name)
    if (seen.has(key)) continue
    seen.add(key)
    list.push(entry)
  }
  return list
})()

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

function buildGeneratedProfile(entry) {
  const rng = mulberry32(hashString(entry.name))
  const profile = ethnicGroupProfiles[entry.ethnicGroup]
  const dept = departmentData[entry.department]
  const localities = dept?.stories?.map((s) => s[1]) ?? [entry.department]
  const locality = pick(rng, localities)
  const pool = profile.timelinePool
  const start = Math.floor(rng() * pool.length)
  const timeline = [0, 1, 2].map((i) => pool[(start + i) % pool.length])

  return {
    slug: slugify(entry.name),
    name: entry.name,
    department: entry.department,
    locality: `${locality} · ${entry.department}`,
    origin: profile.originLabel,
    duration: `${10 + Math.floor(rng() * 12)} min`,
    generations: 4 + Math.floor(rng() * 6),
    members: 15 + Math.floor(rng() * 60),
    tagline: pick(rng, profile.taglineTemplates),
    description: pick(rng, profile.descriptionTemplates),
    image: pick(rng, IMAGE_POOL),
    timeline,
    generated: true,
  }
}

export function findFamily(query) {
  const q = normalize(query)
  if (!q) return null

  const curated =
    registeredFamilies.find((f) => normalize(f.name) === q) ||
    (q.length >= 3 && registeredFamilies.find((f) => normalize(f.name).includes(q)))
  if (curated) return curated

  const entry =
    directory.find((f) => normalize(f.name) === q) ||
    (q.length >= 3 && directory.find((f) => normalize(f.name).includes(q)))
  if (entry) return buildGeneratedProfile(entry)

  return null
}

export function getFamilyBySlug(slug) {
  const curated = registeredFamilies.find((f) => f.slug === slug)
  if (curated) return curated
  const entry = directory.find((f) => slugify(f.name) === slug)
  return entry ? buildGeneratedProfile(entry) : null
}

export function directorySize() {
  return registeredFamilies.length + directory.length
}
