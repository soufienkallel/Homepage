// Mock data for MALLOULIAUTO application

export const carBrands = [
  { value: 'renault', label: 'Renault', models: ['Symbol', 'Clio', 'Megane', 'Logan', 'Duster'] },
  { value: 'peugeot', label: 'Peugeot', models: ['208', '301', '308', '2008', '3008'] },
  { value: 'hyundai', label: 'Hyundai', models: ['i10', 'i20', 'Accent', 'Elantra', 'Tucson'] },
  { value: 'kia', label: 'Kia', models: ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Sorento'] },
  { value: 'citroen', label: 'Citroën', models: ['C3', 'C4', 'C-Elysée', 'Berlingo'] },
  { value: 'fiat', label: 'Fiat', models: ['500', 'Panda', 'Tipo', 'Punto'] },
  { value: 'seat', label: 'Seat', models: ['Ibiza', 'Leon', 'Arona', 'Ateca'] },
];

export const problemCategories = [
  {
    id: 'engine',
    name: 'Moteur / Mécanique',
    icon: 'engine',
    description: 'Problèmes de moteur, bruits anormaux, vibrations',
  },
  {
    id: 'electrical',
    name: 'Système Électrique',
    icon: 'zap',
    description: 'Batterie, alternateur, éclairage, démarrage',
  },
  {
    id: 'bodywork',
    name: 'Carrosserie / Extérieur',
    icon: 'car',
    description: 'Rayures, bosses, peinture, pare-chocs',
  },
  {
    id: 'interior',
    name: 'Intérieur / Sellerie',
    icon: 'armchair',
    description: 'Sièges, tableau de bord, garnitures',
  },
  {
    id: 'tires',
    name: 'Pneus / Roues',
    icon: 'disc',
    description: 'Usure, crevaison, équilibrage, alignement',
  },
  {
    id: 'glass',
    name: 'Vitres / Pare-brise',
    icon: 'square',
    description: 'Fissures, réparation, remplacement',
  },
  {
    id: 'hvac',
    name: 'Climatisation / Chauffage',
    icon: 'wind',
    description: 'Climatisation, chauffage, ventilation',
  },
  {
    id: 'keys',
    name: 'Clés / Sécurité',
    icon: 'key',
    description: 'Clés perdues, serrures, antidémarrage',
  },
  {
    id: 'detailing',
    name: 'Esthétique / Nettoyage',
    icon: 'sparkles',
    description: 'Lavage, polissage, nettoyage intérieur',
  },
];

export const diagnosisScenarios = [
  {
    trigger: {
      category: 'electrical',
      symptoms: ['démarrage', 'batterie', 'démarre pas', 'clic', 'voyant'],
    },
    result: {
      title: 'Décharge Batterie / Problème Alternateur',
      confidence: 94,
      severity: 'urgent',
      costRange: { min: 80, max: 180 },
      explanation:
        "Votre véhicule présente des symptômes typiques d'un problème de charge électrique. La batterie ne reçoit pas suffisamment de charge de l'alternateur, ou la batterie elle-même est en fin de vie. Les symptômes incluent des difficultés au démarrage, des voyants qui s'allument faiblement, et des clics au lieu du démarrage.",
      recommendations: [
        'Test de batterie et alternateur recommandé immédiatement',
        'Éviter de faire des trajets courts répétés',
        'Ne pas éteindre le moteur si le problème persiste',
        'Prévoir un remplacement dans les 48h',
      ],
    },
  },
  {
    trigger: {
      category: 'engine',
      symptoms: ['bruit', 'courroie', 'sifflement', 'couinement', 'vibration'],
    },
    result: {
      title: 'Courroie de Distribution Usée',
      confidence: 91,
      severity: 'urgent',
      costRange: { min: 180, max: 250 },
      explanation:
        "La courroie de distribution montre des signes d'usure avancée. Ce composant critique doit être remplacé selon les intervalles recommandés (généralement tous les 80 000-120 000 km). Un bruit de sifflement ou de couinement est un signe d'alerte important.",
      recommendations: [
        'Remplacement immédiat recommandé - risque de casse moteur',
        'Éviter toute conduite prolongée',
        'Vérifier aussi la pompe à eau et les galets tendeurs',
        "Prévoir 3-4 heures de main d'œuvre",
      ],
    },
  },
  {
    trigger: {
      category: 'engine',
      symptoms: ['huile', 'fuite', 'tache', 'niveau', 'gouttes'],
    },
    result: {
      title: "Fuite d'Huile Moteur",
      confidence: 88,
      severity: 'moderate',
      costRange: { min: 50, max: 150 },
      explanation:
        "Une fuite d'huile a été détectée. L'origine peut être un joint de carter, un joint de culasse, ou un bouchon de vidange mal serré. Il est important de localiser et réparer rapidement pour éviter une baisse dangereuse du niveau d'huile.",
      recommendations: [
        "Vérifier le niveau d'huile quotidiennement",
        'Ne pas faire de longs trajets avant réparation',
        'Diagnostic précis nécessaire pour localiser la source',
        'Réparation possible sous 2-3 jours',
      ],
    },
  },
  {
    trigger: {
      category: 'tires',
      symptoms: ['pneu', 'crevaison', 'dégonflé', 'usure', 'vibration'],
    },
    result: {
      title: 'Usure Irrégulière des Pneus',
      confidence: 85,
      severity: 'moderate',
      costRange: { min: 120, max: 200 },
      explanation:
        "Vos pneus présentent une usure irrégulière, souvent causée par un problème d'alignement (parallélisme) ou d'équilibrage. Cela peut aussi indiquer un problème de suspension. Une vibration au volant à certaines vitesses est un symptôme typique.",
      recommendations: [
        'Contrôle de géométrie (parallélisme) recommandé',
        'Équilibrage des roues nécessaire',
        "Vérification de l'état de la suspension",
        'Permutation des pneus si usure légère',
      ],
    },
  },
  {
    trigger: {
      category: 'hvac',
      symptoms: ['climatisation', 'clim', 'froid', 'chaud', 'air'],
    },
    result: {
      title: 'Recharge Climatisation Nécessaire',
      confidence: 82,
      severity: 'can-wait',
      costRange: { min: 60, max: 120 },
      explanation:
        "Le système de climatisation ne produit plus d'air froid suffisant. Cela indique généralement une perte de gaz réfrigérant (R134a ou R1234yf selon le modèle). Une recharge avec contrôle d'étanchéité est nécessaire.",
      recommendations: [
        "Recharge de gaz réfrigérant avec contrôle d'étanchéité",
        'Vérification du compresseur et du condenseur',
        "Nettoyage des filtres d'habitacle",
        'Intervention possible en 1-2 heures',
      ],
    },
  },
  {
    trigger: {
      category: 'bodywork',
      symptoms: ['rayure', 'bosse', 'éraflure', 'choc', 'peinture'],
    },
    result: {
      title: 'Retouche Carrosserie / Peinture',
      confidence: 90,
      severity: 'can-wait',
      costRange: { min: 80, max: 300 },
      explanation:
        'Dommages esthétiques sur la carrosserie nécessitant une intervention de carrosserie-peinture. Le coût varie selon la taille et la profondeur des dommages. Une retouche localisée peut suffire pour les petites rayures.',
      recommendations: [
        'Retouche localisée pour petites rayures (80-120 TND)',
        'Débosselage sans peinture si possible',
        "Peinture complète d'élément si dommage important",
        "Délai: 1-3 jours selon l'étendue",
      ],
    },
  },
  {
    trigger: {
      category: 'glass',
      symptoms: ['pare-brise', 'fissure', 'éclat', 'vitre', 'impact'],
    },
    result: {
      title: 'Réparation Pare-brise (Impact/Fissure)',
      confidence: 95,
      severity: 'moderate',
      costRange: { min: 50, max: 400 },
      explanation:
        'Un impact ou une fissure sur le pare-brise nécessite une intervention rapide. Les impacts de moins de 2cm de diamètre peuvent être réparés (50-80 TND). Les fissures plus grandes nécessitent un remplacement complet du pare-brise.',
      recommendations: [
        'Réparation possible si impact < 2cm (50-80 TND)',
        'Remplacement si fissure > 2cm ou dans le champ de vision',
        "Intervention urgente - risque d'extension de la fissure",
        'Couverture possible par assurance tous risques',
      ],
    },
  },
];

export const technicians = [
  {
    id: 1,
    name: 'Mohamed Bennour',
    rating: 4.8,
    reviews: 127,
    specializations: ['Mécanique Générale', 'Freinage', 'Suspension'],
    experience: 8,
    photo: 'https://i.pravatar.cc/150?img=12',
    location: 'Tunis Centre',
    availability: "Aujourd'hui 14:00-18:00",
    description:
      'Expert en diagnostic et réparation mécanique. Spécialisé dans les véhicules français.',
  },
  {
    id: 2,
    name: 'Karim Trabelsi',
    rating: 4.9,
    reviews: 203,
    specializations: ['Électricité Auto', 'Diagnostic Électronique', 'Climatisation'],
    experience: 12,
    photo: 'https://i.pravatar.cc/150?img=33',
    location: 'Ariana',
    availability: 'Demain 09:00-17:00',
    description:
      'Spécialiste en systèmes électriques et électroniques modernes. Certification constructeur.',
  },
  {
    id: 3,
    name: 'Slim Hajri',
    rating: 4.7,
    reviews: 89,
    specializations: ['Carrosserie', 'Peinture', 'Débosselage'],
    experience: 10,
    photo: 'https://i.pravatar.cc/150?img=51',
    location: 'Manouba',
    availability: "Aujourd'hui 10:00-16:00",
    description: 'Expert en carrosserie et peinture. Travail soigné et garantie qualité.',
  },
  {
    id: 4,
    name: 'Yassine Abdelli',
    rating: 4.9,
    reviews: 156,
    specializations: ['Moteur', 'Injection', 'Turbo'],
    experience: 15,
    photo: 'https://i.pravatar.cc/150?img=68',
    location: 'La Marsa',
    availability: 'Demain 08:00-14:00',
    description: "Maître artisan en mécanique moteur. 15 ans d'expérience sur toutes marques.",
  },
  {
    id: 5,
    name: 'Mehdi Touati',
    rating: 4.6,
    reviews: 74,
    specializations: ['Pneumatiques', 'Parallélisme', 'Équilibrage'],
    experience: 6,
    photo: 'https://i.pravatar.cc/150?img=15',
    location: 'Soukra',
    availability: "Aujourd'hui 13:00-19:00",
    description: 'Spécialiste pneus et géométrie. Service rapide et prix compétitifs.',
  },
];

export const garages = [
  {
    id: 1,
    name: 'Garage Elite Auto',
    address: 'Avenue Habib Bourguiba, Tunis 1000',
    rating: 4.9,
    reviews: 234,
    distance: '2.3 km',
    services: ['Mécanique Générale', 'Carrosserie', 'Électricité', 'Climatisation'],
    priceRange: '$$',
    photos: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
      'https://images.unsplash.com/photo-1632823469850-1b4945858105?w=400',
    ],
    description:
      "Garage multimarque avec équipement moderne. Agréé par les principales compagnies d'assurance.",
    availableSlots: ['Demain 09:00', 'Demain 14:00', 'Lundi 10:00'],
    phone: '+216 71 234 567',
  },
  {
    id: 2,
    name: 'Auto Service Carthage',
    address: 'Route de La Marsa, Carthage 2016',
    rating: 4.7,
    reviews: 187,
    distance: '5.1 km',
    services: ['Mécanique', 'Diagnostic Électronique', 'Vidange Express'],
    priceRange: '$',
    photos: ['https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400'],
    description: 'Spécialiste Renault et Peugeot. Service rapide et efficace.',
    availableSlots: ["Aujourd'hui 15:00", 'Demain 08:00', 'Demain 16:00'],
    phone: '+216 71 456 789',
  },
  {
    id: 3,
    name: 'Garage Prestige Ariana',
    address: 'Centre Commercial Ariana, Ariana 2080',
    rating: 4.8,
    reviews: 312,
    distance: '3.7 km',
    services: ['Carrosserie', 'Peinture', 'Pare-brise', 'Polissage'],
    priceRange: '$$$',
    photos: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400',
    ],
    description: 'Expert en carrosserie haut de gamme. Cabine de peinture climatisée.',
    availableSlots: ['Lundi 09:00', 'Mardi 10:00', 'Mercredi 14:00'],
    phone: '+216 71 789 123',
  },
  {
    id: 4,
    name: 'Mécanique Ben Arous',
    address: 'Zone Industrielle, Ben Arous 2013',
    rating: 4.5,
    reviews: 156,
    distance: '8.2 km',
    services: ['Moteur', 'Boîte de Vitesse', 'Embrayage', 'Freinage'],
    priceRange: '$',
    photos: ['https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400'],
    description: 'Spécialiste mécanique lourde. Prix compétitifs.',
    availableSlots: ['Demain 10:00', 'Samedi 08:00', 'Samedi 13:00'],
    phone: '+216 71 321 654',
  },
  {
    id: 5,
    name: 'Auto Diagnostic Center',
    address: 'Avenue de la République, Manouba 2010',
    rating: 4.9,
    reviews: 278,
    distance: '4.5 km',
    services: ['Diagnostic Électronique', 'Programmation', 'Électricité', 'Injection'],
    priceRange: '$$',
    photos: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400'],
    description:
      'Centre de diagnostic haute technologie. Équipement professionnel de dernière génération.',
    availableSlots: ["Aujourd'hui 16:00", 'Demain 09:00', 'Demain 11:00'],
    phone: '+216 71 567 890',
  },
];

