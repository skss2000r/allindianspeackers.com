/**
 * UI translations. English is the source of truth and the fallback for any key a
 * language does not define. Legal text (terms) and the speaker forms are English
 * only for now; the strings below cover the hero, selection/payment, listing and
 * footer. Have a native speaker review before large campaigns.
 */
export const LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'hi', label: 'हिन्दी' },
	{ code: 'ta', label: 'தமிழ்' },
	{ code: 'te', label: 'తెలుగు' },
	{ code: 'bn', label: 'বাংলা' },
	{ code: 'mr', label: 'मराठी' },
	{ code: 'gu', label: 'ગુજરાતી' },
	{ code: 'kn', label: 'ಕನ್ನಡ' },
	{ code: 'ml', label: 'മലയാളം' },
	{ code: 'pa', label: 'ਪੰਜਾਬੀ' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];
export const LANG_COOKIE = 'ais_lang';

export const isLangCode = (value: unknown): value is LangCode => LANGUAGES.some(lang => lang.code === value);

const en = {
	nav_discover: 'Discover sessions',
	nav_speakers: 'Speakers',
	nav_join: 'Add your profile',
	nav_cart: 'Your selection',
	lang_label: 'Language',
	hero_eyebrow: 'INDIA’S VOICES. YOUR NEXT BIG MOMENT.',
	hero_l1: 'FIND YOUR',
	hero_l2: 'FAVOURITE VOICE.',
	hero_p1: 'Find your niche.',
	hero_p2: 'Explore inspiring speakers for your next event.',
	hero_cta: 'Browse speakers ↗',
	sess_eyebrow: '01 / FIND THE RIGHT FIT',
	sess_t1: 'BIG IDEAS.',
	sess_t2: 'REAL IMPACT.',
	sess_search_label: 'Explore available sessions',
	sess_search_ph: 'Search leadership, innovation, sports…',
	sess_none: 'No matching sessions. Try another search.',
	sess_card_cat: 'LIVE EXPERIENCES / EXPERT VOICES',
	sess_card_cta: 'Explore session ↗',
	join_eyebrow: 'ARE YOU A SPEAKER OR CELEBRITY?',
	join_title: 'ADD YOUR PROFILE.',
	join_text: 'Create your profile, set your fee and receive booking requests directly. Your contact and payout details stay private and encrypted.',
	join_cta: 'Create your profile ↗',
	join_terms: 'Commission-based terms apply.',
	cart_eyebrow: 'YOUR NEXT BIG MOMENT',
	cart_title: 'Your selection.',
	cart_loading: 'Loading selection…',
	cart_empty: 'Your selection is empty.',
	cart_explore: 'Explore sessions →',
	cart_qty: 'Quantity',
	cart_remove: 'Remove',
	cart_total: 'Total',
	cart_commission: 'Platform commission allocation ({pct}%): {amount}. Included in the total; this is a calculation, not a completed payout.',
	cart_pay: 'Continue to secure payment ↗',
	cart_pay_busy: 'Opening secure checkout…',
	cart_error: 'Checkout could not be opened. Please try again.',
	cart_stock: 'Update selection to available stock',
	footer_t1: 'LET’S MAKE',
	footer_t2: 'SOME NOISE.',
	footer_brand: 'All Indian Speakers © 2026',
	footer_explore: 'Explore sessions ↗',
	footer_cookie: 'Cookie settings',
	footer_terms: 'Terms & commission',
};

export type MessageKey = keyof typeof en;
type Messages = Partial<Record<MessageKey, string>>;

const hi: Messages = {
	nav_discover: 'सेशन खोजें', nav_speakers: 'वक्ता', nav_join: 'अपनी प्रोफ़ाइल जोड़ें', nav_cart: 'आपका चयन', lang_label: 'भाषा',
	hero_eyebrow: 'भारत की आवाज़ें। आपका अगला बड़ा पल।', hero_l1: 'आपकी आवाज़।', hero_l2: 'आपका मंच।',
	hero_p1: 'असाधारण आवाज़ों को अपने कार्यक्रम में लाइए।', hero_p2: 'कीनोट, लाइव प्रस्तुतियाँ और ऑनलाइन बातचीत खोजें।', hero_cta: 'अपना अगला वक्ता खोजें ↗',
	sess_eyebrow: '01 / सही विकल्प चुनें', sess_t1: 'बड़े विचार।', sess_t2: 'असली असर।', sess_search_label: 'उपलब्ध सेशन खोजें', sess_search_ph: 'नेतृत्व, नवाचार, खेल खोजें…', sess_none: 'कोई मिलता-जुलता सेशन नहीं मिला। दूसरी खोज आज़माएँ।', sess_card_cat: 'लाइव अनुभव / विशेषज्ञ आवाज़ें', sess_card_cta: 'सेशन देखें ↗',
	join_eyebrow: 'क्या आप वक्ता या सेलिब्रिटी हैं?', join_title: 'अपनी प्रोफ़ाइल जोड़ें।', join_text: 'अपनी प्रोफ़ाइल बनाएँ, अपनी फ़ीस तय करें और बुकिंग अनुरोध सीधे पाएँ। आपकी संपर्क और भुगतान जानकारी निजी और एन्क्रिप्टेड रहती है।', join_cta: 'अपनी प्रोफ़ाइल बनाएँ ↗', join_terms: 'कमीशन आधारित शर्तें लागू।',
	cart_eyebrow: 'आपका अगला बड़ा पल', cart_title: 'आपका चयन।', cart_loading: 'चयन लोड हो रहा है…', cart_empty: 'आपका चयन खाली है।', cart_explore: 'सेशन देखें →', cart_qty: 'मात्रा', cart_remove: 'हटाएँ', cart_total: 'कुल',
	cart_commission: 'प्लेटफ़ॉर्म कमीशन आवंटन ({pct}%): {amount}। यह कुल राशि में शामिल है; यह केवल गणना है, पूर्ण भुगतान नहीं।', cart_pay: 'सुरक्षित भुगतान जारी रखें ↗', cart_pay_busy: 'सुरक्षित चेकआउट खुल रहा है…', cart_error: 'चेकआउट नहीं खुल सका। कृपया फिर कोशिश करें।', cart_stock: 'चयन को उपलब्ध स्टॉक के अनुसार अपडेट करें',
	footer_t1: 'चलिए मचाएँ', footer_t2: 'कुछ हलचल।', footer_brand: 'ऑल इंडियन स्पीकर्स © 2026', footer_explore: 'सेशन देखें ↗', footer_cookie: 'कुकी सेटिंग्स', footer_terms: 'शर्तें और कमीशन',
};

