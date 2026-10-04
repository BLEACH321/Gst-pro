/**
 * GST Sahayak - AI HSN/SAC Suggestion & Product Intelligence Engine
 * Provides context-aware HSN/SAC codes, descriptions, and standard GST rates.
 */

export const HSN_DATABASE = [
  {
    hsnSac: "84713010",
    name: "Laptops & Notebooks (including ASUS TUF, MacBook, ThinkPad, Dell XPS)",
    category: "Electronics & IT Hardware",
    gstRate: 18.0,
    unit: "PCS",
    description: "Portable digital automatic data processing machines not exceeding 10 kg, with CPU, keyboard and display.",
    keywords: ["laptop", "asus tuf", "notebook", "macbook", "computer", "gaming laptop", "thinkpad", "dell"]
  },
  {
    hsnSac: "84714190",
    name: "Desktop Computers & Workstations",
    category: "Electronics & IT Hardware",
    gstRate: 18.0,
    unit: "PCS",
    description: "Other automatic data processing units, personal computers and workstations.",
    keywords: ["desktop", "pc", "workstation", "cpu", "cabinet", "all-in-one"]
  },
  {
    hsnSac: "85171300",
    name: "Smartphones & Mobile Handsets",
    category: "Telecommunications & Mobile",
    gstRate: 18.0,
    unit: "PCS",
    description: "Smartphones for cellular networks.",
    keywords: ["smartphone", "mobile", "iphone", "samsung", "oneplus", "phone", "cellular"]
  },
  {
    hsnSac: "85285200",
    name: "Computer Monitors & LED Displays",
    category: "Electronics & IT Hardware",
    gstRate: 18.0,
    unit: "PCS",
    description: "Monitors capable of connecting directly to and designed for data processing machines.",
    keywords: ["monitor", "display", "screen", "led screen", "gaming monitor", "4k monitor"]
  },
  {
    hsnSac: "84433200",
    name: "Laser & Inkjet Printers / Multifunction Devices",
    category: "Office Equipment",
    gstRate: 18.0,
    unit: "PCS",
    description: "Other printers, copying machines and facsimile machines.",
    keywords: ["printer", "scanner", "laser printer", "inkjet", "photocopier", "epson", "hp printer"]
  },
  {
    hsnSac: "998313",
    name: "IT Technical Consulting & Software Engineering Services",
    category: "Professional Services",
    gstRate: 18.0,
    unit: "HRS",
    description: "Information technology (IT) consulting, application design, coding, maintenance, and cloud architecture services.",
    keywords: ["software", "development", "coding", "consulting", "web development", "cloud", "saas", "api integration", "devops"]
  },
  {
    hsnSac: "998314",
    name: "Cloud Hosting, Server Maintenance & Database Management Services",
    category: "Information Technology",
    gstRate: 18.0,
    unit: "MTH",
    description: "Hosting and data infrastructure provisioning, managed VPS, and database administration.",
    keywords: ["hosting", "aws", "cloud hosting", "server", "domain", "storage", "infrastructure"]
  },
  {
    hsnSac: "998211",
    name: "Legal Advisory & Representation Services",
    category: "Professional Services",
    gstRate: 18.0,
    unit: "SRV",
    description: "Legal advisory, draft verification, and statutory legal representation services.",
    keywords: ["legal", "advocate", "lawyer", "drafting", "attorney", "contract review"]
  },
  {
    hsnSac: "998311",
    name: "Accounting, Bookkeeping & GST Tax Audit Services",
    category: "Financial & Accounting",
    gstRate: 18.0,
    unit: "SRV",
    description: "Statutory auditing, financial record bookkeeping, and tax compliance consultancy.",
    keywords: ["accounting", "ca", "audit", "tax filing", "bookkeeping", "gst filing", "chartered accountant"]
  },
  {
    hsnSac: "94031000",
    name: "Ergonomic Office Chairs & Metal Furniture",
    category: "Office Supplies & Furniture",
    gstRate: 18.0,
    unit: "PCS",
    description: "Office furniture, adjustable ergonomic desk chairs and swivel chairs.",
    keywords: ["chair", "office chair", "furniture", "desk", "table", "ergonomic chair"]
  },
  {
    hsnSac: "84151010",
    name: "Inverter Air Conditioners (Split / Window)",
    category: "Home & Commercial Appliances",
    gstRate: 28.0,
    unit: "PCS",
    description: "Air conditioning machines, comprising a motor-driven fan and elements for changing the temperature and humidity.",
    keywords: ["ac", "air conditioner", "split ac", "window ac", "cooling", "hvac", "inverter ac"]
  },
  {
    hsnSac: "48201090",
    name: "Registers, Account Books & Executive Notebooks",
    category: "Stationery & Office Supplies",
    gstRate: 12.0,
    unit: "PCS",
    description: "Stationery stationery registers, notebooks, order books and receipt pads.",
    keywords: ["stationery", "notebook", "paper", "register", "diary", "office supplies", "pad"]
  },
  {
    hsnSac: "85044090",
    name: "Power Inverters, Converters & UPS Power Supplies",
    category: "Power Electronics",
    gstRate: 18.0,
    unit: "PCS",
    description: "Static converters, power adapters and uninterrupted power supply (UPS) systems.",
    keywords: ["ups", "inverter", "power supply", "adapter", "battery backup", "smps"]
  },
  {
    hsnSac: "72142090",
    name: "TMT Steel Rebars (High Strength Deformed Bars)",
    category: "Construction & Industrial",
    gstRate: 18.0,
    unit: "KGS",
    description: "Bars and rods of iron or non-alloy steel, containing indentations, ribs or grooves.",
    keywords: ["steel", "tmt", "rebar", "iron bar", "construction steel", "sariya"]
  },
  {
    hsnSac: "25232910",
    name: "Portland Cement (Grade 43 / 53)",
    category: "Building Materials",
    gstRate: 28.0,
    unit: "BAG",
    description: "Ordinary Portland Cement for building and civil engineering construction.",
    keywords: ["cement", "portland cement", "ultratech", "ambuja", "concrete", "bag"]
  },
  {
    hsnSac: "87038000",
    name: "Electric Motor Vehicles / EV Cars",
    category: "Automotive",
    gstRate: 5.0,
    unit: "PCS",
    description: "Motor vehicles for transport of persons, propelled solely by electric motor.",
    keywords: ["ev", "electric car", "electric vehicle", "tata nexon ev", "battery vehicle"]
  }
];