export const serviceTiers = [
  {
    id: 1,
    level: 'AI Inspection',
    price: { min: 0, max: 0, isFree: true },
    icon: 'brain',
    color: 'emerald',
    features: [
      'Diagnostic IA instantané',
      'Analyse de 100 000+ cas',
      'Rapport détaillé PDF',
      'Estimation de coût',
      'Recommandations prioritaires',
    ],
    description:
      'Obtenez un diagnostic précis en quelques secondes grâce à notre intelligence artificielle.',
    badge: 'Gratuit',
  },
  {
    id: 2,
    level: 'Service à Distance',
    price: { min: 15, max: 30 },
    icon: 'video',
    color: 'brand-blue',
    features: [
      'Consultation vidéo avec expert',
      'Diagnostic approfondi en direct',
      'Conseils personnalisés',
      'Support après diagnostic',
      'Durée: 15-30 minutes',
    ],
    description:
      'Consultation vidéo en direct avec un expert certifié pour un diagnostic et guidage personnalisé.',
    badge: 'Expert en Ligne',
  },
  {
    id: 3,
    level: 'Technicien Mobile',
    price: { min: 50, max: 150 },
    icon: 'truck',
    color: 'brand-orange',
    features: [
      'Déplacement à votre adresse',
      'Diagnostic sur place',
      'Petites réparations possibles',
      'Outils professionnels',
      'Disponible 7j/7',
    ],
    description:
      'Un technicien qualifié se déplace chez vous avec ses outils pour diagnostiquer et réparer.',
    badge: 'À Domicile',
  },
  {
    id: 4,
    level: 'Garage Partenaire',
    price: { min: 100, max: 300 },
    icon: 'building',
    color: 'brand-navy',
    features: [
      'Réparation complète en atelier',
      'Équipement professionnel',
      'Garantie des travaux',
      "Pièces d'origine disponibles",
      'Réseau de 50+ garages',
    ],
    description: "Réparation professionnelle dans l'un de nos garages partenaires certifiés.",
    badge: 'Pro Atelier',
  },
];