const ta: Messages = {
	nav_discover: 'அமர்வுகளைக் காண்க', nav_speakers: 'பேச்சாளர்கள்', nav_join: 'உங்கள் சுயவிவரத்தைச் சேர்க்கவும்', nav_cart: 'உங்கள் தேர்வு', lang_label: 'மொழி',
	hero_eyebrow: 'இந்தியாவின் குரல்கள். உங்கள் அடுத்த பெரிய தருணம்.', hero_l1: 'உங்கள் குரல்.', hero_l2: 'உங்கள் மேடை.',
	hero_p1: 'சிறந்த குரல்களை உங்கள் நிகழ்வுக்கு அழைத்து வாருங்கள்.', hero_p2: 'முக்கிய உரைகள், நேரடி நிகழ்ச்சிகள், ஆன்லைன் உரையாடல்களைக் கண்டறியுங்கள்.', hero_cta: 'உங்கள் அடுத்த பேச்சாளரைக் கண்டறியுங்கள் ↗',
	sess_eyebrow: '01 / சரியான தேர்வு', sess_t1: 'பெரிய சிந்தனைகள்.', sess_t2: 'உண்மையான தாக்கம்.', sess_search_label: 'கிடைக்கும் அமர்வுகளைத் தேடுங்கள்', sess_search_ph: 'தலைமைத்துவம், புதுமை, விளையாட்டு…', sess_none: 'பொருந்தும் அமர்வுகள் இல்லை. வேறு தேடலை முயற்சிக்கவும்.', sess_card_cat: 'நேரடி அனுபவங்கள் / நிபுணர் குரல்கள்', sess_card_cta: 'அமர்வைக் காண்க ↗',
	join_eyebrow: 'நீங்கள் பேச்சாளரா அல்லது பிரபலமா?', join_title: 'உங்கள் சுயவிவரத்தைச் சேர்க்கவும்.', join_text: 'சுயவிவரத்தை உருவாக்கி, கட்டணத்தை நிர்ணயித்து, முன்பதிவு கோரிக்கைகளை நேரடியாகப் பெறுங்கள். உங்கள் தொடர்பு மற்றும் பணம் செலுத்தும் விவரங்கள் தனிப்பட்டவையாகவும் குறியாக்கம் செய்யப்பட்டும் இருக்கும்.', join_cta: 'சுயவிவரத்தை உருவாக்குங்கள் ↗', join_terms: 'கமிஷன் அடிப்படையிலான விதிமுறைகள் பொருந்தும்.',
	cart_eyebrow: 'உங்கள் அடுத்த பெரிய தருணம்', cart_title: 'உங்கள் தேர்வு.', cart_loading: 'தேர்வு ஏற்றப்படுகிறது…', cart_empty: 'உங்கள் தேர்வு காலியாக உள்ளது.', cart_explore: 'அமர்வுகளைக் காண்க →', cart_qty: 'அளவு', cart_remove: 'நீக்கு', cart_total: 'மொத்தம்',
	cart_commission: 'தளக் கமிஷன் ஒதுக்கீடு ({pct}%): {amount}. மொத்தத்தில் சேர்க்கப்பட்டுள்ளது; இது கணக்கீடு மட்டுமே, செலுத்தப்பட்ட தொகை அல்ல.', cart_pay: 'பாதுகாப்பான பணம் செலுத்தலைத் தொடரவும் ↗', cart_pay_busy: 'பாதுகாப்பான செக்அவுட் திறக்கிறது…', cart_error: 'செக்அவுட்டைத் திறக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', cart_stock: 'கிடைக்கும் இருப்புக்கு ஏற்ப தேர்வைப் புதுப்பிக்கவும்',
	footer_t1: 'வாருங்கள்', footer_t2: 'ஒரு அதிர்வை உருவாக்குவோம்.', footer_brand: 'ஆல் இந்தியன் ஸ்பீக்கர்ஸ் © 2026', footer_explore: 'அமர்வுகளைக் காண்க ↗', footer_cookie: 'குக்கீ அமைப்புகள்', footer_terms: 'விதிமுறைகள் & கமிஷன்',
};

