import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import CostEstimator from '@/components/CostEstimator';
import ServicesCityDirectory from '@/components/ServicesCityDirectory';
import { 
  Home, Building2, Factory, Car, Warehouse, ShieldCheck, 
  PackageCheck, Award, Truck, CheckCircle2, ChevronRight, 
  ArrowRight, PhoneCall, Sparkles, Star, MapPin, ShieldAlert,
  Clock, HelpCircle, Layers, FileText, BadgePercent
} from 'lucide-react';

export const revalidate = 86400; // 24 hours ISR

const SERVICE_REGISTRY = {
  'household-relocation': {
    title: 'Household & Residential Relocation Services in India',
    shortTitle: 'Household Relocation',
    metaTitle: 'Household & Home Relocation Services India | BestPackerMovers.com',
    metaDesc: 'Compare top-rated household shifting services across India. 1/2/3/4 BHK home packing, furniture dismantling, glassware armor packing & safe container transit.',
    icon: Home,
    tag: 'Home Relocation',
    accentColor: '#F7B731',
    heroTagline: 'Stress-Free Doorstep Home Shifting Across 7,000+ Indian Pin Codes',
    intro: 'Moving your home requires meticulous care, heavy-duty cushioning materials, and disciplined logistics crews. BestPackerMovers certifies and ranks verified household moving companies offering end-to-end packing, loading, dedicated closed-body container transit, unloading, and precision reassembly.',
    priceHeadline: 'Standard Home Shifting Tariff Guide (Pan-India Benchmark)',
    pricingTable: [
      { shiftType: '1 BHK Apartment Move', localPrice: '₹3,500 – ₹7,500', intercityPrice: '₹9,500 – ₹19,500', vehicle: '14-Foot Closed Container' },
      { shiftType: '2 BHK Apartment Move', localPrice: '₹5,500 – ₹11,000', intercityPrice: '₹14,000 – ₹28,000', vehicle: '17-Foot Closed Container' },
      { shiftType: '3 BHK Residential Home', localPrice: '₹8,500 – ₹16,500', intercityPrice: '₹22,000 – ₹42,000', vehicle: '20-Foot High Cube Container' },
      { shiftType: '4 BHK / Luxury Villa', localPrice: '₹12,000 – ₹24,000', intercityPrice: '₹32,000 – ₹65,000+', vehicle: '24-Foot Specialized Heavy Carrier' }
    ],
    workflow: [
      { step: '01', title: 'Digital or Physical Inventory Survey', desc: 'Pre-move volume assessment of furniture, electronics, and fragile items to allocate exact container size and packing material requirements.' },
      { step: '02', title: 'Multi-Tier Armor Packing', desc: 'Triple-layer bubble wrapping for glassware, high-density edge protectors for wooden furniture, and moisture-proof corrugated cartons.' },
      { step: '03', title: 'Closed Container Transit & Tracking', desc: 'Secure loading on all-weather container trucks equipped with safety lashing and live GPS tracking for interstate transit.' },
      { step: '04', title: 'Doorstep Unloading & Reassembly', desc: 'Room-by-room unloading, unboxing, bed/wardrobe reassembly, and systematic removal of all packaging debris.' }
    ],
    materials: ['Heavy-Duty Corrugated Cartons (5 & 7-ply)', 'High-Density Bubble Wrap & Foam Sheets', 'Stretch Wrapping & Shrink Films', 'Custom Wooden Crates for Fragile Artifacts', 'Padded Moving Blankets for Leather Sofas'],
    faqs: [
      { q: 'How early should I book household packers and movers?', a: 'We recommend scheduling your move at least 3 to 7 days in advance. For month-end or weekend moves, booking 10 days prior ensures you get premier container slots and top-rated crews.' },
      { q: 'Are dismantling and reassembly of modular furniture included?', a: 'Yes, certified movers on our directory dismantle standard beds, dining tables, and wardrobes at pickup and reassemble them at your new destination.' },
      { q: 'How is fragile glassware and electronics protected during transit?', a: 'Fragile items are cushioned with multi-layer bubble wrap, placed in double-walled cartons with thermocol fillers, and marked with high-visibility Fragile safety stickers.' }
    ]
  },
  'corporate-relocation': {
    title: 'Corporate & Office Relocation Services in India',
    shortTitle: 'Corporate Relocation',
    metaTitle: 'Office & Corporate Shifting Services India | BestPackerMovers.com',
    metaDesc: 'Zero-downtime commercial and corporate office relocation services. Server room dismantling, modular workstations, employee relocation & enterprise billing.',
    icon: Building2,
    tag: 'Corporate & Commercial',
    accentColor: '#3B82F6',
    heroTagline: 'Zero-Downtime Commercial & Enterprise Office Moving Solutions',
    intro: 'Corporate moves demand stringent scheduling, non-negotiable data security, and specialized handling of IT infrastructure. We connect corporate enterprises and startups with verified logistics contractors who operate over weekends and holidays to prevent workplace disruption.',
    priceHeadline: 'Corporate Shifting Tariff Guide (Estimated Per Workstation)',
    pricingTable: [
      { shiftType: 'Small Office (10-25 Seats)', localPrice: '₹12,000 – ₹28,000', intercityPrice: '₹35,000 – ₹75,000', vehicle: '19-Foot Dedicated Freight Carrier' },
      { shiftType: 'Medium Enterprise (25-75 Seats)', localPrice: '₹28,000 – ₹65,000', intercityPrice: '₹75,000 – ₹1,80,000', vehicle: 'Multiple 24-Foot Containers' },
      { shiftType: 'Corporate Headquarters (75+ Seats)', localPrice: 'Custom Site Audit', intercityPrice: 'Turnkey Enterprise Contract', vehicle: 'Fleet Logistics & Rigging' },
      { shiftType: 'IT Server & Rack Migration', localPrice: '₹15,000 – ₹40,000', intercityPrice: '₹45,000 – ₹1,10,000', vehicle: 'Air-Suspension Shockproof Vans' }
    ],
    workflow: [
      { step: '01', title: 'Logistics Blueprint & Project Planning', desc: 'Collaborating with facility managers and IT heads to formulate floor-by-floor tagging and migration timelines.' },
      { step: '02', title: 'Antistatic IT & Server Packaging', desc: 'Antistatic foam, ESD packaging, and custom shockproof bins for data servers, monitors, laptops, and networking switches.' },
      { step: '03', title: 'Modular Workstation Dismantling', desc: 'Disassembly of cubicles, conference tables, and executive furniture with detailed labeling for identical reassembly.' },
      { step: '04', title: 'Overnight / Weekend Deployment', desc: 'Continuous weekend operations so your enterprise logs off Friday evening and resumes business Monday morning.' }
    ],
    materials: ['Anti-Static Bubble Wrap for IT Hardware', 'Numbered Inventory Barcode Stickers', 'Heavy-Duty Plastic Crates with Security Zip-Ties', 'Air-Suspension Transit Vehicles', 'Protective Floor Masonite Boards'],
    faqs: [
      { q: 'Can corporate shifting be conducted over weekends to avoid downtime?', a: 'Yes. Most verified corporate relocation partners specialize in 48-hour weekend turnarounds (Friday 7 PM to Sunday 9 PM).' },
      { q: 'How do you safeguard sensitive corporate documents and archives?', a: 'Documents are boxed in sequentially numbered security-sealed cartons, cross-verified with a signed manifest before departure and upon delivery.' },
      { q: 'Do you provide GST invoices and corporate credit agreements?', a: 'Yes, all certified corporate logistics carriers provide compliant GST invoices, e-Way bills, and standard corporate payment terms.' }
    ]
  },
  'industrial-relocation': {
    title: 'Industrial Machinery & Heavy Freight Relocation in India',
    shortTitle: 'Industrial Shifting',
    metaTitle: 'Industrial & Heavy Machinery Relocation India | BestPackerMovers.com',
    metaDesc: 'Pan-India industrial machinery relocation, CNC equipment rigging, hydraulic trailer transport & turnkey factory shifting services.',
    icon: Factory,
    tag: 'Heavy Industrial',
    accentColor: '#8B5CF6',
    heroTagline: 'Engineering-Grade Heavy Machinery Rigging & Factory Moving',
    intro: 'Industrial relocation requires engineering precision, hydraulic lifting equipment, cranes, and strict compliance with national highway transit norms. Our verified industrial freight operators handle oversized consignments (ODC), factory machinery, and manufacturing plant transfers.',
    priceHeadline: 'Industrial Freight & Rigging Tariff Guide',
    pricingTable: [
      { shiftType: 'CNC & Precision Machine Rigging', localPrice: '₹18,000 – ₹45,000', intercityPrice: '₹45,000 – ₹1,20,000', vehicle: 'Low-Bed Hydraulic Trailer' },
      { shiftType: 'Heavy Manufacturing Line (1-3 Machines)', localPrice: '₹35,000 – ₹90,000', intercityPrice: '₹95,000 – ₹2,60,000', vehicle: 'Semi-Low Bed Trailers' },
      { shiftType: 'Turnkey Factory Relocation', localPrice: 'Engineering Site Audit', intercityPrice: 'Project Logistics Quote', vehicle: 'Multi-Axle Fleet & Cranes' },
      { shiftType: 'Hydraulic Press & Transformer Shifting', localPrice: '₹25,000 – ₹70,000', intercityPrice: '₹65,000 – ₹1,90,000', vehicle: 'Heavy Crane + Flatbed' }
    ],
    workflow: [
      { step: '01', title: 'Engineering Site & Load Survey', desc: 'Assessment of equipment weight, center of gravity, floor load capacity, crane access points, and exit clearances.' },
      { step: '02', title: 'Skidding, Jacking & Heavy Rigging', desc: 'Deploying heavy hydraulic jacks, machine rollers, and gantry cranes to unseat and guide machinery out of production bays.' },
      { step: '03', title: 'Vibration-Damping Heavy Packaging', desc: 'VCI anti-corrosion barrier wrapping, heavy timber base bolting, and steel strapping for maritime or highway safety.' },
      { step: '04', title: 'Multi-Axle Transit & Re-Foundation', desc: 'Transport via multi-axle trailers with transit permits, pilot car escorts (ODC), and precision placement onto new foundations.' }
    ],
    materials: ['Vapor Corrosion Inhibitor (VCI) Films', 'Heavy-Duty Hardwood Timber Skids', 'High-Tensile Steel Strapping & Shackles', 'Heavy Machinery Tarpaulins (Waterproof 700 GSM)', 'Hydraulic Roller Skates & Toe Jacks'],
    faqs: [
      { q: 'Are hydraulic cranes and rigging crews arranged by the mover?', a: 'Yes. Verified industrial movers supply certified crane operators, riggers, hydraulic trailers, and pilot vehicles.' },
      { q: 'Do you handle national highway permits for Over-Dimensional Consignments (ODC)?', a: 'Yes, our empanelled industrial logistics operators procure all statutory MoRTH clearance permits, toll escorts, and route surveys.' },
      { q: 'What insurance covers heavy industrial machinery in transit?', a: 'Industrial consignments are covered under Special Open Marine / Transit Policies, covering loading, transit impact, and unloading risks.' }
    ]
  },
  'vehicle-relocation': {
    title: 'Car & Bike Relocation Services Across India',
    shortTitle: 'Car & Bike Transport',
    metaTitle: 'Car & Bike Relocation Services India | BestPackerMovers.com',
    metaDesc: 'Safe car and two-wheeler transport in enclosed hydraulic auto carriers. Doorstep pickup, live GPS tracking, zero odometer increase & transit insurance.',
    icon: Car,
    tag: 'Auto Transport',
    accentColor: '#10B981',
    heroTagline: 'Hydraulic Enclosed Multi-Car Carriers With Zero Odometer Increase',
    intro: 'Driving a luxury car or motorcycle 1,500 km across interstate highways exposes it to stone chips, engine wear, and highway hazards. BestPackerMovers connects you with certified automobile carriers using enclosed hydraulic auto trailers that preserve your vehicle in showroom condition.',
    priceHeadline: 'Pan-India Vehicle Relocation Tariff Matrix',
    pricingTable: [
      { shiftType: 'Standard Two-Wheeler (Motorcycle / Scooter)', localPrice: '₹1,500 – ₹3,000', intercityPrice: '₹3,500 – ₹7,500', vehicle: 'Specialized 2-Wheeler Crate' },
      { shiftType: 'Premium / Superbike (350cc - 1200cc)', localPrice: '₹2,500 – ₹5,000', intercityPrice: '₹6,000 – ₹13,000', vehicle: 'Steel Frame Custom Wooden Crate' },
      { shiftType: 'Hatchback / Compact Car', localPrice: '₹2,500 – ₹5,500', intercityPrice: '₹7,500 – ₹15,000', vehicle: 'Enclosed Hydraulic Car Carrier' },
      { shiftType: 'Sedan / Mid-Size SUV', localPrice: '₹3,500 – ₹7,000', intercityPrice: '₹9,500 – ₹18,500', vehicle: 'Enclosed Hydraulic Car Carrier' },
      { shiftType: 'Luxury SUV (Fortuner / BMW / Audi)', localPrice: '₹4,500 – ₹9,000', intercityPrice: '₹13,000 – ₹26,000', vehicle: 'Dedicated Single-Car Carrier Pod' }
    ],
    workflow: [
      { step: '01', title: 'Detailed 25-Point Condition Audit', desc: 'Pre-pickup digital photography documenting existing scratches, tire tread, fuel levels, and odometer reading.' },
      { step: '02', title: 'Armor Protection & Mirror Wrapping', desc: 'Bubble wrap padding for rear-view mirrors, bumper wraps, steering wheel covers, and two-wheeler body foam boxing.' },
      { step: '03', title: 'Hydraulic Ramp Loading & Wheel Stopper Lock', desc: 'Vehicle loaded via hydraulic ramp into an enclosed trailer, secured with four-point nylon wheel lashing clamps.' },
      { step: '04', title: 'Doorstep Delivery & Joint Inspection', desc: 'Vehicle delivered directly to your destination address with joint sign-off on the vehicle condition report.' }
    ],
    materials: ['High-Strength Wheel-Locking Straps', 'Heavy-Duty Corrugated Bike Enclosures', 'Bumper & Mirror Bubble Cushioning', 'Moisture-Shield Plastic Vehicle Hoods', 'Hydraulic Lift-Gates with Rubber Ramps'],
    faqs: [
      { q: 'Can I leave personal belongings or luggage in the car during transport?', a: 'Standard regulations allow up to 20-30 kg of non-valuable luggage locked securely in the trunk. Valuables, cash, and inflammable goods are strictly prohibited.' },
      { q: 'How is my vehicle protected against rain, dust, and stone chips?', a: 'Vehicles travel inside enclosed steel-body auto carriers, completely shielded from highway weather, gravel, and road grime.' },
      { q: 'What documents are required for car or bike transport in India?', a: 'You need copies of Vehicle Registration Certificate (RC), valid Vehicle Insurance, Emission/PUC certificate, and photo ID of the owner.' }
    ]
  },
  'warehousing-storage': {
    title: 'Warehousing & Household Goods Storage in India',
    shortTitle: 'Warehousing & Storage',
    metaTitle: 'Secure Warehousing & Household Storage India | BestPackerMovers.com',
    metaDesc: '24/7 CCTV-monitored warehouse storage for household furniture, commercial inventory, and automobiles. Moisture-proof, pest-controlled & insured depots.',
    icon: Warehouse,
    tag: 'Secure Storage',
    accentColor: '#EC4899',
    heroTagline: 'Climate-Guarded & 24/7 CCTV Monitored Storage Facilities',
    intro: 'Whether you are traveling overseas, renovating your home, or need overflow storage for commercial stock, our certified warehousing partners offer flexible monthly storage in fire-safe, pest-controlled, and round-the-clock secured logistics hubs.',
    priceHeadline: 'Monthly Warehousing & Household Storage Tariff Rates',
    pricingTable: [
      { shiftType: '1 BHK Complete Household Goods', localPrice: '₹1,500 – ₹3,000 / Mo', intercityPrice: 'Doorstep Pickup & Restorage', vehicle: 'Dedicated Pallet Rack Bay' },
      { shiftType: '2 BHK Complete Household Goods', localPrice: '₹2,500 – ₹5,000 / Mo', intercityPrice: 'Doorstep Pickup & Restorage', vehicle: 'Double Pallet Bay (Moisture-Sealed)' },
      { shiftType: '3 BHK Complete Household Goods', localPrice: '₹4,000 – ₹7,500 / Mo', intercityPrice: 'Doorstep Pickup & Restorage', vehicle: 'Private High-Cube Vault' },
      { shiftType: 'Car / Motorcycle Storage', localPrice: '₹1,200 – ₹3,500 / Mo', intercityPrice: 'Covered Enclosed Parking Bay', vehicle: 'Dedicated Dry Bay with Battery Care' }
    ],
    workflow: [
      { step: '01', title: 'Inventory Barcoding & Pre-Storage Pack', desc: 'Each furniture piece and carton is assigned a unique barcode and moisture-proof plastic seal.' },
      { step: '02', title: 'Transport to Climate-Protected Depot', desc: 'Consignment transported by closed container directly to certified warehouse facilities.' },
      { step: '03', title: 'Palletized Storage in High-Rack Bays', desc: 'Stored off-ground on treated wooden/plastic pallets in pest-controlled bays with fire sprinklers.' },
      { step: '04', title: 'On-Demand Delivery & Redirection', desc: 'Whenever you return or finalize your new home, goods are dispatched and reassembled at your new address.' }
    ],
    materials: ['Anti-Fungal & Anti-Termite Fumigation', 'Pallet Shrink Wrap (80-Gauge Industrial)', 'Silica Gel Moisture Absorber Pouches', 'Heavy Steel Storage Lockers', '24/7 IP CCTV Surveillance & Security'],
    faqs: [
      { q: 'Is my stored furniture safe from moisture and pest infestation?', a: 'Yes. Certified warehouses undergo bi-weekly pest-control fumigation and use elevated pallets to prevent moisture absorption.' },
      { q: 'What is the minimum lock-in period for household storage?', a: 'Most storage providers offer flexible terms starting from as little as 15 days or 1 month, with month-on-month renewal.' },
      { q: 'Can I access or retrieve part of my belongings while in storage?', a: 'Yes, with 24 hours advance notice, you can access your assigned bay to inspect or withdraw specific numbered cartons.' }
    ]
  },
  'transit-insurance': {
    title: 'Transit Insurance & Comprehensive Goods Protection in India',
    shortTitle: 'Transit Insurance',
    metaTitle: 'Transit Insurance for Packers and Movers India | BestPackerMovers.com',
    metaDesc: 'Protect your household and industrial goods against transit collision, fire, and overturning. 100% genuine insurance policy certificates with quick claims.',
    icon: ShieldCheck,
    tag: 'Financial Safety',
    accentColor: '#F59E0B',
    heroTagline: 'Government-Empanelled All-Risk Protection Against Transit Hazards',
    intro: 'Indian highways can be unpredictable. Transit insurance guarantees that even in the unlikely event of highway collision, flash flooding, fire, or overturning, your financial assets remain 100% indemnified through public-sector and certified general insurance underwriters.',
    priceHeadline: 'Transit Insurance Premium Guide (IRDAI Approved Norms)',
    pricingTable: [
      { shiftType: 'Transit Only (Collision & Overturn)', localPrice: '1.0% – 1.2% of Goods Value', intercityPrice: 'Highway Perils Coverage', vehicle: 'Official Policy Certificate' },
      { shiftType: 'Comprehensive All-Risk (Loading, Transit & Unloading)', localPrice: '1.5% – 2.0% of Goods Value', intercityPrice: 'End-to-End Zero Depreciation', vehicle: 'Zero-Deductible Policy Option' },
      { shiftType: 'Automobile Transit Coverage', localPrice: '₹1,000 – ₹2,500 Flat', intercityPrice: 'Declared Insured Value Basis', vehicle: 'Vehicle Damage Policy' },
      { shiftType: 'Commercial Machinery Open Policy', localPrice: 'Underwritten Rate', intercityPrice: 'Project Cargo Tariff', vehicle: 'Industrial Marine Cover' }
    ],
    workflow: [
      { step: '01', title: 'Customer Item Valuation Manifest', desc: 'You fill out a transparent declaration sheet listing each high-value item and its current market replacement value.' },
      { step: '02', title: 'Policy Underwriting & Certificate Issuance', desc: 'A formal insurance policy certificate is issued directly from recognized insurers (National Insurance, Oriental, ICICI Lombard, etc.).' },
      { step: '03', title: 'Sealed Transit Under Insured Consignment Note', desc: 'Consignment note (Bilty) stamped with the active policy number and declared valuation.' },
      { step: '04', title: 'Expedited Claim Settlement Support', desc: 'In case of damage, a certified surveyor conducts inspection within 48 hours for swift reimbursement.' }
    ],
    materials: ['Official IRDAI-Approved Policy Documents', 'Itemized Declaratory Valuation Sheets', 'Joint Consignment Inspection Forms', 'Instant Surveyor Allotment Protocols', 'Digital Damage Photographic Audits'],
    faqs: [
      { q: 'Is transit insurance mandatory for intercity relocation?', a: 'While not legally mandatory for personal goods, it is strongly advised for intercity relocations exceeding 150 km to protect your life savings from unpredictable road accidents.' },
      { q: 'What is the difference between Transit-Only and Comprehensive Insurance?', a: 'Transit-Only covers damage arising strictly while the truck is moving (fire, accident, overturned vehicle). Comprehensive All-Risk also covers loading and unloading breakages.' },
      { q: 'How long does claim settlement take if damage occurs?', a: 'When booked through verified directory partners with valid policy certificates, surveyed claims are typically settled within 7 to 14 business days.' }
    ]
  },
  'loading-unloading': {
    title: 'Loading, Unloading & Professional Rigging Services in India',
    shortTitle: 'Loading & Unloading',
    metaTitle: 'Professional Loading & Unloading Services India | BestPackerMovers.com',
    metaDesc: 'Expert labor, high-rise balcony hoisting, hydraulic tail-lift loading & safe unpacking. Avoid self-injury and furniture damage with trained crews.',
    icon: PackageCheck,
    tag: 'Skilled Rigging',
    accentColor: '#6366F1',
    heroTagline: 'Skilled Riggers, Hydraulic Lifts & High-Rise Balcony Hoisting',
    intro: 'Over 60% of accidental furniture and appliance damage occurs during manual lifting through narrow staircases and elevators. Our certified loading and unloading crews deploy heavy-duty slings, appliance dollies, and hydraulic tail-lifts to handle multi-hundred kilogram items safely.',
    priceHeadline: 'Professional Loading & Labor Tariff Guide',
    pricingTable: [
      { shiftType: '2-Man Loading Crew (Up to 1 BHK)', localPrice: '₹1,200 – ₹2,200', intercityPrice: 'Pickup / Drop Labor Service', vehicle: 'Dollies & Moving Straps Included' },
      { shiftType: '4-Man Expert Crew (2-3 BHK)', localPrice: '₹2,500 – ₹4,500', intercityPrice: 'Multi-Floor Carry & Hoist', vehicle: 'High-Tension Slings & Ramps' },
      { shiftType: 'Heavy Appliance Hoisting (Balcony / 4+ Floors)', localPrice: '₹1,500 – ₹3,500 / Item', intercityPrice: 'Rope & Pulley Rigging', vehicle: 'Industrial Crane / Winch' },
      { shiftType: 'Piano / Billiard Table / Safe Rigging', localPrice: '₹3,000 – ₹6,000', intercityPrice: 'Precision Rigging Team', vehicle: 'Custom Heavy Skids' }
    ],
    workflow: [
      { step: '01', title: 'Stairwell & Elevator Access Clearance', desc: 'Inspect passageways, doorways, and elevator dimensions, installing protective wall pads to prevent scuffs.' },
      { step: '02', title: 'Ergonomic Dolly & Harness Rigging', desc: 'Securing heavy refrigerators, washing machines, and safes onto pneumatic wheel dollies and shoulder-dolly harnesses.' },
      { step: '03', title: 'Weight-Balanced Container Stacking', desc: 'Heaviest freight placed at the bottom forward axle; fragile cartons locked high with ratchet tie-down straps.' },
      { step: '04', title: 'Placement & Unpacking Assistance', desc: 'Carrying furniture to designated rooms, unboxing fragile cartons, and reassembling heavy beds.' }
    ],
    materials: ['Heavy-Duty Pneumatic Appliance Dollies', 'Shoulder Dolly Lifting Harnesses', 'High-Tensile Rigging Slings & Winch Pulleys', 'Neoprene Doorway & Floor Protective Runners', 'Anti-Slip Grip Work Gloves'],
    faqs: [
      { q: 'What happens if heavy furniture cannot fit in the elevator or narrow stairs?', a: 'Certified crews use specialized rope-and-pulley hoist systems or hydraulic cherry pickers to hoist furniture safely through external balconies or wide windows.' },
      { q: 'Are loading crews covered against accidental workplace injuries?', a: 'All empanelled logistics providers maintain workmen compensation policies and adhere strictly to ergonomic lifting standards.' },
      { q: 'Can I hire loading and unloading labor only without hiring a truck?', a: 'Yes. You can book labor-only crews for self-managed truck loading, internal apartment shifting, or inter-building relocations.' }
    ]
  }
};

