const { query, generateId } = require('../lib/db');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// 28 States & 8 Union Territories with comprehensive districts, cities, and statutory towns
const panIndiaData = [
  // --- NORTH INDIA ---
  {
    name: 'Uttar Pradesh',
    slug: 'uttar-pradesh',
    region: 'North',
    cities: [
      { name: 'Lucknow', tier: 1, localities: ['Gomti Nagar', 'Alambagh', 'Hazratganj', 'Indira Nagar', 'Mahanagar', 'Vikas Nagar'] },
      { name: 'Kanpur', tier: 1, localities: ['Civil Lines', 'Swaroop Nagar', 'Kidwai Nagar', 'Kalyanpur', 'Kakadeo'] },
      { name: 'Noida', tier: 1, localities: ['Sector 62', 'Sector 18', 'Sector 137', 'Sector 50', 'Greater Noida'] },
      { name: 'Ghaziabad', tier: 1, localities: ['Indirapuram', 'Vaishali', 'Vasundhara', 'Raj Nagar', 'Crossings Republik'] },
      { name: 'Varanasi', tier: 2, localities: ['Lanka', 'Sigra', 'Bhelupur', 'Shivpur', 'Cantt', 'Godowlia'] },
      { name: 'Agra', tier: 2, localities: ['Sanjay Place', 'Tajganj', 'Kamla Nagar', 'Fatehabad Road', 'Dayal Bagh'] },
      { name: 'Prayagraj', tier: 2, localities: ['Civil Lines', 'Georgetown', 'Katra', 'Tagore Town', 'Naini'] },
      { name: 'Bareilly', tier: 2, localities: ['Civil Lines', 'DD Puram', 'Rajendra Nagar', 'Izzatnagar'] },
      { name: 'Aligarh', tier: 2, localities: ['Civil Lines', 'Centre Point', 'Marris Road', 'Ramghat Road'] },
      { name: 'Moradabad', tier: 2, localities: ['Civil Lines', 'Ram Ganga Vihar', 'Majhola', 'Kanth Road'] },
      { name: 'Gorakhpur', tier: 2, localities: ['Civil Lines', 'Golghar', 'Taramandal', 'Shahpur', 'Medical College'] },
      { name: 'Meerut', tier: 2, localities: ['Shastri Nagar', 'Modipuram', 'Ganga Nagar', 'Saket'] },
      { name: 'Jhansi', tier: 2, localities: ['Sadar Bazar', 'Sipri Bazar', 'Civil Lines', 'Nandan Pura'] },
      { name: 'Mathura', tier: 2, localities: ['Krishna Nagar', 'Vrindavan', 'Dampier Nagar', 'Refinery Nagar'] },
      { name: 'Ayodhya', tier: 2, localities: ['Faizabad Cantt', 'Civil Lines', 'Naya Ghat', 'Rikabganj'] },
      { name: 'Renukoot', tier: 3, localities: ['Hindalco Colony', 'Murdhawa', 'Pipri', 'Turra'] },
      { name: 'Singrauli Belt (UP)', tier: 3, localities: ['Anpara', 'Shaktinagar', 'Obra', 'Bijpur'] },
      { name: 'Firozabad', tier: 3, localities: ['Suhag Nagar', 'Station Road', 'Raja Ka Taal'] },
      { name: 'Muzaffarnagar', tier: 3, localities: ['New Mandi', 'Civil Lines', 'Gandhi Colony'] },
      { name: 'Saharanpur', tier: 2, localities: ['Court Road', 'Mission Compound', 'Delhi Road'] }
    ]
  },
  {
    name: 'Delhi NCR',
    slug: 'delhi',
    region: 'North',
    cities: [
      { name: 'New Delhi', tier: 1, localities: ['Connaught Place', 'Chanakyapuri', 'Vasant Kunj', 'Hauz Khas', 'Saket', 'Lajpat Nagar'] },
      { name: 'North Delhi', tier: 1, localities: ['Rohini', 'Pitampura', 'Model Town', 'Civil Lines', 'Shalimar Bagh'] },
      { name: 'South Delhi', tier: 1, localities: ['Greater Kailash', 'South Extension', 'Green Park', 'Malviya Nagar', 'Kalkaji'] },
      { name: 'West Delhi', tier: 1, localities: ['Janakpuri', 'Rajouri Garden', 'Punjabi Bagh', 'Dwarka', 'Paschim Vihar'] },
      { name: 'East Delhi', tier: 1, localities: ['Mayur Vihar', 'Preet Vihar', 'Laxmi Nagar', 'Patparganj', 'Vivek Vihar'] }
    ]
  },
  {
    name: 'Haryana',
    slug: 'haryana',
    region: 'North',
    cities: [
      { name: 'Gurugram', tier: 1, localities: ['Cyber City', 'DLF Phase 1-5', 'Sohna Road', 'Golf Course Road', 'Sector 56', 'Palam Vihar'] },
      { name: 'Faridabad', tier: 1, localities: ['Sector 15', 'Sector 21', 'NIT Faridabad', 'Greenfield', 'Surajkund'] },
      { name: 'Panipat', tier: 2, localities: ['Model Town', 'Sector 11', 'Sector 25 Industrial Area'] },
      { name: 'Ambala', tier: 2, localities: ['Ambala Cantt', 'Ambala City', 'Model Town', 'Sector 9'] },
      { name: 'Karnal', tier: 2, localities: ['Model Town', 'Sector 13', 'Sector 6', 'Kunjpura Road'] },
      { name: 'Hisar', tier: 2, localities: ['Urban Estate', 'Model Town', 'Auto Market', 'Sector 14'] },
      { name: 'Rohtak', tier: 2, localities: ['Model Town', 'Sector 1', 'Subhash Nagar', 'Mansarovar'] },
      { name: 'Sonipat', tier: 2, localities: ['Model Town', 'Kundli', 'Sector 14', 'Rai'] },
      { name: 'Panchkula', tier: 2, localities: ['Sector 4', 'Sector 7', 'Sector 20', 'MDC'] }
    ]
  },
  {
    name: 'Punjab',
    slug: 'punjab',
    region: 'North',
    cities: [
      { name: 'Ludhiana', tier: 1, localities: ['Model Town', 'Sarabha Nagar', 'BRS Nagar', 'Civil Lines', 'Ferozepur Road'] },
      { name: 'Amritsar', tier: 2, localities: ['Ranjit Avenue', 'Mall Road', 'Lawrence Road', 'Civil Lines', 'Majitha Road'] },
      { name: 'Jalandhar', tier: 2, localities: ['Model Town', 'Civil Lines', 'Urban Estate', 'Defence Colony'] },
      { name: 'Patiala', tier: 2, localities: ['Model Town', 'Urban Estate Phase 1', 'Baradari', 'Leela Bhawan'] },
      { name: 'Bathinda', tier: 2, localities: ['Model Town', 'Civil Lines', 'Thermal Colony'] },
      { name: 'Mohali', tier: 1, localities: ['Phase 7', 'Phase 3B2', 'Sector 70', 'Sector 82 IT City', 'Aerocity'] }
    ]
  },
  {
    name: 'Chandigarh',
    slug: 'chandigarh',
    region: 'North',
    cities: [
      { name: 'Chandigarh', tier: 1, localities: ['Sector 17', 'Sector 35', 'Sector 8', 'Sector 22', 'Sector 43', 'Manimajra'] }
    ]
  },
  {
    name: 'Rajasthan',
    slug: 'rajasthan',
    region: 'North',
    cities: [
      { name: 'Jaipur', tier: 1, localities: ['Vaishali Nagar', 'Malviya Nagar', 'Mansarovar', 'C Scheme', 'Raja Park', 'Jagatpura'] },
      { name: 'Jodhpur', tier: 2, localities: ['Shastri Nagar', 'Ratanada', 'Sardarpura', 'Pal Road', 'Basni'] },
      { name: 'Kota', tier: 2, localities: ['Talwandi', 'Vigyan Nagar', 'Dadabari', 'Mahaveer Nagar', 'Indraprastha'] },
      { name: 'Udaipur', tier: 2, localities: ['Hiran Magri', 'Fatehpura', 'Panchwati', 'Madhuban', 'Sukher'] },
      { name: 'Ajmer', tier: 2, localities: ['Civil Lines', 'Vaishali Nagar', 'Panchsheel Nagar', 'Adarsh Nagar'] },
      { name: 'Bikaner', tier: 2, localities: ['Kanta Khaturia Colony', 'Jai Narayan Vyas Colony', 'Sadar Bazar'] },
      { name: 'Bhilwara', tier: 3, localities: ['Subhash Nagar', 'Bhopal Ganj', 'Patel Nagar'] },
      { name: 'Alwar', tier: 2, localities: ['Company Bagh', 'MIA Industrial Area', 'Neemrana', 'Bhiwadi'] }
    ]
  },
  {
    name: 'Uttarakhand',
    slug: 'uttarakhand',
    region: 'North',
    cities: [
      { name: 'Dehradun', tier: 2, localities: ['Rajpur Road', 'Jakhan', 'Vasant Vihar', 'Dalanwala', 'Clement Town'] },
      { name: 'Haridwar', tier: 2, localities: ['Ranipur More', 'Shivalik Nagar', 'Kankhal', 'SIIDCUL'] },
      { name: 'Roorkee', tier: 2, localities: ['Civil Lines', 'IIT Campus', 'Solani Puram'] },
      { name: 'Haldwani', tier: 2, localities: ['Kaladhungi Road', 'Nainital Road', 'Kathgodam', 'Tikonia'] },
      { name: 'Rishikesh', tier: 3, localities: ['Tapovan', 'Muni Ki Reti', 'Awas Vikas Colony'] },
      { name: 'Rudrapur', tier: 3, localities: ['Pantnagar SIDCUL', 'Awas Vikas', 'Civil Lines'] }
    ]
  },
  {
    name: 'Himachal Pradesh',
    slug: 'himachal-pradesh',
    region: 'North',
    cities: [
      { name: 'Shimla', tier: 2, localities: ['Mall Road', 'Sanjauli', 'Chotta Shimla', 'Kasumpti', 'New Shimla'] },
      { name: 'Dharamshala', tier: 3, localities: ['McLeod Ganj', 'Kotwali Bazar', 'Dari', 'Civil Lines'] },
      { name: 'Mandi', tier: 3, localities: ['Bhiuli', 'Sauli Khad', 'Motibagh'] },
      { name: 'Solan', tier: 3, localities: ['Mall Road', 'Chambaghat', 'Kumarhatti', 'Baddi Industrial Area'] },
      { name: 'Kullu Manali', tier: 3, localities: ['Model Town Manali', 'Sarvari', 'Dhalpur'] }
    ]
  },
  {
    name: 'Jammu and Kashmir',
    slug: 'jammu-and-kashmir',
    region: 'North',
    cities: [
      { name: 'Srinagar', tier: 2, localities: ['Lal Chowk', 'Rajbagh', 'Hyderpora', 'Karan Nagar', 'Sanat Nagar'] },
      { name: 'Jammu', tier: 2, localities: ['Gandhi Nagar', 'Trikuta Nagar', 'Channi Himmat', 'Bahu Plaza', 'Talab Tillo'] },
      { name: 'Anantnag', tier: 3, localities: ['KP Road', 'Nai Basti', 'Ashajipora'] },
      { name: 'Udhampur', tier: 3, localities: ['Subash Nagar', 'Dhar Road', 'Kallar'] }
    ]
  },
  {
    name: 'Ladakh',
    slug: 'ladakh',
    region: 'North',
    cities: [
      { name: 'Leh', tier: 3, localities: ['Main Bazaar', 'Choglamsar', 'Skalzangling'] },
      { name: 'Kargil', tier: 3, localities: ['Baroo', 'Biamathang', 'Main Market'] }
    ]
  },

  // --- EAST INDIA (National Packers & Movers Core Stronghold) ---
  {
    name: 'Jharkhand',
    slug: 'jharkhand',
    region: 'East',
    cities: [
      { name: 'Dhanbad', tier: 1, localities: ['Bank More', 'Saraidhela', 'Hirapur', 'Steel Gate', 'Koyla Nagar', 'Jharia', 'Katras', 'Govindpur'] },
      { name: 'Ranchi', tier: 1, localities: ['Harmu Housing Colony', 'Ashok Nagar', 'Kanke Road', 'Lalpur', 'Bariatu', 'Doranda', 'Morabadi'] },
      { name: 'Jamshedpur', tier: 1, localities: ['Bistupur', 'Sakchi', 'Kadma', 'Sonari', 'Telco Colony', 'Baridih', 'Mango', 'Adityapur'] },
      { name: 'Bokaro Steel City', tier: 2, localities: ['Sector 4', 'Sector 1', 'Sector 9', 'Chas', 'Cooperative Colony', 'Marafari'] },
      { name: 'Hazaribagh', tier: 2, localities: ['Matwari', 'Korrah', 'Canary Hill Road', 'Pelawal'] },
      { name: 'Deoghar', tier: 2, localities: ['Castairs Town', 'Bilasir Town', 'Jasidih Industrial Area', 'Kunda'] },
      { name: 'Giridih', tier: 2, localities: ['Bada Chowk', 'Makatpur', 'Beniadih', 'Sirsiya'] },
      { name: 'Ramgarh', tier: 2, localities: ['Patratu', 'Ramgarh Cantt', 'Gola Road', 'Kuju'] },
      { name: 'Medininagar (Daltonganj)', tier: 3, localities: ['Shahpur', 'Hamid Ganj', 'Redma', 'Bairia'] },
      { name: 'Chas', tier: 3, localities: ['Check Post', 'Kanta Phari', 'Telidih', 'Bypass Road'] },
      { name: 'Jhumri Telaiya', tier: 3, localities: ['Station Road', 'Gumo', 'Ranchi-Patna Road'] },
      { name: 'Chaibasa', tier: 3, localities: ['Tata College Road', 'Sadar Bazar', 'Tambu Chowk'] },
      { name: 'Dumka', tier: 3, localities: ['Tin Bazaar', 'Kurwa', 'Dudhani'] },
      { name: 'Ghatshila', tier: 3, localities: ['Mouhandar', 'Dahi Goria', 'College Road'] },
      { name: 'Bermo', tier: 3, localities: ['Phusro', 'Dhori', 'Jarangdih'] }
    ]
  },
  {
    name: 'Bihar',
    slug: 'bihar',
    region: 'East',
    cities: [
      { name: 'Patna', tier: 1, localities: ['Boring Road', 'Kankarbagh', 'Bailey Road', 'Rajendra Nagar', 'Danapur', 'Patliputra Colony', 'Anisabad'] },
      { name: 'Gaya', tier: 2, localities: ['AP Colony', 'Civil Lines', 'Bodhgaya Road', 'Chandauti'] },
      { name: 'Muzaffarpur', tier: 2, localities: ['Mithanpura', 'Aghoria Bazar', 'Kalambagh Road', 'Brahmpura', 'Juran Chapra'] },
      { name: 'Bhagalpur', tier: 2, localities: ['Adampur', 'Zero Mile', 'Tilkamanjhi', 'Barari'] },
      { name: 'Darbhanga', tier: 2, localities: ['Laheriasarai', 'Allalpatti', 'Donar', 'Mirzapur'] },
      { name: 'Purnia', tier: 2, localities: ['Line Bazar', 'Bhatta Bazar', 'Gulabbagh', 'Madhubani'] },
      { name: 'Begusarai', tier: 2, localities: ['Harrakh', 'Barauni Refinery Colony', 'Kapasiya'] },
      { name: 'Arrah (Bhojpur)', tier: 2, localities: ['Nawada', 'Anaith', 'Civil Lines'] },
      { name: 'Katihar', tier: 2, localities: ['Mirchaibari', 'Mangal Bazar', 'Tingachia'] },
      { name: 'Munger', tier: 3, localities: ['Jamalpur', 'Bekapur', 'Purabsarai'] },
      { name: 'Chhapra', tier: 2, localities: ['Garkha Road', 'Dahiyawan', 'Prabhunath Nagar'] },
      { name: 'Bihar Sharif', tier: 2, localities: ['Ranchi Road', 'Khandak Par', 'Ramchandrapur'] },
      { name: 'Sasaram', tier: 3, localities: ['Gaurakshini', 'Fazalganj Industrial Area', 'Civil Lines'] },
      { name: 'Motihari', tier: 3, localities: ['Chhatauni', 'Main Road', 'Janpul'] },
      { name: 'Samastipur', tier: 3, localities: ['Magardahi', 'Kashipur', 'Mohanpur'] }
    ]
  },
  {
    name: 'West Bengal',
    slug: 'west-bengal',
    region: 'East',
    cities: [
      { name: 'Kolkata', tier: 1, localities: ['Salt Lake', 'New Town', 'Ballygunge', 'Alipore', 'Behala', 'Garia', 'Dum Dum', 'Rajarhat', 'Jadavpur'] },
      { name: 'Howrah', tier: 1, localities: ['Shibpur', 'Salkia', 'Bally', 'Mandirtala', 'Santragachi', 'Liluah'] },
      { name: 'Siliguri', tier: 2, localities: ['Sevoke Road', 'Pradhan Nagar', 'Hakim Para', 'Matigara', 'Khalpara'] },
      { name: 'Asansol', tier: 2, localities: ['Burnpur', 'Ushagram', 'Kalyanpur Housing', 'Chelidanga', 'SB Gorai Road'] },
      { name: 'Durgapur', tier: 2, localities: ['City Centre', 'Benachity', 'Bidhannagar', 'Steel Township', 'Muchipara'] },
      { name: 'Kharagpur', tier: 2, localities: ['IIT Campus Area', 'Gol Bazar', 'Inda', 'Malancha'] },
      { name: 'Haldia', tier: 2, localities: ['Durgachak', 'City Centre Haldia', 'Basudevpur', 'Sutahata'] },
      { name: 'Bardhaman', tier: 2, localities: ['Curzon Gate', 'Golapbag', 'Birhata', 'Vivekananda Pally'] },
      { name: 'Malda', tier: 2, localities: ['English Bazar', 'Mangalbari', 'Mokdumpur'] },
      { name: 'Darjeeling', tier: 3, localities: ['Mall Road', 'Chowrasta', 'Lebong', 'Jalapahar'] },
      { name: 'Jalpaiguri', tier: 3, localities: ['Kadamtala', 'Mohitnagar', 'Raninagar'] },
      { name: 'Kalyani', tier: 3, localities: ['Block A', 'Block B', 'AIIMS Kalyani Area'] },
      { name: 'Habra', tier: 3, localities: ['Jessore Road', 'Banipur', 'Station Area'] }
    ]
  },
  {
    name: 'Odisha',
    slug: 'odisha',
    region: 'East',
    cities: [
      { name: 'Bhubaneswar', tier: 1, localities: ['Patia', 'Nayapalli', 'Saheed Nagar', 'Khandagiri', 'Chandrasekharpur', 'Jayadev Vihar'] },
      { name: 'Cuttack', tier: 2, localities: ['CDA Sector 6-10', 'Badambadi', 'Link Road', 'Madhupatna', 'College Square'] },
      { name: 'Rourkela', tier: 2, localities: ['Civil Township', 'Koel Nagar', 'Udit Nagar', 'Panposh', 'Sector 1-20'] },
      { name: 'Sambalpur', tier: 2, localities: ['Dhanupali', 'Ainthapali', 'Budharaja', 'Khetrajpur'] },
      { name: 'Puri', tier: 3, localities: ['VIP Road', 'Sea Beach', 'Grand Road', 'Talabania'] },
      { name: 'Balasore', tier: 2, localities: ['OT Road', 'Fakir Mohan Nagar', 'Kuruda'] },
      { name: 'Berhampur', tier: 2, localities: ['Gandhinagar', 'Kamapalli', 'Gosani Nuagaon'] },
      { name: 'Jharsuguda', tier: 3, localities: ['Vedanta Township', 'Mangalbazar', 'Sarbahal', 'Brundamal'] },
      { name: 'Baripada', tier: 3, localities: ['Baghra Road', 'Station Road', 'Deulasahi'] },
      { name: 'Bhadrak', tier: 3, localities: ['Charampa', 'Bonth Chowk', 'Kacheri Bazar'] }
    ]
  },

  // --- CENTRAL INDIA ---
  {
    name: 'Madhya Pradesh',
    slug: 'madhya-pradesh',
    region: 'Central',
    cities: [
      { name: 'Indore', tier: 1, localities: ['Vijay Nagar', 'Palasia', 'Bhawarkua', 'Super Corridor', 'Rau', 'Sapna Sangeeta'] },
      { name: 'Bhopal', tier: 1, localities: ['Arera Colony', 'MP Nagar', 'Hoshangabad Road', 'Kolar Road', 'Ayodhya Bypass'] },
      { name: 'Jabalpur', tier: 2, localities: ['Civil Lines', 'Wright Town', 'Vijay Nagar', 'Napier Town', 'Gorakhpur'] },
      { name: 'Gwalior', tier: 2, localities: ['City Centre', 'Lashkar', 'Morar', 'Thatipur', 'Maharaj Bada'] },
      { name: 'Ujjain', tier: 2, localities: ['Freeganj', 'Nanakheda', 'Madhav Nagar', 'Dewas Road'] },
      { name: 'Singrauli (MP HQ)', tier: 2, localities: ['Waidhan', 'Morwa', 'Vindhyanagar NTPC', 'Jayant NCL', 'Nigahi'] },
      { name: 'Satna', tier: 2, localities: ['Panna Naka', 'Civil Lines', 'Bharhut Nagar', 'Birla Colony'] },
      { name: 'Sagar', tier: 2, localities: ['Civil Lines', 'Makronia', 'Tili Road', 'Gopal Ganj'] },
      { name: 'Rewa', tier: 2, localities: ['Civil Lines', 'Bodabag', 'University Road', 'Urrhat'] },
      { name: 'Katni', tier: 2, localities: ['Madhav Nagar', 'Barhi Road', 'Civil Lines'] },
      { name: 'Ratlam', tier: 3, localities: ['Station Road', 'Alkapuri', 'Kasturba Nagar'] },
      { name: 'Dewas', tier: 3, localities: ['Bhopal Road', 'Vikas Nagar', 'Industrial Area'] }
    ]
  },
  {
    name: 'Chhattisgarh',
    slug: 'chhattisgarh',
    region: 'Central',
    cities: [
      { name: 'Raipur', tier: 1, localities: ['Shankar Nagar', 'Telibandha', 'Samta Colony', 'Pandri', 'Tatibandh', 'Naya Raipur'] },
      { name: 'Bhilai', tier: 2, localities: ['Sector 1-10', 'Nehru Nagar', 'Smriti Nagar', 'Supela', 'Power House'] },
      { name: 'Bilaspur', tier: 2, localities: ['Civil Lines', 'Vyapar Vihar', 'Mangla', 'Torwa', 'Sarkanda'] },
      { name: 'Korba', tier: 2, localities: ['CSEB Colony', 'TP Nagar', 'Darri', 'Balco Township', 'Kusmunda'] },
      { name: 'Raigarh', tier: 3, localities: ['Jindal Industrial Park', 'Chakradhar Nagar', 'Station Road'] },
      { name: 'Rajnandgaon', tier: 3, localities: ['Ganj Para', 'Civil Lines', 'Dongargarh Road'] }
    ]
  },

  // --- WEST INDIA ---
  {
    name: 'Maharashtra',
    slug: 'maharashtra',
    region: 'West',
    cities: [
      { name: 'Mumbai', tier: 1, localities: ['Andheri', 'Bandra', 'Borivali', 'Powai', 'Goregaon', 'Dadar', 'Worli', 'Malad', 'Juhu'] },
      { name: 'Pune', tier: 1, localities: ['Hinjawadi', 'Wakad', 'Kothrud', 'Baner', 'Hadapsar', 'Viman Nagar', 'Kharadi', 'Aundh'] },
      { name: 'Nagpur', tier: 1, localities: ['Dharampeth', 'Manish Nagar', 'Ramdaspeth', 'Sitabuldi', 'Pratap Nagar', 'MIHAN'] },
      { name: 'Thane', tier: 1, localities: ['Ghodbunder Road', 'Majiwada', 'Vartak Nagar', 'Hiranandani Estate', 'Kolshet'] },
      { name: 'Navi Mumbai', tier: 1, localities: ['Vashi', 'Nerul', 'Kharghar', 'Panvel', 'Belapur', 'Seawoods', 'Airoli'] },
      { name: 'Nashik', tier: 2, localities: ['Indira Nagar', 'College Road', 'Gangapur Road', 'CIDCO', 'Panchavati'] },
      { name: 'Aurangabad (Chhatrapati Sambhajinagar)', tier: 2, localities: ['CIDCO', 'Samarth Nagar', 'Garkheda', 'Waluj', 'Shendra'] },
      { name: 'Solapur', tier: 2, localities: ['Jule Solapur', 'Saat Rasta', 'Old Pune Naka'] },
      { name: 'Kolhapur', tier: 2, localities: ['Rajarampuri', 'Tarabai Park', 'Nagala Park'] },
      { name: 'Amravati', tier: 3, localities: ['Rathinam Nagar', 'Camp Area', 'Gadge Nagar'] }
    ]
  },
  {
    name: 'Gujarat',
    slug: 'gujarat',
    region: 'West',
    cities: [
      { name: 'Ahmedabad', tier: 1, localities: ['Satellite', 'Bopal', 'SG Highway', 'Bodakdev', 'Prahlad Nagar', 'Vastrapur', 'Maninagar'] },
      { name: 'Surat', tier: 1, localities: ['Adajan', 'Vesu', 'Varachha', 'Pal', 'Piplod', 'Ghanshyam Nagar'] },
      { name: 'Vadodara', tier: 1, localities: ['Alkapuri', 'Gotri', 'Manjalpur', 'Sayajigunj', 'Karelibaug', 'Vasna Road'] },
      { name: 'Rajkot', tier: 2, localities: ['Kalawad Road', '150 Feet Ring Road', 'University Road', 'Yagnik Road'] },
      { name: 'Bhavnagar', tier: 2, localities: ['Kalanala', 'Waghawadi Road', 'Vidhyanagar'] },
      { name: 'Jamnagar', tier: 2, localities: ['Patel Colony', 'Digvijay Plot', 'Reliance Greens'] },
      { name: 'Gandhinagar', tier: 2, localities: ['Sector 7', 'Sector 21', 'Kudasan', 'Infocity', 'Sargasan'] },
      { name: 'Vapi', tier: 3, localities: ['GIDC Industrial Area', 'Chala', 'Gunjan'] },
      { name: 'Ankleshwar', tier: 3, localities: ['GIDC Ankleshwar', 'Station Road', 'Goya Bazar'] }
    ]
  },
  {
    name: 'Goa',
    slug: 'goa',
    region: 'West',
    cities: [
      { name: 'Panaji', tier: 2, localities: ['Miramar', 'Campal', 'Fontainhas', 'Dona Paula'] },
      { name: 'Margao', tier: 2, localities: ['Fatorda', 'Borda', 'Aquem', 'Pajifond'] },
      { name: 'Vasco da Gama', tier: 3, localities: ['Chicalim', 'Dabolim', 'Baina'] }
    ]
  },

  // --- SOUTH INDIA ---
  {
    name: 'Karnataka',
    slug: 'karnataka',
    region: 'South',
    cities: [
      { name: 'Bengaluru', tier: 1, localities: ['Whitefield', 'Electronic City', 'HSR Layout', 'Koramangala', 'Indiranagar', 'Marathahalli', 'Bellandur', 'Hebbal', 'JP Nagar'] },
      { name: 'Mysuru', tier: 2, localities: ['Jayalakshmipuram', 'Gokulam', 'Kuvempunagar', 'Vijayanagar', 'Hebbal Industrial'] },
      { name: 'Mangaluru', tier: 2, localities: ['Kadri', 'Kodialbail', 'Bejai', 'Kankanady', 'Surathkal'] },
      { name: 'Hubballi-Dharwad', tier: 2, localities: ['Vidyanagar', 'Gokul Road', 'Navanagar', 'Keshwapur'] },
      { name: 'Belagavi', tier: 2, localities: ['Tilakwadi', 'Camp Area', 'Udyambag Industrial', 'Hindwadi'] },
      { name: 'Hosur Border (Bangalore South)', tier: 3, localities: ['Sipcot Phase 1', 'Mookandapalli', 'Bagalur Road'] }
    ]
  },
  {
    name: 'Telangana',
    slug: 'telangana',
    region: 'South',
    cities: [
      { name: 'Hyderabad', tier: 1, localities: ['Gachibowli', 'Madhapur', 'Hitec City', 'Kondapur', 'Kukatpally', 'Banjara Hills', 'Jubilee Hills', 'Miyapur', 'Secunderabad'] },
      { name: 'Warangal', tier: 2, localities: ['Hanamkonda', 'Kazipet', 'Subedari', 'Nayeem Nagar'] },
      { name: 'Nizamabad', tier: 2, localities: ['Khaleelwadi', 'Armoor Road', 'Bodhan Road'] },
      { name: 'Karimnagar', tier: 2, localities: ['Mukarampura', 'Kothirampur', 'Collectorate Area'] }
    ]
  },
  {
    name: 'Andhra Pradesh',
    slug: 'andhra-pradesh',
    region: 'South',
    cities: [
      { name: 'Visakhapatnam', tier: 1, localities: ['MVP Colony', 'Gajuwaka', 'Madhurawada', 'Dwaraka Nagar', 'Seethammadhara', 'Steel Plant Township'] },
      { name: 'Vijayawada', tier: 1, localities: ['Moghalrajpuram', 'Benz Circle', 'Governorpet', 'Poranki', 'Patamata'] },
      { name: 'Guntur', tier: 2, localities: ['Brodipet', 'Arundelpet', 'Kothapet', 'Pattabhipuram'] },
      { name: 'Nellore', tier: 2, localities: ['Dargamitta', 'Balaji Nagar', 'Magunta Layout', 'Vedayapalem'] },
      { name: 'Tirupati', tier: 2, localities: ['Korlagunta', 'Bhavani Nagar', 'KT Road', 'Air Bypass Road'] },
      { name: 'Kurnool', tier: 2, localities: ['Nandyal Road', 'Gayatri Estate', 'Santosh Nagar'] },
      { name: 'Kakinada', tier: 2, localities: ['Suryaraopeta', 'Bhanugudi', 'Madhavapatnam'] },
      { name: 'Rajamahendravaram (Rajahmundry)', tier: 2, localities: ['Danavaipeta', 'Morampudi', 'Jawaharlal Nehru Road'] }
    ]
  },
  {
    name: 'Tamil Nadu',
    slug: 'tamil-nadu',
    region: 'South',
    cities: [
      { name: 'Chennai', tier: 1, localities: ['Anna Nagar', 'Velachery', 'OMR', 'Adyar', 'T. Nagar', 'Porur', 'Tambaram', 'Perungudi', 'Thiruvanmiyur'] },
      { name: 'Coimbatore', tier: 1, localities: ['RS Puram', 'Gandhipuram', 'Saibaba Colony', 'Peelamedu', 'Saravanampatti', 'Singanallur'] },
      { name: 'Madurai', tier: 2, localities: ['KK Nagar', 'Anna Nagar', 'SS Colony', 'TVS Nagar'] },
      { name: 'Tiruchirappalli (Trichy)', tier: 2, localities: ['Thillai Nagar', 'KK Nagar', 'Cantonment', 'Srirangam'] },
      { name: 'Salem', tier: 2, localities: ['Fairlands', 'Alagapuram', 'Hasthampatti', 'Suramangalam'] },
      { name: 'Tirunelveli', tier: 3, localities: ['Palayamkottai', 'Vannarpettai', 'Perumalpuram'] },
      { name: 'Hosur', tier: 3, localities: ['Sipcot Phase 2', 'Denkanikottai Road', 'Mathigiri'] }
    ]
  },
  {
    name: 'Kerala',
    slug: 'kerala',
    region: 'South',
    cities: [
      { name: 'Kochi (Cochin)', tier: 1, localities: ['Kakkanad (Infopark)', 'Edappally', 'Kaloor', 'Palarivattom', 'Panampilly Nagar', 'Aluva'] },
      { name: 'Thiruvananthapuram (Trivandrum)', tier: 1, localities: ['Kazhakoottam (Technopark)', 'Kowdiar', 'Pattom', 'Vellayambalam', 'Sasthamangalam'] },
      { name: 'Kozhikode (Calicut)', tier: 2, localities: ['Mavoor Road', 'Palayam', 'Nadakkavu', 'Eranhipalam'] },
      { name: 'Thrissur', tier: 2, localities: ['Round North', 'Ayyanthole', 'Ollur', 'Poothole'] }
    ]
  },

  // --- NORTHEAST INDIA ---
  {
    name: 'Assam',
    slug: 'assam',
    region: 'Northeast',
    cities: [
      { name: 'Guwahati', tier: 1, localities: ['GS Road', 'Dispur', 'Zoo Road', 'Beltola', 'Six Mile', 'Jalukbari', 'Ulubari'] },
      { name: 'Silchar', tier: 2, localities: ['Tarapur', 'Rangirkhari', 'Civil Hospital Area'] },
      { name: 'Dibrugarh', tier: 2, localities: ['Mancotta Road', 'Chowkidinghee', 'Graham Bazar'] },
      { name: 'Jorhat', tier: 3, localities: ['Gar-Ali', 'Tarajan', 'Na-Ali'] }
    ]
  },
  {
    name: 'Tripura',
    slug: 'tripura',
    region: 'Northeast',
    cities: [
      { name: 'Agartala', tier: 2, localities: ['Banamalipur', 'Dhaleswar', 'Kunjaban', 'Radhanagar'] }
    ]
  },
  {
    name: 'Meghalaya',
    slug: 'meghalaya',
    region: 'Northeast',
    cities: [
      { name: 'Shillong', tier: 2, localities: ['Police Bazar', 'Laitumkhrah', 'Labal', 'Nongthymmai'] }
    ]
  },
  {
    name: 'Manipur',
    slug: 'manipur',
    region: 'Northeast',
    cities: [
      { name: 'Imphal', tier: 2, localities: ['Thangal Bazar', 'Paona Bazar', 'Lamphelpat'] }
    ]
  },
  {
    name: 'Nagaland',
    slug: 'nagaland',
    region: 'Northeast',
    cities: [
      { name: 'Dimapur', tier: 2, localities: ['Circular Road', 'Purana Bazar', 'Duncan Bosti'] },
      { name: 'Kohima', tier: 3, localities: ['PR Hill', 'High School Junction', 'Midland'] }
    ]
  },
  {
    name: 'Arunachal Pradesh',
    slug: 'arunachal-pradesh',
    region: 'Northeast',
    cities: [
      { name: 'Itanagar', tier: 2, localities: ['Ganga Market', 'E-Sector', 'Zero Point'] },
      { name: 'Naharlagun', tier: 3, localities: ['Barapani', 'Model Village'] }
    ]
  },
  {
    name: 'Mizoram',
    slug: 'mizoram',
    region: 'Northeast',
    cities: [
      { name: 'Aizawl', tier: 2, localities: ['Chanmari', 'Zarkawt', 'Khatla', 'Bawngkawn'] }
    ]
  },
  {
    name: 'Sikkim',
    slug: 'sikkim',
    region: 'Northeast',
    cities: [
      { name: 'Gangtok', tier: 2, localities: ['MG Marg', 'Deorali', 'Tadong', 'Ranipool'] }
    ]
  },

  // --- UNION TERRITORIES ---
  {
    name: 'Puducherry',
    slug: 'puducherry',
    region: 'South',
    cities: [
      { name: 'Pondicherry', tier: 2, localities: ['White Town', 'Lawspet', 'Muthialpet', 'Auroville Area'] }
    ]
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    slug: 'dadra-and-nagar-haveli-and-daman-and-diu',
    region: 'West',
    cities: [
      { name: 'Silvassa', tier: 3, localities: ['Piparia Industrial', 'Tokarkhada', 'Kilwani'] },
      { name: 'Daman', tier: 3, localities: ['Nani Daman', 'Moti Daman', 'Somnath'] }
    ]
  },
  {
    name: 'Andaman and Nicobar Islands',
    slug: 'andaman-and-nicobar-islands',
    region: 'South',
    cities: [
      { name: 'Port Blair', tier: 3, localities: ['Aberdeen Bazaar', 'Haddo', 'Garacharma', 'Dollygunj'] }
    ]
  },
  {
    name: 'Lakshadweep',
    slug: 'lakshadweep',
    region: 'South',
    cities: [
      { name: 'Kavaratti', tier: 3, localities: ['Main Island Hub'] }
    ]
  }
];