const te: Messages = {
	nav_discover: 'సెషన్లను చూడండి', nav_speakers: 'వక్తలు', nav_join: 'మీ ప్రొఫైల్ జోడించండి', nav_cart: 'మీ ఎంపిక', lang_label: 'భాష',
	hero_eyebrow: 'భారతదేశ స్వరాలు. మీ తదుపరి గొప్ప క్షణం.', hero_l1: 'మీ స్వరం.', hero_l2: 'మీ వేదిక.',
	hero_p1: 'అద్భుతమైన స్వరాలను మీ వేదికపైకి తీసుకురండి.', hero_p2: 'కీనోట్‌లు, లైవ్ ప్రదర్శనలు, ఆన్‌లైన్ సంభాషణలను కనుగొనండి.', hero_cta: 'మీ తదుపరి వక్తను కనుగొనండి ↗',
	sess_eyebrow: '01 / సరైన ఎంపిక', sess_t1: 'గొప్ప ఆలోచనలు.', sess_t2: 'నిజమైన ప్రభావం.', sess_search_label: 'అందుబాటులో ఉన్న సెషన్లను వెతకండి', sess_search_ph: 'నాయకత్వం, ఆవిష్కరణ, క్రీడలు…', sess_none: 'సరిపోలే సెషన్లు లేవు. మరో శోధన ప్రయత్నించండి.', sess_card_cat: 'లైవ్ అనుభవాలు / నిపుణుల స్వరాలు', sess_card_cta: 'సెషన్ చూడండి ↗',
	join_eyebrow: 'మీరు వక్తనా లేదా సెలబ్రిటీనా?', join_title: 'మీ ప్రొఫైల్ జోడించండి.', join_text: 'ప్రొఫైల్ సృష్టించండి, మీ ఫీజు నిర్ణయించండి, బుకింగ్ అభ్యర్థనలను నేరుగా పొందండి. మీ సంప్రదింపు మరియు చెల్లింపు వివరాలు ప్రైవేట్‌గా, ఎన్‌క్రిప్ట్ చేయబడి ఉంటాయి.', join_cta: 'ప్రొఫైల్ సృష్టించండి ↗', join_terms: 'కమిషన్ ఆధారిత నిబంధనలు వర్తిస్తాయి.',
	cart_eyebrow: 'మీ తదుపరి గొప్ప క్షణం', cart_title: 'మీ ఎంపిక.', cart_loading: 'ఎంపిక లోడ్ అవుతోంది…', cart_empty: 'మీ ఎంపిక ఖాళీగా ఉంది.', cart_explore: 'సెషన్లను చూడండి →', cart_qty: 'పరిమాణం', cart_remove: 'తొలగించు', cart_total: 'మొత్తం',
	cart_commission: 'ప్లాట్‌ఫాం కమిషన్ కేటాయింపు ({pct}%): {amount}. మొత్తంలో కలిపి ఉంది; ఇది లెక్కింపు మాత్రమే, పూర్తయిన చెల్లింపు కాదు.', cart_pay: 'సురక్షిత చెల్లింపుకు కొనసాగండి ↗', cart_pay_busy: 'సురక్షిత చెక్అవుట్ తెరుచుకుంటోంది…', cart_error: 'చెక్అవుట్ తెరవలేకపోయాం. దయచేసి మళ్లీ ప్రయత్నించండి.', cart_stock: 'అందుబాటులో ఉన్న స్టాక్‌కు ఎంపికను నవీకరించండి',
	footer_t1: 'రండి', footer_t2: 'సందడి చేద్దాం.', footer_brand: 'ఆల్ ఇండియన్ స్పీకర్స్ © 2026', footer_explore: 'సెషన్లను చూడండి ↗', footer_cookie: 'కుకీ సెట్టింగ్‌లు', footer_terms: 'నిబంధనలు & కమిషన్',
};