// User's vehicles
export const userVehicles = [
  {
    id: 1,
    brand: 'Renault',
    model: 'Symbol',
    year: 2019,
    licensePlate: '198 TU 4521',
    mileage: 67420,
    color: 'Blanc',
    fuelType: 'Essence',
    lastServiceDate: '2024-11-15',
    healthScore: 87,
    nextMaintenanceKm: 5420,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    isDefault: true,
    services: [
      { date: '2024-11-15', service: 'Vidange Complète', cost: 85 },
      { date: '2024-09-22', service: 'Plaquettes de Frein', cost: 180 },
      { date: '2024-07-10', service: 'Climatisation', cost: 90 },
    ],
    reminders: [
      { type: 'urgent', title: 'Vidange Moteur', dueIn: '420 km' },
      { type: 'upcoming', title: 'Contrôle Technique', dueIn: '45 jours' },
    ],
  },
  {
    id: 2,
    brand: 'Peugeot',
    model: '208',
    year: 2021,
    licensePlate: '205 TU 7832',
    mileage: 32150,
    color: 'Gris',
    fuelType: 'Diesel',
    lastServiceDate: '2024-10-05',
    healthScore: 94,
    nextMaintenanceKm: 12800,
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    isDefault: false,
    services: [
      { date: '2024-10-05', service: 'Révision Complète', cost: 220 },
      { date: '2024-06-18', service: 'Pneus Neufs', cost: 480 },
    ],
    reminders: [{ type: 'info', title: 'Filtre à Air', dueIn: '5 200 km' }],
  },
];

