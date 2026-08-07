const { db, initDb } = require('../config/db');
require('dotenv').config();

// Researched unique parameters for each of the 85 cities to generate 100% unique content
const citySeoData = {
  // --- Uttar Pradesh ---
  "lucknow": {
    landmark: "Charbagh Railway Station and Gomti River banks",
    route: "NH-30, NH-27, and the Purvanchal Expressway",
    challenge: "navigating the tight lanes of old areas like Chowk and Aminabad during peak business hours",
    keyword: "household goods loading and local household shifting services"
  },
  "kanpur": {
    landmark: "industrial leather manufacturing belts near Ganga River banks",
    route: "NH-19 and the Kanpur-Jhansi highway corridor",
    challenge: "heavy industrial truck congestion and railway level crossings delays",
    keyword: "commercial office shifting and industrial machinery transfers"
  },
  "noida": {
    landmark: "planned sector grid layouts and tech business parks",
    route: "DND Flyway, Yamuna Expressway, and Noida-Greater Noida Expressway",
    challenge: "high-rise apartment elevators permission and loading dock heights compliance",
    keyword: "premium residential shifting and corporate office relocation"
  },
  "ghaziabad": {
    landmark: "residential high-rise hubs near the Hindon River",
    route: "NH-9, Hindon Elevated Road, and Delhi-Meerut Expressway",
    challenge: "heavy NCR commuter traffic jams and tight basement height limits",
    keyword: "domestic packers and movers and secure vehicle carrier transport"
  },
  "agra": {
    landmark: "historic Taj Mahal heritage sectors and Yamuna River banks",
    route: "Yamuna Expressway and the NH-19 corridor",
    challenge: "strict eco-sensitive zone vehicle entry permits and tourist crowd congestion",
    keyword: "secure household shifting and art handling relocation services"
  },
  "varanasi": {
    landmark: "ancient Ganga Ghats and Kashi Vishwanath temple corridors",
    route: "NH-19 and the Varanasi Ring Road bypass",
    challenge: "extremely narrow spiritual bazaar lanes requiring manual load cart portage",
    keyword: "safe domestic packing and fragile religious article transfers"
  },
  "meerut": {
    landmark: "historic sports goods industrial zone and cantonment area",
    route: "Delhi-Meerut Expressway and the NH-34 corridor",
    challenge: "managing logistics inside dense commercial markets like Sadar Bazaar",
    keyword: "local household shifting and small manufacturing units freight"
  },
  "aligarh": {
    landmark: "historic Aligarh Muslim University campus and lock manufacturing sectors",
    route: "Grand Trunk Road (NH-34) and Aligarh-Noida corridor",
    challenge: "dense industrial market lanes and railway crossing delays",
    keyword: "metal goods packing and local residential shifting assistance"
  },
  "bareilly": {
    landmark: "Ramganga River banks and local cane furniture trading markets",
    route: "NH-30 and the Bareilly-Nainital highway link",
    challenge: "congested timber warehouse districts and local market traffic",
    keyword: "safe warehouse storage and local household moving services"
  },
  "gorakhpur": {
    landmark: "Gorakhnath Temple heritage area and Rapti River banks",
    route: "NH-27 and the Gorakhpur-Sonauli Nepal border highway",
    challenge: "heavy cross-border customs freight congestion and single-lane highway delays",
    keyword: "cross-border logistics and terminal shifting security"
  },
  "mathura": {
    landmark: "holy Yamuna River ghats and ancient temple heritage circles",
    route: "NH-19 and the Mathura-Vrindavan link corridor",
    challenge: "heavy pilgrim tour bus crowds and narrow residential alleys",
    keyword: "temple articles handling and household relocation support"
  },
  "jhansi": {
    landmark: "historic Jhansi Fort and central railway crossing points",
    route: "NH-44 (North-South Corridor) and NH-27 intersection",
    challenge: "highway long-haul cargo clearances and railway station congestion",
    keyword: "long-distance domestic transit and army cantonment shifting"
  },
  "moradabad": {
    landmark: "brassware metal exporting factories and Ramganga River region",
    route: "NH-9 and Moradabad bypass road corridor",
    challenge: "coordinating cargo container transport through heavy cottage industry lanes",
    keyword: "brass export packing and commercial corporate shifting"
  },
  "firozabad": {
    landmark: "glass manufacturing smelting plants and local bazaar corridors",
    route: "NH-19 and the Firozabad-Shikohabad route",
    challenge: "highly fragile glass products packing and industrial smoke traffic delays",
    keyword: "fragile goods packaging and industrial relocation transport"
  },

  // --- West Bengal ---
  "kolkata": {
    landmark: "historic Howrah Bridge, Hooghly River banks, and Salt Lake tech hubs",
    route: "NH-16, NH-12, and the AJC Bose Road Flyover corridor",
    challenge: "police daytime truck entry restrictions and tram track intersections",
    keyword: "household shifting and commercial office packing assistance"
  },
  "siliguri": {
    landmark: "strategic Chicken's Neck corridor and Mahananda River bridge",
    route: "NH-10, NH-27, and Hill Cart road networks",
    challenge: "steep Himalayan hairpin loops and rain-induced landslide road blocks",
    keyword: "hilly terrain relocations and tea garden freight logistics"
  },
  "asansol": {
    landmark: "industrial coal mining fields near Damodar River banks",
    route: "NH-19 and the Asansol-Purulia highway",
    challenge: "coal transport truck queues and heavy mining dust road blocks",
    keyword: "heavy-duty industrial transport and mining staff relocation"
  },
  "durgapur": {
    landmark: "planned Steel City public sectors and Damodar barrage",
    route: "NH-19 and the Durgapur Expressway",
    challenge: "public sector enterprise housing permit clearances and heavy factory shifts",
    keyword: "corporate employee relocations and steel machinery logistics"
  },
  "howrah": {
    landmark: "Howrah Railway Terminus and Hooghly River docklands",
    route: "NH-16, Kona Expressway, and Vidyasagar Setu tollway",
    challenge: "extremely dense wholesale market traffic and narrow dock streets",
    keyword: "heavy commercial cargo and household shifting services"
  },
  "kharagpur": {
    landmark: "prestigious IIT campus residential complexes and railway yards",
    route: "NH-16, NH-49, and Kharagpur bypass highway",
    challenge: "managing institutional permit clearances and rural highway loops",
    keyword: "institutional campus shifting and long-distance cargo security"
  },
  "haldia": {
    landmark: "active maritime seaport shipping terminals and Haldi River",
    route: "NH-116 and Haldia port approach highway corridor",
    challenge: "customs checkpost queues and heavy industrial container freight",
    keyword: "seaport cargo logistics and port official home shifting"
  },
  "darjeeling": {
    landmark: "tea garden valleys, Ghoom Monasteries, and Mall Road",
    route: "Hill Cart Road and Darjeeling-Kalimpong mountain routes",
    challenge: "highly narrow steep mountain passes and strict winter mist visibility",
    keyword: "hill station packing services and fragile tea chest logistics"
  },
  "bardhaman": {
    landmark: "rice milling estates and local heritage temple circuits",
    route: "NH-19 and the Bardhaman-Katwa route",
    challenge: "rural mud road navigation and harvesting season tractor blocks",
    keyword: "agricultural logistics and rural household relocations"
  },
  "malda": {
    landmark: "mango orchard trading centres and Mahananda River bypass",
    route: "NH-12 and the Malda-Gaur historical corridor",
    challenge: "seasonal agricultural freight blockades and NH-12 road works",
    keyword: "fruit trade cold logistics and local residential relocations"
  },
  "jalpaiguri": {
    landmark: "Teesta River basin and foothill tea plantation sectors",
    route: "NH-27 and the Jalpaiguri-Siliguri transit highway",
    challenge: "heavy monsoon flooding blocks and forest range speed limits",
    keyword: "tea estate logistics and forest border relocation safety"
  },
  "kalyani": {
    landmark: "planned institutional township sectors and local universities",
    route: "NH-12 and Kalyani Expressway link",
    challenge: "institutional loading permit delays and academic zone speed limits",
    keyword: "campus lab equipment shifting and local home relocation"
  },
  "habra": {
    landmark: "congested Jessore Road trading hubs and local markets",
    route: "NH-112 (Jessore Road) leading to Bangladesh border",
    challenge: "daily cross-border freight traffic and single-lane blocks",
    keyword: "cross-border trade transit and local residential shifting"
  },

  // --- Jharkhand ---
  "ranchi": {
    landmark: "picturesque Hundru Waterfalls and Subarnarekha River plateau",
    route: "NH-33 and the Ranchi Ring Road bypass highway",
    challenge: "navigating steep Chota Nagpur plateau ghat road curves safely",
    keyword: "plateau terrain shifting and domestic household packing"
  },
  "jamshedpur": {
    landmark: "Tata Steel industrial layouts and Kharkai River confluence",
    route: "NH-33 and the Marine Drive highway corridor",
    challenge: "heavy steel plant shipping cargo limits and corporate gate clearances",
    keyword: "corporate executive home relocations and plant cargo packing"
  },
  "dhanbad": {
    landmark: "heavy coal mine quarries and local railway yard tracks",
    route: "NH-19 and the Dhanbad-Sindri road link",
    challenge: "coal transport dumper truck delays and heavy road dust challenges",
    keyword: "mining worker family moves and heavy equipment packaging"
  },
  "bokaro": {
    landmark: "Bokaro Steel City public sectors and Garga River reservoir",
    route: "NH-23 and Bokaro-Dhanbad bypass route",
    challenge: "handling government staff relocation quarters clearance permits",
    keyword: "public sector enterprise shifting and secure household transit"
  },
  "hazaribagh": {
    landmark: "hilly forest sanctuaries and local educational institutions",
    route: "NH-33 and the Hazaribagh-Ranchi expressway",
    challenge: "wildlife corridor nighttime speed limits and sharp curve hazards",
    keyword: "hilly household shifting and boarding school luggage moving"
  },
  "deoghar": {
    landmark: "holy Baba Baidyanath temple complex and local pilgrim bazaars",
    route: "NH-114A and the Deoghar-Dumka highway link",
    challenge: "extreme crowds during Shravan mela season and vehicle entry bans",
    keyword: "temple town home shifting and seasonal luggage logistics"
  },
  "giridih": {
    landmark: "scenic Parasnath hills gateway and Usri River waterfall",
    route: "NH-19 connection and Giridih-Dumri road",
    challenge: "undulating plateau terrain and rural mining access pathways",
    keyword: "local residential packing and industrial mica freight shifts"
  },
  "ramgarh": {
    landmark: "historic Damodar River bridge and local army training center",
    route: "NH-33 and the Ramgarh-Patratu valley expressway",
    challenge: "Patratu valley sharp hairpin turns and heavy coal truck jams",
    keyword: "military cantonment relocations and valley cargo transport"
  },
  "medininagar": {
    landmark: "North Koel River banks and historic Palamu Fort structures",
    route: "NH-39 and Medininagar-Ranchi road link",
    challenge: "highly remote forested pathways and single-lane highway delays",
    keyword: "remote area household shifting and timber transit transport"
  },
  "chas": {
    landmark: "commercial wholesale business blocks next to Bokaro boundary",
    route: "NH-23 and Chas-Purulia border corridor",
    challenge: "dense market vehicle entry bans and border toll booth lines",
    keyword: "wholesale shop packing and local commercial shop moves"
  },
  "jhumri-telaiya": {
    landmark: "Tilaiya Dam reservoir and local mica mining networks",
    route: "NH-31 and the Telaiya-Koderma route",
    challenge: "dam-side winding roads and single-lane bypass construction blocks",
    keyword: "local residential shifting and dam project executive cargo"
  },

  // --- Bihar ---
  "patna": {
    landmark: "Ganga River banks, Patna Junction, and Gandhi Maidan sectors",
    route: "NH-31, Mahatma Gandhi Setu bridge, and Patna bypass corridor",
    challenge: "severe Mahatma Gandhi Setu bottleneck traffic and high summer heat delays",
    keyword: "premium household packing and commercial office moves"
  },
  "gaya": {
    landmark: "sacred Phalgu River ghats and Bodh Gaya international temples",
    route: "NH-83 and the Gaya-Dobhi highway link",
    challenge: "narrow historic streets in old areas and pilgrim tour bus crowds",
    keyword: "monastery articles transport and safe home relocation"
  },
  "muzaffarpur": {
    landmark: "litchi horticultural plantations and Burhi Gandak River",
    route: "NH-57 (East-West Corridor) and NH-22 link routes",
    challenge: "seasonal fruit cargo transport locks and rural highway delays",
    keyword: "agro-products packaging and local household shifting assistance"
  },
  "bhagalpur": {
    landmark: "tussar silk handloom weaving mills and Ganga River bridge",
    route: "NH-80 and Vikramshila Setu bridge link",
    challenge: "Vikramshila Setu traffic bottleneck loops and handloom factory lanes",
    keyword: "delicate handloom machine shifting and safe home packaging"
  },
  "darbhanga": {
    landmark: "historic Darbhanga Royal Palace complexes and Bagmati River",
    route: "NH-57 and Darbhanga airport access link",
    challenge: "dense university campus traffic and monsoonal flood detours",
    keyword: "academic campus laboratory moving and local family moves"
  },
  "arrah": {
    landmark: "Ganga-Sone river delta networks and local market squares",
    route: "NH-922 and Arrah-Patna high-speed highway",
    challenge: "congested colonial-era residential roads and tractor cargo blocks",
    keyword: "domestic packers and movers and agricultural machinery packing"
  },
  "begusarai": {
    landmark: "Barauni petrochemical oil refinery plants and Kanwar Lake",
    route: "NH-31 and the Begusarai bypass corridor",
    challenge: "petrochemical heavy transport checks and industrial zone permit queues",
    keyword: "petrochemical industrial relocation and corporate worker shifting"
  },
  "purnia": {
    landmark: "Kosi River basin areas and local agricultural grain centers",
    route: "NH-31, NH-57, and local bypass corridors",
    challenge: "managing remote northeast Bihar highway routes and monsoon flooding",
    keyword: "northeast India transit and local agricultural warehouse storage"
  },
  "katihar": {
    landmark: "strategic Northeast Frontier Railway yards and local rivers",
    route: "NH-81 and Katihar-Purnia highway link",
    challenge: "railway level crossing delays and high humidity packaging issues",
    keyword: "railway official family relocations and local home shifting"
  },
  "munger": {
    landmark: "Ganga River bank and historic Munger Fort weapons hub",
    route: "NH-80 and the Munger-Jamalpur link road",
    challenge: "Jamalpur railway workshop freight controls and hilly ghat paths",
    keyword: "heavy workshop machinery packing and military cantonment shifts"
  },
  "chhapra": {
    landmark: "Ghaghara-Ganga river confluence and local bazaars",
    route: "NH-19 and Chhapra-Patna bridge corridor",
    challenge: "dense sugarcane cart blocks and old bazaar traffic jams",
    keyword: "local home packing and commercial retail store transfers"
  },
  "bihar-sharif": {
    landmark: "Panchane River basin and local cold storage facilities",
    route: "NH-20 and Bihar Sharif bypass highway",
    challenge: "heavy cold-storage potato truck traffic and narrow trade paths",
    keyword: "cold storage transport and local family shifting support"
  },

  // --- Madhya Pradesh ---
  "bhopal": {
    landmark: "scenic Upper Lake, Lower Lake, and government secretariat",
    route: "NH-46, NH-12, and the VIP Road lakefront highway",
    challenge: "undulating terrain slopes and strict administrative zone speed controls",
    keyword: "government official office shifting and premium home packing"
  },
  "indore": {
    landmark: "cleanest city business sectors and Khan River bypass",
    route: "NH-52, NH-47, and the Super Corridor tech highway",
    challenge: "strict city daytime commercial vehicle entry bans and fast tech parks speed limits",
    keyword: "premium corporate office moves and tech startup lab relocations"
  },
  "gwalior": {
    landmark: "imposing Gwalior Fort hill and Maharaj Bada market squares",
    route: "NH-44 and Gwalior-Jhansi corridor highway",
    challenge: "Chambal valley road route checkpoints and fort-side narrow roads",
    keyword: "military cantonment household shifting and heritage goods transport"
  },
  "jabalpur": {
    landmark: "Bhedaghat Marble Rocks and sacred Narmada River banks",
    route: "NH-30, NH-34, and Jabalpur bypass expressway",
    challenge: "West Central Railway zone transfers checkouts and ordnance factory permit gates",
    keyword: "ordnance factory worker shifts and railway officer home transport"
  },
  "ujjain": {
    landmark: "sacred Kshipra River ghats and Mahakaleshwar Jyotirlinga temple",
    route: "NH-52 and Ujjain-Indore four-lane expressway",
    challenge: "extreme festival pilgrim traffic jams and narrow temple zone bypasses",
    keyword: "holy temple articles packaging and local home shifting"
  },
  "dewas": {
    landmark: "industrial manufacturing parks and Bank Note Press complex",
    route: "NH-52 and Dewas-Bhopal expressway corridor",
    challenge: "strict Bank Note Press zone security checks and industrial dust",
    keyword: "secure corporate cargo transport and heavy machinery packing"
  },
  "satna": {
    landmark: "cement manufacturing plants and local limestone quarry yards",
    route: "NH-30 and Satna-Rewa highway link",
    challenge: "heavy cement cargo dumper truck traffic and railway loading yard lines",
    keyword: "cement factory corporate shifting and industrial heavy cargo transport"
  },
  "sagar": {
    landmark: "historic Lakha Banjara Lake and army cantonment sectors",
    route: "NH-44 and Sagar-Bina railway network route",
    challenge: "undulating central plateau terrain and forest area checkposts",
    keyword: "cantonment family moves and local residential packaging support"
  },
  "ratlam": {
    landmark: "major railway junction terminal yards and local gold markets",
    route: "NH-79 and Ratlam-Jaipur link highway",
    challenge: "divisional railway cargo clearances and busy gold bazaar pathways",
    keyword: "railway official family moving and high-security retail packing"
  },
  "rewa": {
    landmark: "scenic Bichhiya River banks and white tiger safari parks",
    route: "NH-30 and Rewa-Sidhi hilly highway route",
    challenge: "sidhi ghat mountain road curves and forest ranger checkpoint stops",
    keyword: "hilly terrain relocations and domestic household shifting"
  },
  "katni": {
    landmark: "lime mining quarries and active railway shunting yards",
    route: "NH-30, NH-43, and Katni bypass highway",
    challenge: "heavy mining trucks dust and level crossing delays",
    keyword: "mining sector corporate moves and industrial raw cargo packaging"
  },
  "morena": {
    landmark: "Chambal River borders and local oil mills districts",
    route: "NH-44 (North-South Corridor) and Morena bypass highway",
    challenge: "inter-state border checkpost lines and heavy agricultural freight",
    keyword: "inter-state cargo shipping and domestic packers movers"
  },

  // --- Andhra Pradesh ---
  "vijayawada": {
    landmark: "Krishna River delta, Prakasam Barrage, and Kanaka Durga temple",
    route: "NH-16, NH-65, and Vijayawada inner ring road",
    challenge: "heavy commercial trade traffic and Prakasam Barrage vehicle weight checks",
    keyword: "commercial retail packing and high-speed cargo transport"
  },
  "visakhapatnam": {
    landmark: "scenic Dolphin's Nose hills, Vizag seaport docklands, and RK Beach",
    route: "NH-16 and port connectivity highway corridor",
    challenge: "coastal humidity packing issues and naval base restricted area clearances",
    keyword: "seaport shipping container cargo and navy officer relocation"
  },
  "guntur": {
    landmark: "chilli trading markets and Krishna River canal network systems",
    route: "NH-16 and Guntur-Amaravati road highway",
    challenge: "managing logistics inside Asia's largest chilli market yards",
    keyword: "agro-commodity packing and local residential shifting"
  },
  "nellore": {
    landmark: "Penna River banks and coastal aquaculture shrimp zones",
    route: "NH-16 and Krishnapatnam Port road link",
    challenge: "port container trailer congestion and sandy coastal terrain routes",
    keyword: "coastal industrial shifting and domestic packers movers"
  },
  "tirupati": {
    landmark: "sacred Seshachalam hills and Tirumala Balaji temple complex",
    route: "NH-71, NH-140, and Alipiri toll gate road link",
    challenge: "mountainous ghat road safety regulations and heavy pilgrim crowds",
    keyword: "hill-climb vehicle logistics and domestic household shifting"
  },
  "kurnool": {
    landmark: "Tungabhadra River banks and Konda Reddy Fort structure",
    route: "NH-44 and Kurnool-Kadapa highway corridor",
    challenge: "heavy Rayalaseema heatwave delays and highway checkpost queues",
    keyword: "long-distance interstate transport and safe household packaging"
  },
  "kakinada": {
    landmark: "deepwater seaport shipping terminals and Hope Island coastal zone",
    route: "NH-216 and port approach roads",
    challenge: "coastal salt air rust prevention packing and customs checking queues",
    keyword: "seaport cargo logistics and industrial worker relocations"
  },
  "rajamahendravaram": {
    landmark: "historic Godavari River bridge and local delta flower markets",
    route: "NH-16 and Godavari bridge bypass corridor",
    challenge: "narrow ancient residential lanes and Godavari flood-time detours",
    keyword: "historic town home relocations and delicate goods packing"
  },
  "kadapa": {
    landmark: "Penna River basin and local barytes mining hills",
    route: "NH-40 and Kadapa-Kurnool corridor highway",
    challenge: "rough quarry road conditions and intense summer heat delays",
    keyword: "mining staff relocations and heavy cargo industrial packing"
  },
  "anantapur": {
    landmark: "arid rocky hills and clock tower heritage circle",
    route: "NH-44 (connecting Bengaluru to Hyderabad)",
    challenge: "high-temperature transit checks and interstate toll checkpoint lines",
    keyword: "inter-state packers movers and Bengaluru corridor cargo transit"
  },
  "eluru": {
    landmark: "Tammileru River basin and local agricultural canal locks",
    route: "NH-16 and Eluru bypass road corridor",
    challenge: "rural canal bridge weight locks and harvest season road blocks",
    keyword: "rural agricultural shifting and local household relocations"
  },
  "vizianagaram": {
    landmark: "historic Vizianagaram Fort and local market centers",
    route: "NH-26 and Vizianagaram bypass corridor",
    challenge: "narrow old-town marketplace curves and railway crossing stops",
    keyword: "palace heritage articles transport and local family relocations"
  },

  // --- Odisha ---
  "bhubaneswar": {
    landmark: "ancient Lingaraj Temple heritage zone and Infocity IT business park",
    route: "NH-16 and the Nandankanan highway corridor",
    challenge: "highly secure administrative office zones entry permissions",
    keyword: "premium IT company office moves and corporate staff relocation"
  },
  "cuttack": {
    landmark: "Mahanadi River delta banks and ancient silver filigree lanes",
    route: "NH-16 and the Cuttack-Sambalpur highway bypass",
    challenge: "extremely narrow old-city alleys and heavy monsoon flooding bypasses",
    keyword: "local household packing and delicate filigree items transport"
  },
  "rourkela": {
    landmark: "Koel-Sankh rivers confluence point and massive steel manufacturing zones",
    route: "NH-143 and Rourkela bypass road corridor",
    challenge: "heavy steel plant shipping cargo limits and corporate employee colony permissions",
    keyword: "industrial heavy plant shifting and steel company staff relocations"
  },
  "puri": {
    landmark: "sacred Jagannath Temple, Grand Road bazaar, and beach bayfront",
    route: "NH-316 and the Puri-Konark Marine Drive corridor",
    challenge: "extreme pilgrim crowds during Rath Yatra festival and salt-air moisture hazards",
    keyword: "moisture-proof household packing and coastal relocation support"
  },
  "sambalpur": {
    landmark: "mighty Hirakud Dam reservoir and Mahanadi River banks",
    route: "NH-53 and Sambalpur-Rourkela highway link",
    challenge: "heavy mining trucks cargo traffic and Hirakud dam-side high wind speeds",
    keyword: "long-haul heavy cargo transit and local household packing"
  },
  "balasore": {
    landmark: "Chandipur sea missile launch station zones and local river channels",
    route: "NH-16 and Balasore bypass road corridor",
    challenge: "defense checkpost vehicle clearances and sandy coast approach routes",
    keyword: "coastal household packing and defense official family relocations"
  },
  "berhampur": {
    landmark: "silk weaving handloom factories and local trading bazaars",
    route: "NH-16 and Berhampur bypass corridor",
    challenge: "highly dense market traffic bottlenecks and narrow streets",
    keyword: "delicate silk handloom transit and local household moving services"
  },
  "jharsuguda": {
    landmark: "active regional airport and local metal smelting industries",
    route: "NH-49 and Jharsuguda bypass link",
    challenge: "coordinating cargo container transport through heavy metallurgy corridors",
    keyword: "metal industry relocations and secure domestic packers movers"
  },
  "baripada": {
    landmark: "Budhabalanga River basin and Similipal National Forest gateway",
    route: "NH-18 and Baripada-Balasore corridor",
    challenge: "nighttime forest reserve transit regulations and elephant crossing blocks",
    keyword: "forest gateway freight shipping and local home relocations"
  },
  "bhadrak": {
    landmark: "Salandi River basin and local temple heritage loops",
    route: "NH-16 and Bhadrak bypass highway",
    challenge: "highway construction detours and heavy seasonal rain flooding",
    keyword: "coastal delta family moving and domestic cargo transport"
  }
};

