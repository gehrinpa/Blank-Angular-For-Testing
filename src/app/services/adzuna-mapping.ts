export function nutsToAdzunaLocation(nutsCode) {
    const nuts1Map = {
        "UKC": "North East England",
        "UKD": "North West England",
        "UKE": "Yorkshire and the Humber",
        "UKF": "East Midlands",
        "UKG": "West Midlands",
        "UKH": "Eastern England",
        "UKI": "London",
        "UKJ": "South East England",
        "UKK": "South West England",
        "UKL": "Wales",
        "UKM": "Scotland",
        "UKN": "Northern Ireland",
        "CHI": "Channel Isles"
    };

    const ret = ["UK"];

    if (!nutsCode || nutsCode == "UK") {
        return ret;
    }

    if (nuts1Map[nutsCode] !== undefined) {
        ret.push(nuts1Map[nutsCode]);
    }

    return ret;
}

export function sectortoLimitedCategory(sector: string, invert?: boolean) {
    const categories = {
        "digital tech": "it-jobs",
        "all sectors": "all_sectors",
        "financial services": "accounting-finance-jobs",
        "healthcare": "healthcare-nursing-jobs",
        "construction": "trade-construction-jobs",
        "goods and services": "goods-services-jobs",
        "teaching": "teaching-jobs",
        "pr, marketing and advertising": "pr-advertising-marketing-jobs",
        "government administration": "admin-jobs",
        "oil & energy": "energy-oil-gas-jobs",
        "management consulting": "consultancy-jobs",
        "creative and design": "creative-design-jobs",
        "hospitality": "hospitality-catering-jobs",
        "human resources and recruiting": "hr-jobs",
        "real estate": "property-jobs",
        "law practice": "legal-jobs",
        "mechanical or industrial engineering": "engineering-jobs",
        "nonprofit organization management": "charity-voluntary-jobs",
        "logistics and warehouse": "logistics-warehouse-jobs",
        "manufacturing": "manufacturing-jobs",
        "logistics and supply chain": "logistics-warehouse-jobs",
        "writing and editing": "creative-design-jobs",
        "civic & social organization": "social-work-jobs",
        "defense & space": "scientific-qa-jobs",
        "law enforcement": "law-enforcement-jobs",
        "agriculture": "agriculture-jobs",
        "public sector jobs": "public-sector-jobs",
        "general jobs": "other-general-jobs",
        "cleaning jobs": "domestic-help-cleaning-jobs",
        "graduate jobs": "graduate-jobs"
    };

    if (invert)
        return Object.keys(categories).find(key => categories[key] === sector.toLowerCase()) || null;
    else
        return categories[sector.toLowerCase()] || null;
}