/**
 * Searches the HSN database using fuzzy keyword matches and returns suggested HSN, rate, and confidence score.
 * @param {string} query User query (e.g., "ASUS TUF A16", "Laptop", "Software Dev")
 * @returns {Array} List of suggestions with confidence and verified flag
 */
export function suggestHsnSac(query) {
  if (!query || query.trim().length === 0) return [];
  
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,_\-]+/).filter(Boolean);

  const scored = HSN_DATABASE.map(entry => {
    let score = 0;
    
    // Exact name match
    if (entry.name.toLowerCase().includes(cleanQuery)) score += 50;
    
    // Keyword match
    entry.keywords.forEach(kw => {
      if (cleanQuery.includes(kw) || kw.includes(cleanQuery)) {
        score += 35;
      }
      queryTokens.forEach(token => {
        if (kw.includes(token)) score += 15;
      });
    });

    // Code direct match
    if (entry.hsnSac.startsWith(cleanQuery)) score += 60;

    return {
      ...entry,
      score
    };
  });

  const sorted = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  return sorted.slice(0, 4).map(item => {
    let confidence = "Medium";
    if (item.score >= 45) confidence = "High";
    else if (item.score < 25) confidence = "Low";

    return {
      hsnSac: item.hsnSac,
      suggestedName: item.name,
      category: item.category,
      gstRate: item.gstRate,
      unit: item.unit,
      description: item.description,
      confidence,
      score: item.score,
      requiresVerification: true // Explicitly forces human verification workflow
    };
  });
}
