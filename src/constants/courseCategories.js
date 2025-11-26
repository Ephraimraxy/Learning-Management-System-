export const PROGRAM_STRUCTURE = [
  {
    value: 'crop-production-value-chains',
    label: '🌱 Crop Production & Value Chains',
    description: 'Field production, value chains, protected cultivation, marketing, and export readiness.',
    modules: [
      {
        id: 'field-crop-production',
        label: 'Field Crop Production',
        description: 'Hands-on cereal and legume production with deep dives into staple value chains.',
        courses: [
          { title: 'Field Crop Production 1 (Rice & Maize Value Chain)' },
          { title: 'Field Crop Production 2 (Soybeans Value Chain)' },
        ],
      },
      {
        id: 'ag-value-chain-export',
        label: 'Agricultural Value Chain & Export',
        description: 'Systems thinking for farm-to-market logistics, value addition, and export readiness.',
        courses: [
          { title: 'Agricultural Value Chain (Classroom Lecture)' },
          { title: 'Value Addition & Export' },
        ],
      },
      {
        id: 'protected-specialty-production',
        label: 'Protected & Specialty Production',
        description: 'High-value horticulture and market-focused production systems.',
        courses: [
          { title: 'Vegetable Production in Greenhouse and Hydroponics' },
          { title: 'Marketing of Agriproducts and Agribusinesses (Cowpea focus)' },
        ],
      },
    ],
  },
  {
    value: 'livestock-aquaculture',
    label: '🐟🐓 Livestock & Aquaculture',
    description: 'Technical foundations for fish, poultry, and ruminant production systems.',
    modules: [
      {
        id: 'aquaculture-systems',
        label: 'Aquaculture Systems',
        description: 'Commercial fish farming with emphasis on catfish production economics.',
        courses: [{ title: 'Catfish Farming (Classroom Lecture)' }],
      },
      {
        id: 'poultry-systems',
        label: 'Poultry Systems',
        description: 'Efficient poultry production and management best practices.',
        courses: [{ title: 'Poultry Production (Classroom Lecture)' }],
      },
      {
        id: 'ruminant-systems',
        label: 'Ruminant Systems',
        description: 'Fattening operations for cattle, sheep, and goats focused on feed conversion.',
        courses: [{ title: 'Ruminant Fattening (Classroom Lecture)' }],
      },
    ],
  },
  {
    value: 'agribusiness-finance',
    label: '💻📊 Agribusiness & Finance',
    description: 'Entrepreneurship, finance, and digital capabilities for scaling agribusiness ventures.',
    modules: [
      {
        id: 'entrepreneurship-digital',
        label: 'Entrepreneurship & Digital Agribusiness',
        description: 'Building, digitizing, and financing agribusiness ventures end-to-end.',
        courses: [
          { title: 'Entrepreneurship Development in Agribusiness (Classroom Lecture)' },
          { title: 'Digital Agribusiness (Classroom Lecture)' },
          { title: 'Financing Agribusiness (Classroom Lecture)' },
        ],
      },
      {
        id: 'agribusiness-foundations',
        label: 'Agribusiness Foundations',
        description: 'Market sizing, customer development, and product-market fit for agribusinesses.',
        courses: [
          { title: 'Introduction to Agribusiness' },
          { title: 'Marketing of Agriproducts and Agribusinesses (Classroom Lecture)' },
        ],
      },
    ],
  },
  {
    value: 'farm-technology-practical-skills',
    label: '🚜 Farm Technology & Practical Skills',
    description: 'Hands-on learning covering irrigation, mechanization, seminars, and program milestones.',
    modules: [
      {
        id: 'mechanization-irrigation',
        label: 'Mechanization & Irrigation',
        description: 'Efficient water management and machinery operations for modern farms.',
        courses: [{ title: 'Farm Irrigation and Machinery (Lecture)' }],
      },
      {
        id: 'immersive-practical',
        label: 'Immersive Practical Sessions',
        description: 'Multi-day on-site practicals translating classroom instruction into field execution.',
        courses: [{ title: 'Onsite Practical Sessions (multiple days)' }],
      },
      {
        id: 'capstone-milestones',
        label: 'Seminar & Program Milestones',
        description: 'Reflection moments, seminars, and graduation checkpoints.',
        courses: [
          { title: 'Seminar' },
          { title: 'Graduation CEC' },
        ],
      },
    ],
  },
  {
    value: 'leadership-personal-development',
    label: '🧑‍💼 Leadership & Personal Development',
    description: 'Professional development and leadership mindset for sustainable impact.',
    modules: [
      {
        id: 'leadership-foundations',
        label: 'Leadership Foundations',
        description: 'Practical leadership skills for managing teams, stakeholders, and partners.',
        courses: [{ title: 'Leadership Skill Development (Classroom Lecture)' }],
      },
      {
        id: 'visioning-mindset',
        label: 'Visioning & Personal Mastery',
        description: 'Mindset design and purpose discovery for high-impact agricultural careers.',
        courses: [{ title: 'Power of Vision (Opening Ceremony session)' }],
      },
    ],
  },
];

export const COURSE_CATEGORIES = PROGRAM_STRUCTURE.map(({ value, label, description }) => ({
  value,
  label,
  description,
}));

export const CATEGORY_MODULE_MAP = PROGRAM_STRUCTURE.reduce((acc, category) => {
  acc[category.value] = category.modules;
  return acc;
}, {});

export const MODULE_LOOKUP = PROGRAM_STRUCTURE.reduce((acc, category) => {
  category.modules.forEach((module) => {
    acc[module.id] = { ...module, category: category.value };
  });
  return acc;
}, {});