export function sectorToAdzunaCategory(sector: string, invert?: boolean) {
    const categories = {
        "digital tech": "it-jobs",
        "maritime": "maritime",
        "all sectors": "all_sectors",
        "financial services": "accounting-finance-jobs",
        "healthcare": "healthcare-nursing-jobs",
        "construction": "trade-construction-jobs",
        "retail": "goods-services-jobs",
        "education management": "teaching-jobs",
        "marketing and advertising": "pr-advertising-marketing-jobs",
        "health, wellness and fitness": null,
        "government administration": "admin-jobs",
        "oil & energy": "energy-oil-gas-jobs",
        "higher education": "teaching-jobs",
        "management consulting": "consultancy-jobs",
        "design": "creative-design-jobs",
        "hospitality": "hospitality-catering-jobs",
        "human resources": "hr-jobs",
        "automotive": "engineering-jobs",
        "telecommunications": null,
        "research": null,
        "real estate": "property-jobs",
        "law practice": "legal-jobs",
        "food & beverages": "hospitality-catering-jobs",
        "arts and crafts": null,
        "mechanical or industrial engineering": "engineering-jobs",
        "nonprofit organization management": "charity-voluntary-jobs",
        "music": null,
        "insurance": null,
        "staffing and recruiting": "hr-jobs",
        "pharmaceuticals": null,
        "leisure, travel & tourism": null,
        "transportation/trucking/railroad": "logistics-warehouse-jobs",
        "electrical/electronic manufacturing": "manufacturing-jobs",
        "entertainment": null,
        "sports": null,
        "architecture & planning": null,
        "media production": null,
        "civil engineering": "engineering-jobs",
        "logistics and supply chain": "logistics-warehouse-jobs",
        "legal services": "legal-jobs",
        "primary/secondary education": "teaching-jobs",
        "food production": "hospitality-catering-jobs",
        "apparel & fashion": "goods-services-jobs",
        "airlines/aviation": null,
        "environmental services": null,
        "events services": "hospitality-catering-jobs",
        "professional training & coaching": null,
        "facilities services": null,
        "goods and services": "goods-services-jobs",
        "writing and editing": "creative-design-jobs",
        "consumer services": "goods-services-jobs",
        "broadcast media": null,
        "public relations and communications": "pr-advertising-marketing-jobs",
        "utilities": "energy-oil-gas-jobs",
        "restaurants": "hospitality-catering-jobs",
        "publishing": null,
        "security and investigations": null,
        "photography": "creative-design-jobs",
        "building materials": "trade-construction-jobs",
        "aviation & aerospace": null,
        "mental health care": "healthcare-nursing-jobs",
        "chemicals": null,
        "cosmetics": null,
        "graphic design": "creative-design-jobs",
        "business supplies and equipment": "logistics-warehouse-jobs",
        "military": null,
        "civic & social organization": "social-work-jobs",
        "performing arts": "creative-design-jobs",
        "individual & family services": "social-work-jobs",
        "printing": "creative-design-jobs",
        "biotechnology": null,
        "defense & space": "scientific-qa-jobs",
        "medical devices": null,
        "renewables & environment": null,
        "wholesale": "goods-services-jobs",
        "law enforcement": "law-enforcement-jobs",
        "fine art": "creative-design-jobs",
        "agriculture": "agriculture-jobs",
        "public sector jobs": "public-sector-jobs",
        "general jobs": "other-general-jobs",
        "cleaning jobs": "domestic-help-cleaning-jobs",
        "graduate jobs": "graduate-jobs"
    };

    if (invert)
        return Object.keys(categories).find(key => categories[key] === sector.toLowerCase()) || null;
    else
        return categories[sector.toLowerCase()] || null;
}

export interface CategoriesMap { [key: string]: string; };
export interface CategoriesTypeaheadData { key: string; value: string; };

export const ADZUNA_JOB_SIC_JERSEY: CategoriesMap = {
    "EDUCATION, HEALTH AND OTHER SERVICES": "Education, Health and Other Services",
    "AGRICULTURE AND FISHING": "Agriculture and Fishing",
    "TRANSPORTATION AND STORAGE": "Transportation and Storage",
    "FINANCIAL AND LEGAL ACTIVITIES": "Financial and Legal",
    "INFORMATION AND COMMUNICATION": "Information and Communication",
    "UTILITIES AND WASTE": "Utilities and Waste",
    "CONSTRUCTION AND QUARRYING": "Construction and Quarrying",
    "MISCELLANEOUS BUSINESS ACTIVITIES": "Misc Business Activities",
    "MANUFACTURING": "Manufacturing",
    "PUBLIC SECTOR": "Public Sector",
    "HOTELS, RESTAURANTS AND BARS": "Hotels, Restaurants and Bars",
    "WHOLESALE AND RETAIL": "Wholesale and Retail"
}