const bn: Messages = {
	nav_discover: 'সেশন দেখুন', nav_speakers: 'বক্তা', nav_join: 'আপনার প্রোফাইল যোগ করুন', nav_cart: 'আপনার নির্বাচন', lang_label: 'ভাষা',
	hero_eyebrow: 'ভারতের কণ্ঠস্বর। আপনার পরবর্তী বড় মুহূর্ত।', hero_l1: 'আপনার কণ্ঠ।', hero_l2: 'আপনার মঞ্চ।',
	hero_p1: 'অসাধারণ কণ্ঠস্বরকে আপনার অনুষ্ঠানে নিয়ে আসুন।', hero_p2: 'কিনোট, লাইভ উপস্থিতি ও অনলাইন আলাপচারিতা খুঁজে নিন।', hero_cta: 'আপনার পরবর্তী বক্তা খুঁজুন ↗',
	sess_eyebrow: '01 / সঠিকটি বেছে নিন', sess_t1: 'বড় ভাবনা।', sess_t2: 'বাস্তব প্রভাব।', sess_search_label: 'উপলব্ধ সেশন খুঁজুন', sess_search_ph: 'নেতৃত্ব, উদ্ভাবন, খেলাধুলা…', sess_none: 'কোনো মিল পাওয়া যায়নি। অন্য কিছু খুঁজুন।', sess_card_cat: 'লাইভ অভিজ্ঞতা / বিশেষজ্ঞ কণ্ঠ', sess_card_cta: 'সেশন দেখুন ↗',
	join_eyebrow: 'আপনি কি বক্তা বা সেলিব্রিটি?', join_title: 'আপনার প্রোফাইল যোগ করুন।', join_text: 'প্রোফাইল তৈরি করুন, ফি নির্ধারণ করুন এবং সরাসরি বুকিং অনুরোধ পান। আপনার যোগাযোগ ও পেমেন্টের তথ্য গোপন ও এনক্রিপ্টেড থাকে।', join_cta: 'প্রোফাইল তৈরি করুন ↗', join_terms: 'কমিশনভিত্তিক শর্তাবলি প্রযোজ্য।',
	cart_eyebrow: 'আপনার পরবর্তী বড় মুহূর্ত', cart_title: 'আপনার নির্বাচন।', cart_loading: 'নির্বাচন লোড হচ্ছে…', cart_empty: 'আপনার নির্বাচন খালি।', cart_explore: 'সেশন দেখুন →', cart_qty: 'পরিমাণ', cart_remove: 'সরান', cart_total: 'মোট',
	cart_commission: 'প্ল্যাটফর্ম কমিশন বরাদ্দ ({pct}%): {amount}। মোটের অন্তর্ভুক্ত; এটি কেবল হিসাব, সম্পন্ন পেআউট নয়।', cart_pay: 'নিরাপদ পেমেন্টে এগিয়ে যান ↗', cart_pay_busy: 'নিরাপদ চেকআউট খুলছে…', cart_error: 'চেকআউট খোলা যায়নি। আবার চেষ্টা করুন।', cart_stock: 'উপলব্ধ স্টক অনুযায়ী নির্বাচন আপডেট করুন',
	footer_t1: 'চলুন', footer_t2: 'একটু হইচই করি।', footer_brand: 'অল ইন্ডিয়ান স্পিকার্স © 2026', footer_explore: 'সেশন দেখুন ↗', footer_cookie: 'কুকি সেটিংস', footer_terms: 'শর্তাবলি ও কমিশন',
};

const mr: Messages = {
	nav_discover: 'सत्रे शोधा', nav_speakers: 'वक्ते', nav_join: 'तुमची प्रोफाइल जोडा', nav_cart: 'तुमची निवड', lang_label: 'भाषा',
	hero_eyebrow: 'भारताचे आवाज. तुमचा पुढचा मोठा क्षण.', hero_l1: 'तुमचा आवाज.', hero_l2: 'तुमचे व्यासपीठ.',
	hero_p1: 'उत्कृष्ट आवाजांना तुमच्या कार्यक्रमात आणा.', hero_p2: 'कीनोट, थेट सादरीकरणे आणि ऑनलाइन संवाद शोधा.', hero_cta: 'तुमचा पुढचा वक्ता शोधा ↗',
	sess_eyebrow: '01 / योग्य निवड', sess_t1: 'मोठ्या कल्पना.', sess_t2: 'खरा प्रभाव.', sess_search_label: 'उपलब्ध सत्रे शोधा', sess_search_ph: 'नेतृत्व, नावीन्य, क्रीडा शोधा…', sess_none: 'जुळणारी सत्रे नाहीत. दुसरा शोध वापरून पहा.', sess_card_cat: 'थेट अनुभव / तज्ज्ञ आवाज', sess_card_cta: 'सत्र पहा ↗',
	join_eyebrow: 'तुम्ही वक्ता किंवा सेलिब्रिटी आहात का?', join_title: 'तुमची प्रोफाइल जोडा.', join_text: 'प्रोफाइल तयार करा, तुमचे शुल्क ठरवा आणि बुकिंग विनंत्या थेट मिळवा. तुमची संपर्क आणि पेमेंट माहिती खाजगी व एन्क्रिप्टेड राहते.', join_cta: 'प्रोफाइल तयार करा ↗', join_terms: 'कमिशन आधारित अटी लागू.',
	cart_eyebrow: 'तुमचा पुढचा मोठा क्षण', cart_title: 'तुमची निवड.', cart_loading: 'निवड लोड होत आहे…', cart_empty: 'तुमची निवड रिकामी आहे.', cart_explore: 'सत्रे पहा →', cart_qty: 'संख्या', cart_remove: 'काढा', cart_total: 'एकूण',
	cart_commission: 'प्लॅटफॉर्म कमिशन तरतूद ({pct}%): {amount}. एकूण रकमेत समाविष्ट; हे केवळ गणित आहे, पूर्ण झालेले पेमेंट नाही.', cart_pay: 'सुरक्षित पेमेंटकडे पुढे जा ↗', cart_pay_busy: 'सुरक्षित चेकआउट उघडत आहे…', cart_error: 'चेकआउट उघडता आले नाही. कृपया पुन्हा प्रयत्न करा.', cart_stock: 'उपलब्ध साठ्यानुसार निवड अपडेट करा',
	footer_t1: 'चला करूया', footer_t2: 'थोडा गोंधळ.', footer_brand: 'ऑल इंडियन स्पीकर्स © 2026', footer_explore: 'सत्रे पहा ↗', footer_cookie: 'कुकी सेटिंग्ज', footer_terms: 'अटी आणि कमिशन',
};