export async function generateStaticParams() {
  return Object.keys(SERVICE_REGISTRY).map(service => ({ service }));
}

export async function generateMetadata({ params }) {
  const { service } = await params;
  const data = SERVICE_REGISTRY[service];
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDesc,
    alternates: {
      canonical: `https://www.bestpackermovers.com/services/${service}`,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDesc,
      url: `https://www.bestpackermovers.com/services/${service}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDesc,
    }
  };
}

export default async function DedicatedServicePage({ params }) {
  const { service } = await params;
  const data = SERVICE_REGISTRY[service];

  if (!data) {
    notFound();
  }

  const ServiceIcon = data.icon;

  // Fetch cities and states for interactive scrollable directory
  let allCities = [];
  let allStates = [];
  try {
    const cityRes = await query(`
      SELECT c.id, c.name, c.slug, c.tier, s.name as state_name, s.slug as state_slug 
      FROM cities c 
      JOIN states s ON c.state_id = s.id 
      WHERE c.tier <= 2 OR c.tier IS NULL 
      ORDER BY c.tier ASC, c.name ASC 
      LIMIT 350
    `);
    allCities = cityRes.rows || [];

    const stateRes = await query('SELECT id, name, slug FROM states ORDER BY name ASC');
    allStates = stateRes.rows || [];
  } catch (e) {}

  // Schema.org Structured Data
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': data.title,
    'description': data.metaDesc,
    'provider': {
      '@type': 'LogisticsService',
      'name': 'National Packers & Movers (#1 Verified Network Partner)',
      'url': 'https://www.thenationalpackersmovers.com',
      'telephone': '+919835168368',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'IN'
      }
    },
    'areaServed': {
      '@type': 'Country',
      'name': 'India'
    },
    'serviceType': data.shortTitle,
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'INR',
      'lowPrice': '1200',
      'highPrice': '65000',
      'offerCount': '150+'
    }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': data.faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.bestpackermovers.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Services',
        'item': 'https://www.bestpackermovers.com/services'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': data.shortTitle,
        'item': `https://www.bestpackermovers.com/services/${service}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-[#080C12] text-slate-100 min-h-screen">
        {/* TOP ACCENT LINE */}
        <div className="h-1 w-full bg-gradient-to-r from-[#F7B731] via-[#3B82F6] to-[#F7B731]" />

        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 px-4 border-b border-slate-800/80 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(247,183,49,0.12),rgba(255,255,255,0))]" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
              <Link href="/" className="hover:text-[#F7B731] transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link href="/services" className="hover:text-[#F7B731] transition-colors">Services Hub</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[#F7B731]">{data.shortTitle}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7B731]/10 border border-[#F7B731]/30 text-[#F7B731] text-xs font-semibold uppercase tracking-wider mb-4">
                  <ServiceIcon className="w-4 h-4" />
                  {data.tag} • Pan-India Verified
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  {data.title}
                </h1>

                <p className="text-lg md:text-xl text-[#F7B731] font-medium mb-4">
                  {data.heroTagline}
                </p>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                  {data.intro}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-400">
                  <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Empanelled & Audited
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-blue-400" /> Transit Insurance Validated
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9/5 Service Rating
                  </span>
                </div>
              </div>

              {/* SEARCH & QUICK DISPATCH BOX */}
              <div className="w-full lg:w-96 bg-gradient-to-b from-[#0F172A] to-[#0A0F1D] border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#F7B731] text-[#080C12] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  Instant Dispatch
                </div>

                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#F7B731]" />
                  Find Movers in Your City
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Select your city for verified {data.shortTitle.toLowerCase()} quotes:
                </p>

                <SearchBar placeholder="Type your pickup city..." />

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Need immediate help?</span>
                  <a 
                    href="https://wa.me/919835168368?text=Hello%20National%20Packers,%20I%20need%20a%20quote%20for%20" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#F7B731] font-semibold hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Desk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TROJAN HORSE #1 SPOTLIGHT: NATIONAL PACKERS & MOVERS */}
        <section className="py-10 px-4 bg-gradient-to-b from-[#0A101D] to-[#080C12]">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl border-2 border-[#F7B731]/60 bg-gradient-to-r from-[#121B2C] via-[#0D1624] to-[#121B2C] p-6 md:p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#F7B731] text-[#080C12] text-xs font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> #1 Verified National Logistics Partner
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-4 lg:mt-0">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      ISO 9001:2015 & IBA Approved
                    </span>
                    <span className="text-xs text-slate-400">• 30+ Years Legacy</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
                    National Packers & Movers
                  </h2>

                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    The highest-rated empanelled logistics network for {data.shortTitle.toLowerCase()}. Serving 7,000+ destinations across India with proprietary container fleets, zero-damage protocols, and dedicated move coordinators.
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-800/90 text-slate-300 px-3 py-1 rounded-md border border-slate-700">
                      ✓ Dedicated Fleet Operations
                    </span>
                    <span className="bg-slate-800/90 text-slate-300 px-3 py-1 rounded-md border border-slate-700">
                      ✓ Zero Middlemen Commissions
                    </span>
                    <span className="bg-slate-800/90 text-slate-300 px-3 py-1 rounded-md border border-slate-700">
                      ✓ Priority Slot Allocation
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <a
                    href="https://www.thenationalpackersmovers.com"
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F7B731] to-[#e5a825] text-[#080C12] font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-[#F7B731]/20"
                  >
                    <span>Visit Official Website</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="tel:+919835168368"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm border border-slate-700 transition-all"
                  >
                    <PhoneCall className="w-4 h-4 text-[#F7B731]" />
                    <span>+91 98351 68368</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TARIFF / PRICE GUIDE SECTION */}
        <section className="py-14 px-4 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                <BadgePercent className="w-3.5 h-3.5" /> Market Intelligence
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {data.priceHeadline}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Transparent market benchmarks based on audited quotations across verified Indian carriers.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-300 border-b border-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold text-white">Relocation Scale / Consignment</th>
                    <th scope="col" className="px-6 py-4 font-bold text-[#F7B731]">Local City Moving</th>
                    <th scope="col" className="px-6 py-4 font-bold text-emerald-400">Intercity / Interstate</th>
                    <th scope="col" className="px-6 py-4 font-bold text-blue-400">Vehicle / Rig Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.pricingTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F7B731] shrink-0" />
                        {row.shiftType}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-200">{row.localPrice}</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-300">{row.intercityPrice}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">{row.vehicle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              * Rates vary slightly based on floor level, elevator availability, distance in kilometers, and specialized packing requirements.
            </p>
          </div>
        </section>

        {/* 4-STAGE OPERATIONAL PROTOCOL */}
        <section className="py-14 px-4 bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
                <Layers className="w-3.5 h-3.5" /> Operational Precision
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Our 4-Stage Operational Protocol
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                How certified movers ensure flawless transit for your {data.shortTitle.toLowerCase()}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.workflow.map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-[#F7B731]/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-[#F7B731] flex items-center justify-center text-slate-200 group-hover:text-[#080C12] font-black text-lg mb-4 transition-colors">
                      {item.step}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#F7B731] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRIAL PACKING STANDARDS */}
        <section className="py-14 px-4 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-[#0A101D] p-8 md:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> High-Spec Materials
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
                    Certified Armor Packing Standards
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Cheap movers use thin newspaper and flimsy 3-ply boxes that collapse during braking. Verified directory carriers are bound by strict material specifications.
                  </p>
                  <ul className="space-y-3 text-xs md:text-sm text-slate-300">
                    {data.materials.map((mat, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="w-full lg:w-96 bg-slate-900/90 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Directory Zero-Scam Guarantee
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every mover listed on BestPackerMovers undergoes police and GST validation. In case of pricing disputes, our dispute desk acts on your behalf.
                  </p>
                  <div className="pt-3 border-t border-slate-800">
                    <a
                      href="https://wa.me/919835168368?text=Hello%20BestPackerMovers,%20I%20want%20to%20verify%20a%20mover%20quote"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#F7B731] font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Speak to Moving Advisor
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="py-14 px-4 bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20">
                <HelpCircle className="w-3.5 h-3.5" /> Expert Answers
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Frequently Asked Questions ({data.shortTitle})
              </h2>
            </div>

            <div className="space-y-4">
              {data.faqs.map((faq, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7B731]/10 text-[#F7B731] text-xs flex items-center justify-center font-bold">
                      Q
                    </span>
                    {faq.q}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAN-INDIA CITY DIRECTORY CROSS-LINKING (SCROLLABLE & SEARCHABLE) */}
        <section className="py-14 px-4 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <ServicesCityDirectory cities={allCities} states={allStates} serviceSlug={service} />
          </div>
        </section>

        {/* BOTTOM EMPIRE CALL TO ACTION */}
        <section className="py-16 px-4 bg-gradient-to-t from-[#0A101D] to-[#080C12] border-t border-slate-800/80 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to Book Your {data.shortTitle}?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
              Get an instant quotation backed by the zero-scam guarantee of India’s most comprehensive logistics and moving directory.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/919835168368?text=Hello%20National%20Packers,%20I%20need%20an%20urgent%20quote%20for%20my%20move"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#F7B731] to-[#e5a825] text-[#080C12] font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-[#F7B731]/20 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Get Instant WhatsApp Quote</span>
              </a>
              <Link
                href="/services"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition-all"
              >
                Compare All Services
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