// Directory Policy: ONLY National Packers & Movers is seeded at rank #1.
// Other movers enter the database exclusively via (a) Admin Google Maps Crawler, or (b) Admin manual entry.

async function seedPanIndia() {
  console.log('🇮🇳 Starting Comprehensive PAN-India Database Seeding...');

  try {
    let totalStates = 0;
    let totalCities = 0;
    let totalMovers = 0;
    let totalRoutes = 0;

    for (const stateData of panIndiaData) {
      // 1. Insert / Get State
      let stateRes = await query('SELECT id FROM states WHERE slug = $1', [stateData.slug]);
      let stateId;

      if (stateRes.rows.length === 0) {
        stateId = generateId();
        await query(
          'INSERT INTO states (id, name, slug, region) VALUES ($1, $2, $3, $4)',
          [stateId, stateData.name, stateData.slug, stateData.region]
        );
        totalStates++;
      } else {
        stateId = stateRes.rows[0].id;
      }

      for (const cityData of stateData.cities) {
        const citySlug = slugify(cityData.name);

        // 2. Insert / Get City
        let cityRes = await query('SELECT id FROM cities WHERE slug = $1', [citySlug]);
        let cityId;

        if (cityRes.rows.length === 0) {
          cityId = generateId();
          await query(
            `INSERT INTO cities (id, state_id, name, slug, tier, popular_localities, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [cityId, stateId, cityData.name, citySlug, cityData.tier, JSON.stringify(cityData.localities)]
          );
          totalCities++;
        } else {
          cityId = cityRes.rows[0].id;
        }

        // 3. SEED NATIONAL PACKERS & MOVERS AS #1 PLATINUM VERIFIED IN EVERY CITY
        const npmSlug = `national-packers-and-movers-${citySlug}`;
        const existingNpm = await query('SELECT id FROM movers WHERE slug = $1', [npmSlug]);

        if (existingNpm.rows.length === 0) {
          const npmPricing = {
            '1bhk': '₹3,500 - ₹6,500',
            '2bhk': '₹5,500 - ₹9,500',
            '3bhk': '₹8,500 - ₹14,500',
            '4bhk_villa': '₹12,500 - ₹22,000',
            'vehicle': '₹4,500 - ₹9,000',
            'office': 'Custom Inspection Quote'
          };

          const npmBadges = ['#1 Top Rated', 'Platinum Verified', 'IBA Approved', 'ISO Certified'];
          const npmServices = ['Household Relocation', 'Car & Bike Transport', 'Corporate Office Shifting', 'Warehouse Storage', 'Transit Insurance'];

          const npmMoverId = generateId();
          await query(
            `INSERT INTO movers (
              id, city_id, name, slug, phone, email, website_url, address,
              rating, review_count, rank_order, is_verified, is_featured,
              badges, services_offered, about_text, fleet_size, established_year,
              pricing_table, source
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              4.9, 1540, 1, true, true,
              $9, $10, $11, $12, $13,
              $14, 'manual'
            )`,
            [
              npmMoverId,
              cityId,
              `National Packers & Movers (${cityData.name})`,
              npmSlug,
              '+91 98351 68368',
              'dispatch@thenationalpackersmovers.com',
              'https://www.thenationalpackersmovers.com/',
              `Central Hub & Logistics Terminal, Near Highway Junction, ${cityData.name}, ${stateData.name}`,
              JSON.stringify(npmBadges),
              JSON.stringify(npmServices),
              `National Packers & Movers is India's leading IBA-approved relocation conglomerate with over 35+ years of excellence. Operating dedicated company-owned containerized fleets across ${stateData.name} and PAN-India with GPS tracking, multi-layer waterproof bubble packaging, and zero-damage guarantee.`,
              '45+ Container Trucks',
              '1987',
              JSON.stringify(npmPricing)
            ]
          );
          totalMovers++;
        }


        // 5. GENERATE THE 5 JUSTDIAL-STYLE MULTI-INTENT PROGRAMMATIC SERP ROUTES
        const intentTemplates = [
          {
            type: 'general',
            pattern: `packers-and-movers-${citySlug}`,
            title: `Packers and Movers in ${cityData.name} | Verified Moving Directory`,
            desc: `Find verified packers and movers in ${cityData.name}, ${stateData.name}. Compare authentic reviews, starting rate cards, and book IBA approved movers with free quotes.`,
            h1: `Best Packers and Movers in ${cityData.name}`,
            intro: `Looking for reliable, verified packers and movers in ${cityData.name}? BestPackerMovers.com aggregates verified relocation companies, transparent pricing tables, and real customer reviews across ${cityData.localities.join(', ')}.`
          },
          {
            type: 'best',
            pattern: `best-packers-and-movers-${citySlug}`,
            title: `Best Packers and Movers in ${cityData.name} (Top Rated & Verified)`,
            desc: `Discover the top 10 best packers and movers in ${cityData.name}. Compare ratings, customer feedback, and instant price estimates for household & vehicle shifting.`,
            h1: `Best Packers and Movers in ${cityData.name} (Top Rated)`,
            intro: `Find the highest-rated relocation services in ${cityData.name}. All listed movers are background-checked, insured, and verified for safe household shifting.`
          },
          {
            type: 'top_10',
            pattern: `top-10-packers-and-movers-${citySlug}`,
            title: `Top 10 Packers and Movers in ${cityData.name} | 2026 Directory`,
            desc: `Rankings of the top 10 packers and movers in ${cityData.name}. Check verified reviews, service track record, and contact details for safe home shifting.`,
            h1: `Top 10 Packers and Movers in ${cityData.name}`,
            intro: `Here is the comprehensive ranking of the top 10 moving companies in ${cityData.name}, evaluated on fleet reliability, customer feedback, and pricing transparency.`
          },
          {
            type: 'cheap',
            pattern: `cheap-packers-and-movers-${citySlug}`,
            title: `Cheap Packers and Movers in ${cityData.name} | Affordable Shifting Rates`,
            desc: `Affordable, low cost packers and movers in ${cityData.name}. Compare transparent moving charges starting at ₹3,500 with zero hidden fees.`,
            h1: `Cheap & Affordable Packers and Movers in ${cityData.name}`,
            intro: `Get genuine budget-friendly household and bike relocation services in ${cityData.name} without sacrificing quality. Compare starting rates and save up to 25% on shifting.`
          },
          {
            type: 'iba_approved',
            pattern: `iba-approved-packers-and-movers-${citySlug}`,
            title: `IBA Approved Packers and Movers in ${cityData.name} | Bank Transfer Certified`,
            desc: `Hire certified IBA approved packers and movers in ${cityData.name}. 100% accepted for bank, PSU, and government employee transfer bill reimbursement.`,
            h1: `IBA Approved Packers and Movers in ${cityData.name}`,
            intro: `Verified list of IBA approved logistics companies in ${cityData.name} providing official bills, GST invoices, and transit insurance for corporate and bank transfer relocations.`
          }
        ];

        for (const intent of intentTemplates) {
          const existingRoute = await query('SELECT id FROM intent_routes WHERE slug_pattern = $1', [intent.pattern]);
          if (existingRoute.rows.length === 0) {
            const routeId = generateId();
            await query(
              `INSERT INTO intent_routes (
                id, city_id, intent_type, slug_pattern, meta_title, meta_description, h1_heading, intro_text
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [routeId, cityId, intent.type, intent.pattern, intent.title, intent.desc, intent.h1, intent.intro]
            );
            totalRoutes++;
          }
        }
      }
    }

    console.log(`\n🎉 PAN-India Seeding Complete!`);
    console.log(`📊 Summary of Directory Assets:`);
    console.log(`   - States & UTs Seeded: ${totalStates}`);
    console.log(`   - Cities & Urban Hubs: ${totalCities}`);
    console.log(`   - Verified Movers Seeded: ${totalMovers} (National Packers #1 in all)`);
    console.log(`   - Programmatic Intent Routes: ${totalRoutes}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
}

seedPanIndia();