const gu: Messages = {
	nav_discover: 'સત્રો શોધો', nav_speakers: 'વક્તાઓ', nav_join: 'તમારી પ્રોફાઇલ ઉમેરો', nav_cart: 'તમારી પસંદગી', lang_label: 'ભાષા',
	hero_eyebrow: 'ભારતના અવાજો. તમારી આગામી મોટી ક્ષણ.', hero_l1: 'તમારો અવાજ.', hero_l2: 'તમારો મંચ.',
	hero_p1: 'શ્રેષ્ઠ અવાજોને તમારા કાર્યક્રમમાં લાવો.', hero_p2: 'કીનોટ, લાઇવ પ્રસ્તુતિઓ અને ઓનલાઇન વાર્તાલાપ શોધો.', hero_cta: 'તમારા આગામી વક્તાને શોધો ↗',
	sess_eyebrow: '01 / યોગ્ય પસંદગી', sess_t1: 'મોટા વિચારો.', sess_t2: 'સાચી અસર.', sess_search_label: 'ઉપલબ્ધ સત્રો શોધો', sess_search_ph: 'નેતૃત્વ, નવીનતા, રમતગમત શોધો…', sess_none: 'કોઈ મેળ ખાતું સત્ર નથી. બીજી શોધ અજમાવો.', sess_card_cat: 'લાઇવ અનુભવો / નિષ્ણાત અવાજો', sess_card_cta: 'સત્ર જુઓ ↗',
	join_eyebrow: 'શું તમે વક્તા કે સેલિબ્રિટી છો?', join_title: 'તમારી પ્રોફાઇલ ઉમેરો.', join_text: 'પ્રોફાઇલ બનાવો, તમારી ફી નક્કી કરો અને બુકિંગ વિનંતીઓ સીધી મેળવો. તમારી સંપર્ક અને ચુકવણીની વિગતો ખાનગી અને એન્ક્રિપ્ટેડ રહે છે.', join_cta: 'પ્રોફાઇલ બનાવો ↗', join_terms: 'કમિશન આધારિત શરતો લાગુ.',
	cart_eyebrow: 'તમારી આગામી મોટી ક્ષણ', cart_title: 'તમારી પસંદગી.', cart_loading: 'પસંદગી લોડ થઈ રહી છે…', cart_empty: 'તમારી પસંદગી ખાલી છે.', cart_explore: 'સત્રો જુઓ →', cart_qty: 'જથ્થો', cart_remove: 'દૂર કરો', cart_total: 'કુલ',
	cart_commission: 'પ્લેટફોર્મ કમિશન ફાળવણી ({pct}%): {amount}. કુલ રકમમાં સામેલ; આ માત્ર ગણતરી છે, પૂર્ણ થયેલી ચુકવણી નથી.', cart_pay: 'સુરક્ષિત ચુકવણી માટે આગળ વધો ↗', cart_pay_busy: 'સુરક્ષિત ચેકઆઉટ ખુલી રહ્યું છે…', cart_error: 'ચેકઆઉટ ખોલી શકાયું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.', cart_stock: 'ઉપલબ્ધ સ્ટોક મુજબ પસંદગી અપડેટ કરો',
	footer_t1: 'ચાલો', footer_t2: 'થોડો ધમાકો કરીએ.', footer_brand: 'ઓલ ઇન્ડિયન સ્પીકર્સ © 2026', footer_explore: 'સત્રો જુઓ ↗', footer_cookie: 'કૂકી સેટિંગ્સ', footer_terms: 'શરતો અને કમિશન',
};