export const dashboardStats = {
  vehicleHealthScore: 87,
  nextMaintenanceKm: 5420,
  servicesCompleted: 12,
  moneySpent: 2340,
};

export const maintenanceReminders = [
  {
    id: 1,
    type: 'urgent',
    title: 'Vidange Moteur',
    dueIn: '420 km',
    dueDate: '2025-01-15',
    description: 'Vidange recommandée tous les 10 000 km',
    estimatedCost: '60-80 TND',
  },
  {
    id: 2,
    type: 'upcoming',
    title: 'Contrôle Technique',
    dueIn: '45 jours',
    dueDate: '2025-02-10',
    description: 'Contrôle technique annuel obligatoire',
    estimatedCost: '30 TND',
  },
  {
    id: 3,
    type: 'info',
    title: 'Remplacement Filtre à Air',
    dueIn: '8 240 km',
    dueDate: '2025-03-20',
    description: 'Recommandé tous les 20 000 km',
    estimatedCost: '25-40 TND',
  },
];

export const serviceHistory = [
  {
    id: 1,
    date: '2024-11-15',
    service: 'Vidange Complète + Filtres',
    garage: 'Garage Elite Auto',
    cost: 85,
    status: 'completed',
    technician: 'Mohamed Bennour',
  },
  {
    id: 2,
    date: '2024-09-22',
    service: 'Remplacement Plaquettes de Frein',
    garage: 'Auto Service Carthage',
    cost: 180,
    status: 'completed',
    technician: 'Karim Trabelsi',
  },
  {
    id: 3,
    date: '2024-07-10',
    service: 'Recharge Climatisation',
    garage: 'Garage Elite Auto',
    cost: 90,
    status: 'completed',
    technician: 'Mohamed Bennour',
  },
  {
    id: 4,
    date: '2024-05-05',
    service: 'Parallélisme + Équilibrage',
    garage: 'Garage Prestige Ariana',
    cost: 65,
    status: 'completed',
    technician: 'Mehdi Touati',
  },
];

