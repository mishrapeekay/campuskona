/**
 * India States → Districts → Cities with Pincodes
 * Covers all 28 states and 8 Union Territories
 * Cities list is representative (major cities per district)
 */

export const INDIA_GEO = {
  "Andhra Pradesh": {
    "Visakhapatnam": { cities: { "Visakhapatnam": "530001", "Bheemunipatnam": "531163", "Anakapalle": "531001" } },
    "East Godavari": { cities: { "Kakinada": "533001", "Rajahmundry": "533101", "Samalkot": "533440" } },
    "West Godavari": { cities: { "Eluru": "534001", "Bhimavaram": "534201", "Tanuku": "534211" } },
    "Krishna": { cities: { "Vijayawada": "520001", "Machilipatnam": "521001", "Gudivada": "521301" } },
    "Guntur": { cities: { "Guntur": "522001", "Tenali": "522201", "Narasaraopet": "522601" } },
    "Nellore": { cities: { "Nellore": "524001", "Gudur": "524101", "Kavali": "524201" } },
    "Kurnool": { cities: { "Kurnool": "518001", "Adoni": "518301", "Nandyal": "518501" } },
    "Kadapa": { cities: { "Kadapa": "516001", "Proddatur": "516360", "Rajampet": "516115" } },
    "Anantapur": { cities: { "Anantapur": "515001", "Guntakal": "515801", "Hindupur": "515201" } },
    "Chittoor": { cities: { "Tirupati": "517501", "Chittoor": "517001", "Madanapalle": "517325" } },
  },
  "Arunachal Pradesh": {
    "East Kameng": { cities: { "Seppa": "790102" } },
    "Papum Pare": { cities: { "Itanagar": "791111", "Naharlagun": "791110" } },
    "West Siang": { cities: { "Along": "791001" } },
    "Tawang": { cities: { "Tawang": "790104" } },
  },
  "Assam": {
    "Kamrup Metropolitan": { cities: { "Guwahati": "781001", "Dispur": "781006" } },
    "Dibrugarh": { cities: { "Dibrugarh": "786001", "Naharkatia": "786610" } },
    "Jorhat": { cities: { "Jorhat": "785001", "Mariani": "785634" } },
    "Silchar": { cities: { "Silchar": "788001", "Sonai": "788802" } },
    "Nagaon": { cities: { "Nagaon": "782001", "Hojai": "782435" } },
  },
  "Bihar": {
    "Patna": { cities: { "Patna": "800001", "Danapur": "801503", "Phulwarisharif": "801505" } },
    "Gaya": { cities: { "Gaya": "823001", "Bodhgaya": "824231", "Sherghati": "824211" } },
    "Muzaffarpur": { cities: { "Muzaffarpur": "842001", "Sitamarhi": "843301" } },
    "Bhagalpur": { cities: { "Bhagalpur": "812001", "Banka": "813102" } },
    "Darbhanga": { cities: { "Darbhanga": "846001", "Madhubani": "847211" } },
    "Purnia": { cities: { "Purnia": "854301", "Katihar": "854105" } },
    "Nalanda": { cities: { "Bihar Sharif": "803101", "Rajgir": "803116" } },
  },
  "Chhattisgarh": {
    "Raipur": { cities: { "Raipur": "492001", "Arang": "493441" } },
    "Durg": { cities: { "Durg": "491001", "Bhilai": "490001", "Bhilainagar": "490006" } },
    "Bilaspur": { cities: { "Bilaspur": "495001", "Ratanpur": "495442" } },
    "Korba": { cities: { "Korba": "495677", "Katghora": "495453" } },
    "Rajnandgaon": { cities: { "Rajnandgaon": "491441", "Dongargarh": "491445" } },
  },
  "Goa": {
    "North Goa": { cities: { "Panaji": "403001", "Mapusa": "403507", "Calangute": "403516" } },
    "South Goa": { cities: { "Margao": "403601", "Vasco da Gama": "403802", "Ponda": "403401" } },
  },
  "Gujarat": {
    "Ahmedabad": { cities: { "Ahmedabad": "380001", "Gandhinagar": "382010", "Naroda": "382325" } },
    "Surat": { cities: { "Surat": "395001", "Udhna": "394210", "Bardoli": "394601" } },
    "Vadodara": { cities: { "Vadodara": "390001", "Anand": "388001", "Karjan": "391210" } },
    "Rajkot": { cities: { "Rajkot": "360001", "Gondal": "360311", "Jetpur": "360370" } },
    "Bhavnagar": { cities: { "Bhavnagar": "364001", "Sihor": "364240", "Palitana": "364270" } },
    "Jamnagar": { cities: { "Jamnagar": "361001", "Dwarka": "361335", "Khambhalia": "361305" } },
    "Junagadh": { cities: { "Junagadh": "362001", "Veraval": "362266", "Porbandar": "360575" } },
    "Kutch": { cities: { "Bhuj": "370001", "Gandhidham": "370201", "Anjar": "370110" } },
    "Mehsana": { cities: { "Mehsana": "384001", "Unjha": "384170", "Visnagar": "384315" } },
  },
  "Haryana": {
    "Gurugram": { cities: { "Gurugram": "122001", "Manesar": "122050", "Sohna": "122103" } },
    "Faridabad": { cities: { "Faridabad": "121001", "Ballabhgarh": "121004", "Palwal": "121102" } },
    "Hisar": { cities: { "Hisar": "125001", "Hansi": "125033", "Fatehabad": "125050" } },
    "Rohtak": { cities: { "Rohtak": "124001", "Bahadurgarh": "124507", "Sampla": "124501" } },
    "Ambala": { cities: { "Ambala": "133001", "Ambala Cantonment": "133001", "Naraingarh": "134203" } },
    "Karnal": { cities: { "Karnal": "132001", "Panipat": "132103", "Assandh": "132039" } },
    "Sonipat": { cities: { "Sonipat": "131001", "Gohana": "131301", "Kharkhoda": "131402" } },
    "Yamunanagar": { cities: { "Yamunanagar": "135001", "Jagadhri": "135003", "Bilaspur": "133204" } },
  },
  "Himachal Pradesh": {
    "Shimla": { cities: { "Shimla": "171001", "Solan": "173212", "Kasauli": "173204" } },
    "Kangra": { cities: { "Dharamsala": "176215", "Palampur": "176061", "Nurpur": "176202" } },
    "Mandi": { cities: { "Mandi": "175001", "Sundernagar": "175018", "Jogindernagar": "175015" } },
    "Kullu": { cities: { "Kullu": "175101", "Manali": "175131", "Bhuntar": "175125" } },
  },
  "Jharkhand": {
    "Ranchi": { cities: { "Ranchi": "834001", "Kanke": "834006", "Namkum": "834010" } },
    "East Singhbhum": { cities: { "Jamshedpur": "831001", "Dhalbhum": "832101" } },
    "Dhanbad": { cities: { "Dhanbad": "826001", "Jharia": "828111", "Sindri": "828122" } },
    "Hazaribagh": { cities: { "Hazaribagh": "825301", "Ramgarh": "829122" } },
    "Bokaro": { cities: { "Bokaro": "827001", "Chas": "827013" } },
  },
  "Karnataka": {
    "Bengaluru Urban": { cities: { "Bengaluru": "560001", "Whitefield": "560066", "Electronic City": "560100", "Yelahanka": "560064" } },
    "Bengaluru Rural": { cities: { "Devanahalli": "562110", "Doddaballapur": "561203" } },
    "Mysuru": { cities: { "Mysuru": "570001", "Hunsur": "571105", "Nanjangud": "571301" } },
    "Dharwad": { cities: { "Hubli": "580020", "Dharwad": "580001" } },
    "Belagavi": { cities: { "Belagavi": "590001", "Gokak": "591307", "Khanapur": "591302" } },
    "Mangaluru": { cities: { "Mangaluru": "575001", "Puttur": "574201", "Bantwal": "574219" } },
    "Ballari": { cities: { "Ballari": "583101", "Hospet": "583201", "Sandur": "583119" } },
    "Kalaburagi": { cities: { "Kalaburagi": "585101", "Bidar": "585401", "Yadgir": "585202" } },
    "Shivamogga": { cities: { "Shivamogga": "577201", "Bhadravati": "577301", "Sagar": "577401" } },
  },
  "Kerala": {
    "Thiruvananthapuram": { cities: { "Thiruvananthapuram": "695001", "Neyyattinkara": "695121", "Attingal": "695101" } },
    "Ernakulam": { cities: { "Kochi": "682001", "Aluva": "683101", "Thrippunithura": "682301" } },
    "Kozhikode": { cities: { "Kozhikode": "673001", "Vatakara": "673104", "Koyilandy": "673305" } },
    "Thrissur": { cities: { "Thrissur": "680001", "Chalakudy": "680307", "Irinjalakuda": "680121" } },
    "Malappuram": { cities: { "Malappuram": "676505", "Tirur": "676101", "Manjeri": "676121" } },
    "Kollam": { cities: { "Kollam": "691001", "Karunagappally": "690518", "Punalur": "691305" } },
    "Palakkad": { cities: { "Palakkad": "678001", "Ottappalam": "679101", "Shoranur": "679121" } },
  },
  "Madhya Pradesh": {
    "Bhopal": { cities: { "Bhopal": "462001", "Hoshangabad": "461001", "Vidisha": "464001" } },
    "Indore": { cities: { "Indore": "452001", "Mhow": "453441", "Pithampur": "454775" } },
    "Gwalior": { cities: { "Gwalior": "474001", "Lashkar": "474001", "Morar": "474006", "Dabra": "475110", "Bhitarwar": "475686" } },
    "Jabalpur": { cities: { "Jabalpur": "482001", "Katni": "483501", "Narsinghpur": "487001" } },
    "Ujjain": { cities: { "Ujjain": "456001", "Nagda": "456335", "Khachrod": "456221" } },
    "Sagar": { cities: { "Sagar": "470001", "Bina Etawa": "470113", "Khurai": "470117" } },
    "Rewa": { cities: { "Rewa": "486001", "Satna": "485001", "Sidhi": "486661" } },
    "Morena": { cities: { "Morena": "476001", "Ambah": "476111", "Porsa": "476115" } },
    "Shivpuri": { cities: { "Shivpuri": "473551", "Guna": "473001", "Ashok Nagar": "473331" } },
    "Dewas": { cities: { "Dewas": "455001", "Sonkatch": "455118", "Kannod": "455332" } },
    "Khandwa": { cities: { "Khandwa": "450001", "Harda": "461331", "Burhanpur": "450331" } },
    "Chhindwara": { cities: { "Chhindwara": "480001", "Seoni": "480661", "Betul": "460001" } },
    "Ratlam": { cities: { "Ratlam": "457001", "Mandsaur": "458001", "Neemuch": "458441" } },
    "Datia": { cities: { "Datia": "475661", "Seondha": "475690" } },
    "Bhind": { cities: { "Bhind": "477001", "Lahar": "477445", "Gohad": "477116" } },
  },
  "Maharashtra": {
    "Mumbai City": { cities: { "Mumbai": "400001", "Fort": "400001", "Churchgate": "400020", "Dadar": "400014" } },
    "Mumbai Suburban": { cities: { "Andheri": "400069", "Bandra": "400050", "Borivali": "400066", "Malad": "400064" } },
    "Thane": { cities: { "Thane": "400601", "Navi Mumbai": "400703", "Kalyan": "421301", "Ulhasnagar": "421001" } },
    "Pune": { cities: { "Pune": "411001", "Pimpri": "411017", "Chinchwad": "411019", "Hadapsar": "411028" } },
    "Nashik": { cities: { "Nashik": "422001", "Malegaon": "423203", "Sinnar": "422103" } },
    "Nagpur": { cities: { "Nagpur": "440001", "Kamptee": "441001", "Wardha": "442001" } },
    "Aurangabad": { cities: { "Aurangabad": "431001", "Jalna": "431203", "Parbhani": "431401" } },
    "Solapur": { cities: { "Solapur": "413001", "Pandharpur": "413304", "Barshi": "413401" } },
    "Kolhapur": { cities: { "Kolhapur": "416001", "Sangli": "416416", "Miraj": "416410" } },
    "Amravati": { cities: { "Amravati": "444601", "Akola": "444001", "Yavatmal": "445001" } },
  },
  "Manipur": {
    "Imphal West": { cities: { "Imphal": "795001", "Lamphel": "795004" } },
    "Imphal East": { cities: { "Porompat": "795005", "Khurai": "795010" } },
    "Thoubal": { cities: { "Thoubal": "795138", "Wangjing": "795148" } },
  },
  "Meghalaya": {
    "East Khasi Hills": { cities: { "Shillong": "793001", "Cherrapunji": "793108" } },
    "Ri Bhoi": { cities: { "Nongpoh": "793100" } },
    "West Garo Hills": { cities: { "Tura": "794001" } },
  },
  "Mizoram": {
    "Aizawl": { cities: { "Aizawl": "796001" } },
    "Lunglei": { cities: { "Lunglei": "796701" } },
  },
  "Nagaland": {
    "Kohima": { cities: { "Kohima": "797001", "Dimapur": "797112" } },
    "Dimapur": { cities: { "Dimapur": "797112" } },
    "Mokokchung": { cities: { "Mokokchung": "798601" } },
  },
  "Odisha": {
    "Khordha": { cities: { "Bhubaneswar": "751001", "Khordha": "752055" } },
    "Cuttack": { cities: { "Cuttack": "753001", "Choudwar": "754025" } },
    "Rourkela": { cities: { "Rourkela": "769001", "Sundargarh": "770001" } },
    "Berhampur": { cities: { "Berhampur": "760001", "Ganjam": "761020" } },
    "Sambalpur": { cities: { "Sambalpur": "768001", "Jharsuguda": "768201" } },
    "Puri": { cities: { "Puri": "752001", "Konark": "752111" } },
    "Balasore": { cities: { "Balasore": "756001", "Bhadrak": "756100" } },
  },
  "Punjab": {
    "Ludhiana": { cities: { "Ludhiana": "141001", "Khanna": "141401", "Samrala": "141114" } },
    "Amritsar": { cities: { "Amritsar": "143001", "Attari": "143105", "Ajnala": "143107" } },
    "Jalandhar": { cities: { "Jalandhar": "144001", "Phagwara": "144401", "Nakodar": "144040" } },
    "Patiala": { cities: { "Patiala": "147001", "Rajpura": "140401", "Nabha": "147201" } },
    "Mohali": { cities: { "Mohali": "160055", "Kharar": "140301", "Dera Bassi": "140507" } },
    "Bathinda": { cities: { "Bathinda": "151001", "Mansa": "151505", "Rampura Phul": "151103" } },
    "Hoshiarpur": { cities: { "Hoshiarpur": "146001", "Mukerian": "144211", "Dasuya": "144205" } },
  },
  "Rajasthan": {
    "Jaipur": { cities: { "Jaipur": "302001", "Sanganer": "302029", "Amber": "302028" } },
    "Jodhpur": { cities: { "Jodhpur": "342001", "Phalodi": "342301", "Bilara": "342602" } },
    "Kota": { cities: { "Kota": "324001", "Baran": "325205", "Bundi": "323001" } },
    "Ajmer": { cities: { "Ajmer": "305001", "Kishangarh": "305801", "Beawar": "305901" } },
    "Bikaner": { cities: { "Bikaner": "334001", "Nokha": "334803", "Kolayat": "334303" } },
    "Udaipur": { cities: { "Udaipur": "313001", "Nathdwara": "313301", "Rajsamand": "313326" } },
    "Alwar": { cities: { "Alwar": "301001", "Bhiwadi": "301019", "Behror": "301701" } },
    "Bharatpur": { cities: { "Bharatpur": "321001", "Deeg": "321203", "Nagar": "321205" } },
    "Sikar": { cities: { "Sikar": "332001", "Fatehpur Shekhawati": "332301", "Nawalgarh": "333042" } },
    "Churu": { cities: { "Churu": "331001", "Sujangarh": "331507", "Ratangarh": "331022" } },
  },
  "Sikkim": {
    "East Sikkim": { cities: { "Gangtok": "737101", "Rangpo": "737132" } },
    "West Sikkim": { cities: { "Gyalshing": "737111" } },
  },
  "Tamil Nadu": {
    "Chennai": { cities: { "Chennai": "600001", "Tambaram": "600045", "Avadi": "600054", "Ambattur": "600053" } },
    "Coimbatore": { cities: { "Coimbatore": "641001", "Tiruppur": "641601", "Pollachi": "642001" } },
    "Madurai": { cities: { "Madurai": "625001", "Dindigul": "624001", "Ramanathapuram": "623501" } },
    "Tiruchirappalli": { cities: { "Tiruchirappalli": "620001", "Karur": "639001", "Thanjavur": "613001" } },
    "Salem": { cities: { "Salem": "636001", "Namakkal": "637001", "Dharmapuri": "636701" } },
    "Tirunelveli": { cities: { "Tirunelveli": "627001", "Nagercoil": "629001", "Tenkasi": "627811" } },
    "Vellore": { cities: { "Vellore": "632001", "Katpadi": "632007", "Ranipet": "632401" } },
    "Erode": { cities: { "Erode": "638001", "Bhavani": "638301", "Sathyamangalam": "638401" } },
  },
  "Telangana": {
    "Hyderabad": { cities: { "Hyderabad": "500001", "Secunderabad": "500003", "Cyberabad": "500081" } },
    "Rangareddy": { cities: { "Hyderabad (RR)": "500030", "LB Nagar": "500074", "Kukatpally": "500072" } },
    "Medchal": { cities: { "Medchal": "501401", "Kompally": "500100", "Keesara": "501301" } },
    "Warangal Urban": { cities: { "Warangal": "506001", "Hanamkonda": "506001" } },
    "Karimnagar": { cities: { "Karimnagar": "505001", "Jagtial": "505327", "Metpally": "505325" } },
    "Nizamabad": { cities: { "Nizamabad": "503001", "Kamareddy": "503111", "Bodhan": "503185" } },
    "Khammam": { cities: { "Khammam": "507001", "Kothagudem": "507101" } },
    "Nalgonda": { cities: { "Nalgonda": "508001", "Miryalaguda": "508207", "Suryapet": "508213" } },
  },
  "Tripura": {
    "West Tripura": { cities: { "Agartala": "799001", "Bishramganj": "799102" } },
    "South Tripura": { cities: { "Belonia": "799155", "Udaipur": "799120" } },
  },
  "Uttar Pradesh": {
    "Lucknow": { cities: { "Lucknow": "226001", "Maligaon": "226017", "Alambagh": "226005" } },
    "Agra": { cities: { "Agra": "282001", "Firozabad": "283203", "Mathura": "281001" } },
    "Kanpur Nagar": { cities: { "Kanpur": "208001", "Unnao": "209801", "Fatehpur": "212601" } },
    "Varanasi": { cities: { "Varanasi": "221001", "Mirzapur": "231001", "Chandauli": "232104" } },
    "Prayagraj": { cities: { "Prayagraj": "211001", "Naini": "211008", "Meja": "212301" } },
    "Meerut": { cities: { "Meerut": "250001", "Hapur": "245101", "Ghaziabad": "201001" } },
    "Bareilly": { cities: { "Bareilly": "243001", "Pilibhit": "262001", "Shahjahanpur": "242001" } },
    "Gorakhpur": { cities: { "Gorakhpur": "273001", "Deoria": "274001", "Kushinagar": "274403" } },
    "Gautam Buddha Nagar": { cities: { "Noida": "201301", "Greater Noida": "201310" } },
    "Muzaffarnagar": { cities: { "Muzaffarnagar": "251001", "Shamli": "247776", "Budhana": "251309" } },
    "Aligarh": { cities: { "Aligarh": "202001", "Hathras": "204101", "Kasganj": "207123" } },
    "Moradabad": { cities: { "Moradabad": "244001", "Rampur": "244901", "Amroha": "244221" } },
  },
  "Uttarakhand": {
    "Dehradun": { cities: { "Dehradun": "248001", "Rishikesh": "249201", "Mussoorie": "248179" } },
    "Haridwar": { cities: { "Haridwar": "249401", "Roorkee": "247667", "Manglaur": "247661" } },
    "Nainital": { cities: { "Nainital": "263001", "Haldwani": "263139", "Ramnagar": "244715" } },
    "Udham Singh Nagar": { cities: { "Rudrapur": "263153", "Kashipur": "244713", "Kichha": "263148" } },
    "Almora": { cities: { "Almora": "263601", "Ranikhet": "263645" } },
  },
  "West Bengal": {
    "Kolkata": { cities: { "Kolkata": "700001", "Howrah": "711101", "Salt Lake": "700064", "Dum Dum": "700028" } },
    "North 24 Parganas": { cities: { "Barasat": "700124", "Basirhat": "743412", "Bangaon": "743235" } },
    "South 24 Parganas": { cities: { "Baruipur": "700144", "Diamond Harbour": "743331", "Kakdwip": "743347" } },
    "Paschim Medinipur": { cities: { "Kharagpur": "721301", "Midnapore": "721101", "Jhargram": "721507" } },
    "Purba Medinipur": { cities: { "Haldia": "721607", "Tamluk": "721636", "Contai": "721401" } },
    "Hooghly": { cities: { "Hooghly": "712103", "Chandannagar": "712136", "Srirampur": "712203" } },
    "Burdwan": { cities: { "Asansol": "713301", "Durgapur": "713201", "Burdwan": "713101" } },
    "Murshidabad": { cities: { "Berhampore": "742101", "Jangipur": "742213" } },
    "Nadia": { cities: { "Krishnanagar": "741101", "Kalyani": "741235", "Ranaghat": "741201" } },
  },
  // Union Territories
  "Andaman and Nicobar Islands": {
    "South Andaman": { cities: { "Port Blair": "744101" } },
    "North and Middle Andaman": { cities: { "Diglipur": "744202" } },
  },
  "Chandigarh": {
    "Chandigarh": { cities: { "Chandigarh": "160001", "Sector 17": "160017", "Panchkula": "134109" } },
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    "Dadra and Nagar Haveli": { cities: { "Silvassa": "396230" } },
    "Daman": { cities: { "Daman": "396210" } },
    "Diu": { cities: { "Diu": "362520" } },
  },
  "Delhi": {
    "Central Delhi": { cities: { "Connaught Place": "110001", "Karol Bagh": "110005" } },
    "North Delhi": { cities: { "Civil Lines": "110054", "Rohini": "110085" } },
    "South Delhi": { cities: { "Lajpat Nagar": "110024", "Saket": "110017", "Mehrauli": "110030" } },
    "East Delhi": { cities: { "Preet Vihar": "110092", "Vivek Vihar": "110095" } },
    "West Delhi": { cities: { "Janakpuri": "110058", "Dwarka": "110075", "Patel Nagar": "110008" } },
    "New Delhi": { cities: { "New Delhi": "110002", "India Gate": "110011" } },
    "North East Delhi": { cities: { "Shahdara": "110032", "Seelampur": "110053" } },
    "South West Delhi": { cities: { "Vasant Kunj": "110070", "Palam": "110045", "Najafgarh": "110043" } },
  },
  "Jammu and Kashmir": {
    "Srinagar": { cities: { "Srinagar": "190001", "Ganderbal": "191201" } },
    "Jammu": { cities: { "Jammu": "180001", "Udhampur": "182101", "Kathua": "184101" } },
    "Baramulla": { cities: { "Baramulla": "193101", "Sopore": "193201" } },
    "Anantnag": { cities: { "Anantnag": "192101", "Bijbehara": "192124" } },
    "Kupwara": { cities: { "Kupwara": "193222", "Handwara": "193221" } },
  },
  "Ladakh": {
    "Leh": { cities: { "Leh": "194101", "Kargil": "194103" } },
    "Kargil": { cities: { "Kargil": "194103" } },
  },
  "Lakshadweep": {
    "Lakshadweep": { cities: { "Kavaratti": "682555" } },
  },
  "Puducherry": {
    "Puducherry": { cities: { "Puducherry": "605001", "Oulgaret": "605009" } },
    "Karaikal": { cities: { "Karaikal": "609602" } },
    "Mahe": { cities: { "Mahe": "673310" } },
    "Yanam": { cities: { "Yanam": "533464" } },
  },
};

export const STATE_LIST = Object.keys(INDIA_GEO).sort();

export const getDistricts = (state) => {
  if (!state || !INDIA_GEO[state]) return [];
  return Object.keys(INDIA_GEO[state]).sort();
};

export const getCities = (state, district) => {
  if (!state || !district || !INDIA_GEO[state]?.[district]) return [];
  return Object.keys(INDIA_GEO[state][district].cities).sort();
};

export const getPincode = (state, district, city) => {
  return INDIA_GEO[state]?.[district]?.cities?.[city] || '';
};