// Researched unique state profiles for semantic entity association
const stateSeoData = {
  "uttar-pradesh": {
    link: "https://en.wikipedia.org/wiki/Uttar_Pradesh",
    desc: "Uttar Pradesh is India's most populous state, offering a massive logistics landscape anchored by major agricultural trade zones, expanding expressways (Yamuna, Purvanchal, and Ganga Expressways), and historic hubs like Lucknow, Kanpur, and Varanasi."
  },
  "west-bengal": {
    link: "https://en.wikipedia.org/wiki/West_Bengal",
    desc: "West Bengal represents the gateway to Northeast India and international maritime trade, featuring the major Kolkata seaport, industrial belts in Durgapur and Asansol, and mountainous tea plantation corridors in Siliguri and Darjeeling."
  },
  "jharkhand": {
    link: "https://en.wikipedia.org/wiki/Jharkhand",
    desc: "Jharkhand, the mineral-rich land of forests and plateaus, poses unique heavy-freight challenges for shifting operations across mining hubs like Dhanbad, industrial steel cities like Jamshedpur and Bokaro, and plateau terrains in Ranchi."
  },
  "bihar": {
    link: "https://en.wikipedia.org/wiki/Bihar",
    desc: "Bihar, situated in the fertile Gangetic plains, has a high demand for domestic household shifting and agricultural logistics across its historical urban centers like Patna, pilgrim zones like Gaya, and trading corridors like Muzaffarpur."
  },
  "madhya-pradesh": {
    link: "https://en.wikipedia.org/wiki/Madhya_Pradesh",
    desc: "Madhya Pradesh, the heart of India, bridges major north-south freight routes via key national highways, with commercial relocations focused in cities like Indore, Bhopal, Gwalior, and Jabalpur."
  },
  "andhra-pradesh": {
    link: "https://en.wikipedia.org/wiki/Andhra_Pradesh",
    desc: "Andhra Pradesh boasts a long coastline and strategic maritime trade corridors, driving logistics and corporate home relocations across ports like Visakhapatnam, commercial centers like Vijayawada, and temple hubs like Tirupati."
  },
  "odisha": {
    link: "https://en.wikipedia.org/wiki/Odisha",
    desc: "Odisha is a coastal state experiencing rapid industrialization and urban relocation demands, anchored by IT hubs in Bhubaneswar, silver lanes in Cuttack, steel plants in Rourkela, and coastal hubs like Puri."
  }
};