export const ADZUNA_JOB_SIC_UK: CategoriesMap = {
    "A: AGRICULTURE, FORESTRY AND FISHING": "Agriculture, forestry and fishing",
    "B: MINING AND QUARRYING": "Mining and quarrying",
    "C: MANUFACTURING": "Manufacturing",
    "D: ELECTRICITY, GAS, STEAM AND AIR CONDITIONING SUPPLY": "Electricity, gas, steam and air",
    "E: WATER SUPPLY; SEWERAGE, WASTE MANAGEMENT AND REMEDIATION ACTIVITIES": "Water supply",
    "F: CONSTRUCTION": "Construction",
    "G: WHOLESALE AND RETAIL TRADE; REPAIR OF MOTOR VEHICLES AND MOTORCYCLES": "Sales and repairs",
    "H: TRANSPORTATION AND STORAGE": "Transportation and storage",
    "I: ACCOMMODATION AND FOOD SERVICE ACTIVITIES": "Accommodation and food",
    "J: INFORMATION AND COMMUNICATION": "Information and communication",
    "K: FINANCIAL AND INSURANCE ACTIVITIES": "Financial and insurance activities",
    "L: REAL ESTATE ACTIVITIES": "Real estate activities",
    "M: PROFESSIONAL, SCIENTIFIC AND TECHNICAL ACTIVITIES": "Professional and scientific",
    "N: ADMINISTRATIVE AND SUPPORT SERVICE ACTIVITIES": "Administrative and support",
    "Non-SIC Apprenticeships": "Non-sic apprenticeships",
    "Non-SIC Graduates": "Non-sic graduates",
    "Non-SIC Part-Time": "Non-sic part-time",
    "O: PUBLIC ADMINISTRATION AND DEFENCE; COMPULSORY SOCIAL SECURITY": "Social security",
    "P: EDUCATION": "Education",
    "Q: HUMAN HEALTH AND SOCIAL WORK ACTIVITIES": "Health and social work",
    "R: ARTS, ENTERTAINMENT AND RECREATION": "Arts, entertainment and recreation",
    "S: OTHER SERVICE ACTIVITIES": "Other service activities",
    "T: ACTIVITIES OF HOUSEHOLDS AS EMPLOYERS; UNDIFFERENTIATED GOODS-AND SERVICES-PRODUCING ACTIVITIES OF HOUSEHOLDS FOR OWN USE": "Households",
    "U: ACTIVITIES OF EXTRATERRITORIAL ORGANISATIONS AND BODIES": "Extraterritorial bodies"
}

export const ADZUNA_JOB_CATEGORIES: CategoriesMap = {
    'it-jobs': 'Information & Communication',
    'engineering-jobs': 'Engineering',
    'healthcare-nursing-jobs': 'Health',
    'manufacturing-jobs': 'Manufacturing',
    'admin-jobs': 'Administration & Support',
    'hr-jobs': 'Human Resources',
    'accounting-finance-jobs': 'Financial and Insurance',
    'hospitality-catering-jobs': 'Accomodation & Food Service',
    'logistics-warehouse-jobs': 'Transportation & Storage',
    'legal-jobs': 'Legal',
    'teaching-jobs': 'Teaching',
    'social-work-jobs': 'Social Work and Care',
    'trade-construction-jobs': 'Construction',
    'pr-advertising-marketing-jobs': 'Advertising & Marketing',
    'creative-design-jobs': 'Arts & Entertainment & Recreation',
    'energy-oil-gas-jobs': 'Electricity & Gas',
    'scientific-qa-jobs': 'Scientific & Technical',
    'goods-services-jobs': 'Retail, Sales and Customer Service',
    // geek talent specific jobs
    'graduate-jobs': 'Graduate',
    'other-general-jobs': 'General',
    'agriculture-jobs': 'Agriculture',
    'part-time-jobs': 'Part time',
    'public-sector-jobs': 'Public Sector'
};

export const ADZUNA_TYPEAHEAD_EXCLUDE: string[] = ['graduate-jobs', 'other-general-jobs', 'part-time-jobs', 'public-sector-jobs'];

export const ADZUNA_TYPEAHEAD_CATEGORIES: CategoriesTypeaheadData[] = Object.keys(ADZUNA_JOB_CATEGORIES)
    .filter(key => !ADZUNA_TYPEAHEAD_EXCLUDE.includes(key))
    .map(key => ({
        key,
        value: ADZUNA_JOB_CATEGORIES[key],
        group: 'all-sectors'
    }));

export const ADZUNA_TYPEAHEAD_SIC_JERSEY: CategoriesTypeaheadData[] = Object.keys(ADZUNA_JOB_SIC_JERSEY)
    .map(key => ({
        key,
        value: ADZUNA_JOB_SIC_JERSEY[key],
        group: 'All SIC codes'
    })); 

export const ADZUNA_TYPEAHEAD_SIC_UK: CategoriesTypeaheadData[] = Object.keys(ADZUNA_JOB_SIC_UK)
    .map(key => ({
        key,
        value: ADZUNA_JOB_SIC_UK[key],
        group: 'All SIC codes'
    }));

export const ADZUNA_TYPEAHEAD_GROUPS = {
    'all-sectors': 'All sectors',
    'all-codes': 'All SIC codes'
};