const kn: Messages = {
	nav_discover: 'ಅಧಿವೇಶನಗಳನ್ನು ಹುಡುಕಿ', nav_speakers: 'ಭಾಷಣಕಾರರು', nav_join: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸೇರಿಸಿ', nav_cart: 'ನಿಮ್ಮ ಆಯ್ಕೆ', lang_label: 'ಭಾಷೆ',
	hero_eyebrow: 'ಭಾರತದ ಧ್ವನಿಗಳು. ನಿಮ್ಮ ಮುಂದಿನ ದೊಡ್ಡ ಕ್ಷಣ.', hero_l1: 'ನಿಮ್ಮ ಧ್ವನಿ.', hero_l2: 'ನಿಮ್ಮ ವೇದಿಕೆ.',
	hero_p1: 'ಅದ್ಭುತ ಧ್ವನಿಗಳನ್ನು ನಿಮ್ಮ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ತನ್ನಿ.', hero_p2: 'ಕೀನೋಟ್, ಲೈವ್ ಪ್ರದರ್ಶನ ಮತ್ತು ಆನ್‌ಲೈನ್ ಸಂವಾದಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.', hero_cta: 'ನಿಮ್ಮ ಮುಂದಿನ ಭಾಷಣಕಾರರನ್ನು ಹುಡುಕಿ ↗',
	sess_eyebrow: '01 / ಸರಿಯಾದ ಆಯ್ಕೆ', sess_t1: 'ದೊಡ್ಡ ಆಲೋಚನೆಗಳು.', sess_t2: 'ನಿಜವಾದ ಪರಿಣಾಮ.', sess_search_label: 'ಲಭ್ಯವಿರುವ ಅಧಿವೇಶನಗಳನ್ನು ಹುಡುಕಿ', sess_search_ph: 'ನಾಯಕತ್ವ, ಆವಿಷ್ಕಾರ, ಕ್ರೀಡೆ…', sess_none: 'ಹೊಂದುವ ಅಧಿವೇಶನಗಳಿಲ್ಲ. ಬೇರೆ ಹುಡುಕಾಟ ಪ್ರಯತ್ನಿಸಿ.', sess_card_cat: 'ಲೈವ್ ಅನುಭವಗಳು / ತಜ್ಞರ ಧ್ವನಿಗಳು', sess_card_cta: 'ಅಧಿವೇಶನ ನೋಡಿ ↗',
	join_eyebrow: 'ನೀವು ಭಾಷಣಕಾರರೇ ಅಥವಾ ಸೆಲೆಬ್ರಿಟಿಯೇ?', join_title: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸೇರಿಸಿ.', join_text: 'ಪ್ರೊಫೈಲ್ ರಚಿಸಿ, ಶುಲ್ಕ ನಿಗದಿಪಡಿಸಿ ಮತ್ತು ಬುಕಿಂಗ್ ವಿನಂತಿಗಳನ್ನು ನೇರವಾಗಿ ಪಡೆಯಿರಿ. ನಿಮ್ಮ ಸಂಪರ್ಕ ಮತ್ತು ಪಾವತಿ ವಿವರಗಳು ಖಾಸಗಿಯಾಗಿ, ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿ ಉಳಿಯುತ್ತವೆ.', join_cta: 'ಪ್ರೊಫೈಲ್ ರಚಿಸಿ ↗', join_terms: 'ಕಮಿಷನ್ ಆಧಾರಿತ ನಿಯಮಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.',
	cart_eyebrow: 'ನಿಮ್ಮ ಮುಂದಿನ ದೊಡ್ಡ ಕ್ಷಣ', cart_title: 'ನಿಮ್ಮ ಆಯ್ಕೆ.', cart_loading: 'ಆಯ್ಕೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ…', cart_empty: 'ನಿಮ್ಮ ಆಯ್ಕೆ ಖಾಲಿಯಾಗಿದೆ.', cart_explore: 'ಅಧಿವೇಶನಗಳನ್ನು ನೋಡಿ →', cart_qty: 'ಪ್ರಮಾಣ', cart_remove: 'ತೆಗೆದುಹಾಕಿ', cart_total: 'ಒಟ್ಟು',
	cart_commission: 'ವೇದಿಕೆ ಕಮಿಷನ್ ಹಂಚಿಕೆ ({pct}%): {amount}. ಒಟ್ಟು ಮೊತ್ತದಲ್ಲಿ ಸೇರಿದೆ; ಇದು ಲೆಕ್ಕಾಚಾರ ಮಾತ್ರ, ಪೂರ್ಣಗೊಂಡ ಪಾವತಿಯಲ್ಲ.', cart_pay: 'ಸುರಕ್ಷಿತ ಪಾವತಿಗೆ ಮುಂದುವರಿಯಿರಿ ↗', cart_pay_busy: 'ಸುರಕ್ಷಿತ ಚೆಕ್‌ಔಟ್ ತೆರೆಯುತ್ತಿದೆ…', cart_error: 'ಚೆಕ್‌ಔಟ್ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', cart_stock: 'ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್‌ಗೆ ಆಯ್ಕೆಯನ್ನು ನವೀಕರಿಸಿ',
	footer_t1: 'ಬನ್ನಿ', footer_t2: 'ಸ್ವಲ್ಪ ಸದ್ದು ಮಾಡೋಣ.', footer_brand: 'ಆಲ್ ಇಂಡಿಯನ್ ಸ್ಪೀಕರ್ಸ್ © 2026', footer_explore: 'ಅಧಿವೇಶನಗಳನ್ನು ನೋಡಿ ↗', footer_cookie: 'ಕುಕೀ ಸೆಟ್ಟಿಂಗ್‌ಗಳು', footer_terms: 'ನಿಯಮಗಳು ಮತ್ತು ಕಮಿಷನ್',
};