async function seedSeoText() {
  console.log("=== STARTING BATCH DATABASE PROGRAMMATIC SEO SEEDING ===");
  try {
    await initDb();

    // 1. Seed State SEO descriptions
    const states = await db('states').select('id', 'name', 'slug');
    console.log(`Found ${states.length} states in database.`);

    for (const state of states) {
      const stateData = stateSeoData[state.slug];
      if (stateData) {
        // Construct highly unique descriptive state text incorporating target entity anchors
        const uniqueText = `${stateData.desc} When hiring packers and movers in <a href="${stateData.link}" target="_blank" rel="nofollow noopener noreferrer" class="text-brand-orange hover:underline font-bold">${state.name}</a>, understanding inter-city tolls, state border transit clearances, and expressway weight checks is vital to secure damage-free logistics services for household goods.`;
        
        await db('states').where({ id: state.id }).update({ seo_text: uniqueText });
        console.log(`✅ Seeded SEO text for State: ${state.name}`);
      } else {
        // Fallback generic but unique text for state to avoid nulls
        const fallbackText = `${state.name} is a key operational state for domestic logistics. Hiring verified packers and movers in <a href="https://en.wikipedia.org/wiki/${state.slug.replace(/-/g, '_')}" target="_blank" rel="nofollow noopener noreferrer" class="text-brand-orange hover:underline font-bold">${state.name}</a> ensures transit safety, household protection insurance, and cargo container security across all destinations.`;
        await db('states').where({ id: state.id }).update({ seo_text: fallbackText });
        console.log(`⚠️  Seeded Fallback SEO text for State: ${state.name}`);
      }
    }

    // 2. Seed City SEO descriptions
    const cities = await db('cities').select('id', 'name', 'slug', 'state_id');
    console.log(`Found ${cities.length} cities in database.`);

    for (const city of cities) {
      const state = states.find(s => s.id === city.state_id);
      const stateName = state ? state.name : "";
      
      const cityData = citySeoData[city.slug];
      const wikiUrl = `https://en.wikipedia.org/wiki/${city.name.replace(/\s+/g, '_')}`;

      let compiledText = "";

      if (cityData) {
        // Compile highly specific, researched text block with Wikipedia external entity linking
        compiledText = `Finding high-quality relocation services in <a href="${wikiUrl}" target="_blank" rel="nofollow noopener noreferrer" class="text-brand-orange hover:underline font-bold">${city.name}</a> (${stateName}) requires analyzing carrier credentials, registration documents, and local ratings. Shifting operations in the region are often centered around local landmarks like the ${cityData.landmark}. The primary logistics transport lanes route through ${cityData.route}, which connects local shifting transit to other major Indian cities. Shifting challenges specific to this area include ${cityData.challenge}. Choosing vetted packing carriers guarantees secure handling for ${cityData.keyword} to eliminate transit damages.`;
      } else {
        // Safe dynamic content compiler fallback for any other cities in the database
        compiledText = `Finding professional shifting providers in <a href="${wikiUrl}" target="_blank" rel="nofollow noopener noreferrer" class="text-brand-orange hover:underline font-bold">${city.name}</a> (${stateName}) requires matching your requirements with vetted local vendors. Shifting cargo moves through major state highways, carrying freight across local commercial sectors and key transit junctions. Typical regional challenges include navigating high-traffic corridors and residential entry restrictions. Opting for certified relocation companies guarantees safe loading and unloading assistance.`;
      }

      await db('cities').where({ id: city.id }).update({ seo_text: compiledText });
      console.log(`✅ Seeded SEO text for City: ${city.name} (${stateName})`);
    }

    console.log("\n✨ DATABASE PROGRAMMATIC SEO SEEDING COMPLETED SUCCESSFULLY! ✨");
    process.exit(0);
  } catch (err) {
    console.error("Fatal Seeding Error:", err);
    process.exit(1);
  }
}

seedSeoText();
