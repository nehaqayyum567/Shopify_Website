/**
 * NEVERMIND // PRODUCTS DATABASE & CONFIGURATION
 * Curated Luxury Streetwear Unisex Hoodies
 * Multi-Currency Support (PHP default, USD, EUR, JPY, GBP)
 */

const CURRENCIES = {
  PHP: { symbol: '₱', rate: 1.0, decimals: 0 },
  USD: { symbol: '$', rate: 0.0178, decimals: 2 },
  EUR: { symbol: '€', rate: 0.0163, decimals: 2 },
  JPY: { symbol: '¥', rate: 2.72, decimals: 0 },
  GBP: { symbol: '£', rate: 0.0141, decimals: 2 }
};

let currentCurrency = 'PHP';

function formatCurrency(amountInPHP) {
  const conf = CURRENCIES[currentCurrency] || CURRENCIES.PHP;
  const converted = amountInPHP * conf.rate;
  if (conf.decimals === 0) {
    return `${conf.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${conf.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Backward-compatible formatPHP helper
function formatPHP(amount) {
  return formatCurrency(amount);
}

const PRODUCTS = [
  {
    id: 'hoodie-01',
    name: 'Los Angeles Reconstruction Hoodie',
    tagline: 'Archival Cartography // Back Print',
    category: 'graphic',
    originalPrice: 6800,
    price: 4950,
    badge: 'SALE',
    badgeType: 'sale',
    image: 'assets/images/hoodie-la.jpg',
    hoverImage: 'assets/images/hoodie-cartography.jpg',
    backPrint: 'Distressed Los Angeles typographic cartography, aerial street grid & GPS coordinates',
    gsm: '480 GSM',
    material: '100% Pre-Shrunk Combed Cotton French Terry',
    color: 'Obsidian Black',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: 12,
    description: 'An architectural reinterpretation of West Coast streetwear. Features a high-density screenprinted back graphic depicting the urban grid and coordinates of Downtown Los Angeles. Cut in an oversized boxy silhouette with double-layered hood and raw distressed hems.'
  },
  {
    id: 'hoodie-02',
    name: 'Ecstasy Smile Acid Wash Hoodie',
    tagline: 'Subversive Iconography // Vintage Wash',
    category: 'acid',
    originalPrice: 7200,
    price: 5200,
    badge: 'LIMITED 150 PCS',
    badgeType: 'limited',
    image: 'assets/images/hoodie-smile.jpg',
    hoverImage: 'assets/images/hoodie-acidwash.jpg',
    backPrint: 'Distorted melting cyber-smile with "HAPPINESS IS TEMPORARY" archival manifesto',
    gsm: '480 GSM',
    material: 'Custom Mineral Enzyme Acid Wash Terry',
    color: 'Vintage Charcoal',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: 7,
    description: 'Engineered through a multi-stage mineral wash process yielding a distinctive weathered texture. The back features a signature dripping acid smile graphic contrasting against neon sulfur distress accents. Drop-shoulder drape with ribbed side gussets.'
  },
  {
    id: 'hoodie-03',
    name: 'Cybernetic Specimen Technical Hoodie',
    tagline: 'Subversive Anatomy // Cyber Blueprint',
    category: 'graphic',
    originalPrice: 7500,
    price: 5600,
    badge: 'EXCLUSIVE DROP',
    badgeType: 'limited',
    image: 'assets/images/hoodie-cyber.jpg',
    hoverImage: 'assets/images/hoodie-specimen.jpg',
    backPrint: 'High-density cybernetic spine blueprint with "DESIGNED TO DISRUPT // SPECIMEN 09"',
    gsm: '500 GSM',
    material: 'Heavyweight Loopback Organic Fleece',
    color: 'Pitch Black',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: 9,
    description: 'The flagship piece of DROP 004. Showcases an anatomical cybernetic spinal column schematic merged with industrial typography. Heavyweight loopback construction with brushed nickel drawstring aglets and reinforced bar-tack stitching.'
  },
  {
    id: 'hoodie-04',
    name: 'Nevermind Monolith Heavyweight Hoodie',
    tagline: 'Embossed Archival Logo // Minimalist Form',
    category: 'heavyweight',
    originalPrice: 6900,
    price: 4850,
    badge: 'BESTSELLER',
    badgeType: 'sale',
    image: 'assets/images/hoodie-monolith.jpg',
    hoverImage: 'assets/images/hoodie-monolith.jpg',
    backPrint: 'Giant monolithic puff-print "NEVERMIND" arch with "TOKYO - PARIS - LA 480GSM"',
    gsm: '480 GSM',
    material: 'Double-Washed Heavyweight Cotton Fleece',
    color: 'Faded Black / Mineral Grey',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: 15,
    description: 'Understated luxury with commanding presence. Features an ultra-dense raised foam puff-print across the upper shoulder blades. Cut with exaggerated dropped shoulders, tight wrist ribbing, and custom raw bottom hem.'
  },
  {
    id: 'hoodie-05',
    name: 'Vanitas Sculptural Marble Hoodie',
    tagline: 'Baroque Subversion // Dark Streetwear Art',
    category: 'graphic',
    originalPrice: 7800,
    price: 5800,
    badge: 'NEW ARRIVAL',
    badgeType: 'limited',
    image: 'assets/images/hoodie-vanitas.jpg',
    hoverImage: 'assets/images/hoodie-vanitas.jpg',
    backPrint: 'Cracked classical marble bust entwined in thorny silver roses & "AUTUMN HARVEST"',
    gsm: '500 GSM',
    material: '500 GSM Ultra-Dense French Terry',
    color: 'True Black',
    sizes: ['M', 'L', 'XL'],
    inStock: 5,
    description: 'Where classical antiquity meets underground night culture. A high-contrast graphic back print of a fractured Renaissance sculpture adorned with barbed vines and Gothic motto. Substantial weight offering an architectural silhouette that never collapses.'
  },
  {
    id: 'hoodie-06',
    name: 'Disrupt V2 Blueprint Hoodie',
    tagline: 'Schematic Cartography // High Density',
    category: 'graphic',
    originalPrice: 6500,
    price: 4700,
    badge: 'SALE',
    badgeType: 'sale',
    image: 'assets/images/hoodie-cyber-detail.jpg',
    hoverImage: 'assets/images/hoodie-cyber.jpg',
    backPrint: 'Technical coordinate blueprints and serial production identification stamp',
    gsm: '480 GSM',
    material: '100% Combed Cotton Terry',
    color: 'Shadow Black',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: 11,
    description: 'Precision engineered technical streetwear. Featuring an all-white stark back-print detailing garment serial codes, factory coordinates, and architectural load-bearing proportions. Finished with blackened metal hardware.'
  },
  {
    id: 'hoodie-07',
    name: 'Downtown Cartography Coordinates Hoodie',
    tagline: 'Metropolitan Grid // Subversive Streetwear',
    category: 'graphic',
    originalPrice: 6900,
    price: 4950,
    badge: 'LOW STOCK',
    badgeType: 'sale',
    image: 'assets/images/hoodie-la-detail.jpg',
    hoverImage: 'assets/images/hoodie-la.jpg',
    backPrint: 'Zoomed urban street matrix graphic with high-contrast screenprinted coordinates',
    gsm: '480 GSM',
    material: '480 GSM Pre-Shrunk Fleece',
    color: 'Midnight Black',
    sizes: ['S', 'M', 'L'],
    inStock: 4,
    description: 'An abstract exploration of metropolitan geography. Detailed cartographic vector back-print with micro-text detailing transit arteries and architectural brutalism. Double-walled hood with custom eyelets.'
  },
  {
    id: 'hoodie-08',
    name: 'Acid Wash Distortion Hoodie',
    tagline: 'Distressed Micro-Print // Vintage Wash',
    category: 'acid',
    originalPrice: 7100,
    price: 5150,
    badge: 'LIMITED EDITION',
    badgeType: 'limited',
    image: 'assets/images/hoodie-smile-detail.jpg',
    hoverImage: 'assets/images/hoodie-smile.jpg',
    backPrint: 'Detailed macro view of dripping acid smile with subversive warning typography',
    gsm: '480 GSM',
    material: 'Vintage Enzyme Washed French Terry',
    color: 'Acid Charcoal',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: 8,
    description: 'A tribute to 90s rave culture and modern dystopian aesthetics. Individually stone-washed by hand for an irreproducible vintage fade. Back print features layered silk-screen pigments with tactile cracked gel overlay.'
  }
];

// Streetwear Oversized Fit Size Guide Table Data
const SIZE_GUIDE_DATA = [
  { size: 'S', chest: '124 cm', length: '71 cm', shoulders: '62 cm', sleeve: '58 cm', fit: 'Slightly Oversized' },
  { size: 'M', chest: '130 cm', length: '73 cm', shoulders: '64 cm', sleeve: '60 cm', fit: 'Signature Boxy' },
  { size: 'L', chest: '136 cm', length: '75 cm', shoulders: '66 cm', sleeve: '62 cm', fit: 'Haute Street Oversize' },
  { size: 'XL', chest: '142 cm', length: '77 cm', shoulders: '68 cm', sleeve: '63 cm', fit: 'Dramatic Architectural' }
];