const ml: Messages = {
	nav_discover: 'സെഷനുകൾ കണ്ടെത്തുക', nav_speakers: 'പ്രഭാഷകർ', nav_join: 'നിങ്ങളുടെ പ്രൊഫൈൽ ചേർക്കുക', nav_cart: 'നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ്', lang_label: 'ഭാഷ',
	hero_eyebrow: 'ഇന്ത്യയുടെ ശബ്ദങ്ങൾ. നിങ്ങളുടെ അടുത്ത വലിയ നിമിഷം.', hero_l1: 'നിങ്ങളുടെ ശബ്ദം.', hero_l2: 'നിങ്ങളുടെ വേദി.',
	hero_p1: 'മികച്ച ശബ്ദങ്ങളെ നിങ്ങളുടെ പരിപാടിയിലേക്ക് കൊണ്ടുവരൂ.', hero_p2: 'കീനോട്ടുകൾ, ലൈവ് പ്രകടനങ്ങൾ, ഓൺലൈൻ സംഭാഷണങ്ങൾ കണ്ടെത്തൂ.', hero_cta: 'നിങ്ങളുടെ അടുത്ത പ്രഭാഷകനെ കണ്ടെത്തൂ ↗',
	sess_eyebrow: '01 / ശരിയായ തിരഞ്ഞെടുപ്പ്', sess_t1: 'വലിയ ആശയങ്ങൾ.', sess_t2: 'യഥാർത്ഥ സ്വാധീനം.', sess_search_label: 'ലഭ്യമായ സെഷനുകൾ തിരയുക', sess_search_ph: 'നേതൃത്വം, നൂതനത, കായികം…', sess_none: 'പൊരുത്തപ്പെടുന്ന സെഷനുകളില്ല. മറ്റൊരു തിരയൽ നോക്കൂ.', sess_card_cat: 'ലൈവ് അനുഭവങ്ങൾ / വിദഗ്ധ ശബ്ദങ്ങൾ', sess_card_cta: 'സെഷൻ കാണുക ↗',
	join_eyebrow: 'നിങ്ങൾ പ്രഭാഷകനോ സെലിബ്രിറ്റിയോ ആണോ?', join_title: 'നിങ്ങളുടെ പ്രൊഫൈൽ ചേർക്കുക.', join_text: 'പ്രൊഫൈൽ ഉണ്ടാക്കി, ഫീസ് നിശ്ചയിച്ച്, ബുക്കിംഗ് അഭ്യർത്ഥനകൾ നേരിട്ട് സ്വീകരിക്കൂ. നിങ്ങളുടെ ബന്ധപ്പെടാനുള്ള വിവരങ്ങളും പേയ്‌മെന്റ് വിവരങ്ങളും സ്വകാര്യവും എൻക്രിപ്റ്റ് ചെയ്തതുമായിരിക്കും.', join_cta: 'പ്രൊഫൈൽ ഉണ്ടാക്കൂ ↗', join_terms: 'കമ്മീഷൻ അടിസ്ഥാനമാക്കിയ നിബന്ധനകൾ ബാധകം.',
	cart_eyebrow: 'നിങ്ങളുടെ അടുത്ത വലിയ നിമിഷം', cart_title: 'നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ്.', cart_loading: 'തിരഞ്ഞെടുപ്പ് ലോഡ് ചെയ്യുന്നു…', cart_empty: 'നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് ശൂന്യമാണ്.', cart_explore: 'സെഷനുകൾ കാണുക →', cart_qty: 'അളവ്', cart_remove: 'നീക്കം ചെയ്യുക', cart_total: 'ആകെ',
	cart_commission: 'പ്ലാറ്റ്ഫോം കമ്മീഷൻ വിഹിതം ({pct}%): {amount}. ആകെ തുകയിൽ ഉൾപ്പെടുന്നു; ഇത് കണക്കുകൂട്ടൽ മാത്രമാണ്, പൂർത്തിയായ പേയ്‌മെന്റല്ല.', cart_pay: 'സുരക്ഷിത പേയ്‌മെന്റിലേക്ക് തുടരുക ↗', cart_pay_busy: 'സുരക്ഷിത ചെക്ക്ഔട്ട് തുറക്കുന്നു…', cart_error: 'ചെക്ക്ഔട്ട് തുറക്കാനായില്ല. വീണ്ടും ശ്രമിക്കൂ.', cart_stock: 'ലഭ്യമായ സ്റ്റോക്കിനനുസരിച്ച് തിരഞ്ഞെടുപ്പ് പുതുക്കുക',
	footer_t1: 'വരൂ', footer_t2: 'ഒന്ന് ആഘോഷിക്കാം.', footer_brand: 'ഓൾ ഇന്ത്യൻ സ്പീക്കേഴ്സ് © 2026', footer_explore: 'സെഷനുകൾ കാണുക ↗', footer_cookie: 'കുക്കി ക്രമീകരണങ്ങൾ', footer_terms: 'നിബന്ധനകളും കമ്മീഷനും',
};