// Helper function to simulate AI diagnosis
export const simulateAIDiagnosis = async (vehicleData, symptoms, category) => {
  // Simulate AI processing delay (3-4 seconds)
  await new Promise((resolve) => setTimeout(resolve, 3500));

  // Find matching scenario based on category and symptoms
  const symptomsText = symptoms.join(' ').toLowerCase();
  const scenario = diagnosisScenarios.find((s) => {
    if (s.trigger.category !== category) return false;
    return s.trigger.symptoms.some((keyword) => symptomsText.includes(keyword.toLowerCase()));
  });

  // Return matched scenario or generic diagnosis
  if (scenario) {
    return scenario.result;
  }

  // Generic fallback diagnosis
  return {
    title: 'Diagnostic Nécessitant Inspection',
    confidence: 75,
    severity: 'moderate',
    costRange: { min: 50, max: 150 },
    explanation:
      'Les symptômes décrits nécessitent une inspection plus approfondie pour un diagnostic précis. Nous recommandons une consultation avec un de nos experts.',
    recommendations: [
      'Inspection visuelle recommandée',
      'Diagnostic électronique si voyant allumé',
      'Consultation avec technicien mobile ou garage',
      'Devis gratuit disponible',
    ],
  };
};

// Active Services (Tracking)
export const activeServices = [
  {
    id: 'SRV-2025-001',
    type: 'mobile',
    status: 'en_route',
    createdAt: '2025-12-29T08:00:00Z',
    updatedAt: '2025-12-29T09:15:00Z',
    scheduledDate: '2025-12-29',
    scheduledTime: '10:00',

    vehicle: {
      id: 1,
      brand: 'Renault',
      model: 'Symbol',
      year: 2019,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=300',
    },

    technician: {
      id: 1,
      name: 'Karim Trabelsi',
      photo: 'https://i.pravatar.cc/150?img=12',
      phone: '+216 98 123 456',
      rating: 4.8,
    },

    problem: {
      category: 'Moteur / Mécanique',
      description: "Bruit étrange au niveau du moteur lors de l'accélération",
    },

    location: {
      address: 'Ariana, Avenue de la République',
      current: { lat: 36.8589, lng: 10.1896 },
      destination: { lat: 36.8989, lng: 10.1896 },
      eta: '2025-12-29T09:45:00Z',
    },

    timeline: [
      {
        status: 'confirmed',
        timestamp: '2025-12-29T08:00:00Z',
        title: 'Réservation Confirmée',
        message: 'Votre demande de service mobile a été confirmée',
        icon: 'check-circle',
        completed: true,
      },
      {
        status: 'technician_assigned',
        timestamp: '2025-12-29T08:05:00Z',
        title: 'Technicien Assigné',
        message: 'Karim Trabelsi vous a été assigné',
        icon: 'user',
        completed: true,
      },
      {
        status: 'en_route',
        timestamp: '2025-12-29T09:15:00Z',
        title: 'En Route',
        message: 'Le technicien est en route vers votre adresse',
        icon: 'navigation',
        completed: false,
        active: true,
      },
      {
        status: 'arrived',
        timestamp: null,
        title: 'Arrivé sur Place',
        message: 'Le technicien est arrivé à votre adresse',
        icon: 'map-pin',
        completed: false,
      },
      {
        status: 'diagnostic',
        timestamp: null,
        title: 'Diagnostic en Cours',
        message: 'Diagnostic du problème en cours',
        icon: 'search',
        completed: false,
      },
      {
        status: 'completed',
        timestamp: null,
        title: 'Service Terminé',
        message: 'Service terminé avec succès',
        icon: 'check-circle',
        completed: false,
      },
    ],

    diagnosis: null,
    invoice: null,
  },

  {
    id: 'SRV-2025-002',
    type: 'garage',
    status: 'diagnosis_complete',
    createdAt: '2025-12-28T14:00:00Z',
    updatedAt: '2025-12-29T10:30:00Z',
    scheduledDate: '2025-12-28',
    scheduledTime: '15:00',

    vehicle: {
      id: 2,
      brand: 'Peugeot',
      model: '208',
      year: 2020,
      image: 'https://images.unsplash.com/photo-1583267746897-9cf94ce1b4b0?w=300',
    },

    garage: {
      id: 1,
      name: 'Garage Elite Auto',
      address: 'Avenue Habib Bourguiba, Tunis',
      phone: '+216 71 123 456',
      rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    },

    problem: {
      category: 'Système Électrique',
      description: 'Batterie qui se décharge rapidement, problèmes de démarrage',
    },

    timeline: [
      {
        status: 'confirmed',
        timestamp: '2025-12-28T14:00:00Z',
        title: 'Réservation Confirmée',
        message: 'Votre réservation au garage a été confirmée',
        icon: 'check-circle',
        completed: true,
      },
      {
        status: 'vehicle_received',
        timestamp: '2025-12-28T15:10:00Z',
        title: 'Véhicule Reçu',
        message: 'Votre véhicule a été pris en charge par le garage',
        icon: 'clipboard-check',
        completed: true,
      },
      {
        status: 'diagnosis_in_progress',
        timestamp: '2025-12-28T15:30:00Z',
        title: 'Diagnostic en Cours',
        message: 'Le diagnostic de votre véhicule est en cours',
        icon: 'search',
        completed: true,
      },
      {
        status: 'diagnosis_complete',
        timestamp: '2025-12-29T10:30:00Z',
        title: 'Diagnostic Terminé',
        message: "Le diagnostic est terminé. En attente d'approbation du devis",
        icon: 'clipboard-list',
        completed: false,
        active: true,
      },
      {
        status: 'repair_in_progress',
        timestamp: null,
        title: 'Réparation en Cours',
        message: 'Réparation de votre véhicule en cours',
        icon: 'tool',
        completed: false,
      },
      {
        status: 'ready_for_pickup',
        timestamp: null,
        title: 'Prêt pour Récupération',
        message: 'Votre véhicule est prêt à être récupéré',
        icon: 'check-circle',
        completed: false,
      },
    ],

    diagnosis: {
      completed: true,
      title: 'Alternateur Défectueux + Batterie Faible',
      description:
        "L'alternateur ne charge plus correctement la batterie. La batterie elle-même est également en fin de vie et nécessite un remplacement.",
      severity: 'urgent',
      photos: [
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
        'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400',
      ],
      estimatedCost: { min: 320, max: 380 },
      partsNeeded: [
        { name: 'Alternateur', price: 180, quantity: 1 },
        { name: 'Batterie 12V 60Ah', price: 85, quantity: 1 },
        { name: "Courroie d'accessoires", price: 25, quantity: 1 },
      ],
      laborCost: { hours: 2.5, rate: 30, total: 75 },
      totalCost: 365,
      recommendations: [
        'Remplacement immédiat recommandé',
        'Éviter les trajets longs avant réparation',
        'Vérifier le système de charge après réparation',
      ],
    },

    estimate: {
      status: 'pending_approval',
      totalCost: 365,
      validUntil: '2025-12-31T23:59:59Z',
      approvedAt: null,
    },

    invoice: null,
  },
];