const pa: Messages = {
	nav_discover: 'ਸੈਸ਼ਨ ਲੱਭੋ', nav_speakers: 'ਬੁਲਾਰੇ', nav_join: 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਜੋੜੋ', nav_cart: 'ਤੁਹਾਡੀ ਚੋਣ', lang_label: 'ਭਾਸ਼ਾ',
	hero_eyebrow: 'ਭਾਰਤ ਦੀਆਂ ਆਵਾਜ਼ਾਂ। ਤੁਹਾਡਾ ਅਗਲਾ ਵੱਡਾ ਪਲ।', hero_l1: 'ਤੁਹਾਡੀ ਆਵਾਜ਼।', hero_l2: 'ਤੁਹਾਡਾ ਮੰਚ।',
	hero_p1: 'ਸ਼ਾਨਦਾਰ ਆਵਾਜ਼ਾਂ ਨੂੰ ਆਪਣੇ ਸਮਾਗਮ ਵਿੱਚ ਲਿਆਓ।', hero_p2: 'ਕੀਨੋਟ, ਲਾਈਵ ਪੇਸ਼ਕਾਰੀਆਂ ਅਤੇ ਆਨਲਾਈਨ ਗੱਲਬਾਤ ਲੱਭੋ।', hero_cta: 'ਆਪਣਾ ਅਗਲਾ ਬੁਲਾਰਾ ਲੱਭੋ ↗',
	sess_eyebrow: '01 / ਸਹੀ ਚੋਣ', sess_t1: 'ਵੱਡੇ ਵਿਚਾਰ।', sess_t2: 'ਅਸਲੀ ਪ੍ਰਭਾਵ।', sess_search_label: 'ਉਪਲਬਧ ਸੈਸ਼ਨ ਲੱਭੋ', sess_search_ph: 'ਅਗਵਾਈ, ਨਵੀਨਤਾ, ਖੇਡਾਂ…', sess_none: 'ਕੋਈ ਮੇਲ ਖਾਂਦਾ ਸੈਸ਼ਨ ਨਹੀਂ। ਹੋਰ ਖੋਜ ਅਜ਼ਮਾਓ।', sess_card_cat: 'ਲਾਈਵ ਤਜਰਬੇ / ਮਾਹਿਰ ਆਵਾਜ਼ਾਂ', sess_card_cta: 'ਸੈਸ਼ਨ ਵੇਖੋ ↗',
	join_eyebrow: 'ਕੀ ਤੁਸੀਂ ਬੁਲਾਰੇ ਜਾਂ ਸੈਲੀਬ੍ਰਿਟੀ ਹੋ?', join_title: 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਜੋੜੋ।', join_text: 'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ, ਆਪਣੀ ਫੀਸ ਤੈਅ ਕਰੋ ਅਤੇ ਬੁਕਿੰਗ ਬੇਨਤੀਆਂ ਸਿੱਧੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ। ਤੁਹਾਡੀ ਸੰਪਰਕ ਅਤੇ ਭੁਗਤਾਨ ਜਾਣਕਾਰੀ ਨਿੱਜੀ ਅਤੇ ਇਨਕ੍ਰਿਪਟਡ ਰਹਿੰਦੀ ਹੈ।', join_cta: 'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ ↗', join_terms: 'ਕਮਿਸ਼ਨ ਆਧਾਰਿਤ ਸ਼ਰਤਾਂ ਲਾਗੂ ਹਨ।',
	cart_eyebrow: 'ਤੁਹਾਡਾ ਅਗਲਾ ਵੱਡਾ ਪਲ', cart_title: 'ਤੁਹਾਡੀ ਚੋਣ।', cart_loading: 'ਚੋਣ ਲੋਡ ਹੋ ਰਹੀ ਹੈ…', cart_empty: 'ਤੁਹਾਡੀ ਚੋਣ ਖਾਲੀ ਹੈ।', cart_explore: 'ਸੈਸ਼ਨ ਵੇਖੋ →', cart_qty: 'ਮਾਤਰਾ', cart_remove: 'ਹਟਾਓ', cart_total: 'ਕੁੱਲ',
	cart_commission: 'ਪਲੇਟਫਾਰਮ ਕਮਿਸ਼ਨ ਵੰਡ ({pct}%): {amount}। ਕੁੱਲ ਰਕਮ ਵਿੱਚ ਸ਼ਾਮਲ; ਇਹ ਸਿਰਫ਼ ਗਣਨਾ ਹੈ, ਪੂਰਾ ਹੋਇਆ ਭੁਗਤਾਨ ਨਹੀਂ।', cart_pay: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਜਾਰੀ ਰੱਖੋ ↗', cart_pay_busy: 'ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਊਟ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ…', cart_error: 'ਚੈੱਕਆਊਟ ਨਹੀਂ ਖੁੱਲ੍ਹ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', cart_stock: 'ਉਪਲਬਧ ਸਟਾਕ ਅਨੁਸਾਰ ਚੋਣ ਅੱਪਡੇਟ ਕਰੋ',
	footer_t1: 'ਚਲੋ', footer_t2: 'ਕੁਝ ਧਮਾਲ ਪਾਈਏ।', footer_brand: 'ਆਲ ਇੰਡੀਅਨ ਸਪੀਕਰਜ਼ © 2026', footer_explore: 'ਸੈਸ਼ਨ ਵੇਖੋ ↗', footer_cookie: 'ਕੂਕੀ ਸੈਟਿੰਗਾਂ', footer_terms: 'ਸ਼ਰਤਾਂ ਅਤੇ ਕਮਿਸ਼ਨ',
};

const catalog: Record<LangCode, Messages> = { en, hi, ta, te, bn, mr, gu, kn, ml, pa };

export const translate = (lang: LangCode, key: MessageKey, vars?: Record<string, string | number>): string => {
	const template = catalog[lang][key] ?? en[key];

	return vars ? template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? '')) : template;
};
