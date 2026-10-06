import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Timer,
} from 'lucide-react';
import { useStudioNoteStore } from '../../store/useStudioNoteStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { useNavigate } from 'react-router-dom';

interface StepDetail {
  step: number;
  icon: string;
  badge: { en: string; hi: string; mr: string };
  title: { en: string; hi: string; mr: string };
  description: { en: string; hi: string; mr: string };
  proTip: { en: string; hi: string; mr: string };
}

const PROCESS_STEPS: StepDetail[] = [
  {
    step: 1,
    icon: '💎',
    badge: { en: 'Selection', hi: 'उत्पाद चयन', mr: 'उत्पादन निवड' },
    title: {
      en: 'Choose the Product',
      hi: 'उत्पाद का चयन करें',
      mr: 'उत्पादन निवडा',
    },
    description: {
      en: 'Select the artisan product piece. Popular studio items include: Keychains (30g), Coasters (80g), Bookmarks (30g), Jewelry/Pendants (20g), Trinket Trays (160g), Name Plates (250g), Wall Art / Geode Clocks (350g+), and Flower Preservation Castings.',
      hi: 'शुरुआती और लोकप्रिय उत्पादों में शामिल हैं: कीचेन (30g), कोस्टर (80g), बुकमार्क (30g), ज्वेलरी पेंडेंट (20g), ट्रे (160g), नेमप्लेट (250g), घड़ियाँ/वॉल आर्ट (350g+) और फ्लावर प्रिजर्वेशन।',
      mr: 'सुरुवातीच्या आणि लोकप्रिय उत्पादनांमध्ये समावेश: कीचेन (30g), कोस्टर (80g), बुकमार्क (30g), दागिने/पेंडंट (20g), ट्रे (160g), नेमप्लेट (250g), घड्याळे/वॉल आर्ट (350g+) आणि फुल संरक्षण.',
    },
    proTip: {
      en: 'For deep castings like flower preservation or pyramids, always select a 3:1 Deep Pour resin to avoid exotherm overheating.',
      hi: 'फूल संरक्षण या बड़े पिरामिड जैसी गहरी ढलाई के लिए हमेशा 3:1 डीप पोर रेजिन चुनें ताकि अधिक गर्मी से उत्पाद खराब न हो।',
      mr: 'फुल संरक्षण किंवा मोठ्या पिरॅमिडसारख्या खोल कास्टिंगसाठी नेहमी 3:1 डीप पोर रेझिन वापरा जेणेकरून उष्णता वाढणार नाही.',
    },
  },
  {
    step: 2,
    icon: '🧤',
    badge: { en: 'Safety First', hi: 'सुरक्षा नियम', mr: 'सुरक्षा नियम' },
    title: {
      en: 'Prepare Workspace & Safety',
      hi: 'कार्यक्षेत्र और सुरक्षा तैयार करें',
      mr: 'कार्यक्षेत्र आणि सुरक्षा तयार करा',
    },
    description: {
      en: 'Work on a level, dust-free, well-ventilated table. Cover the surface with a reusable silicone mat or plastic sheet. Wear Nitrile Gloves, protective eyewear, and appropriate clothing.',
      hi: 'समतल, धूल-मुक्त और हवादार मेज पर काम करें। सतह को सिलिकॉन मैट से ढकें। हमेशा नाइट्राइल दस्ताने, सुरक्षा चश्मा और सुरक्षात्मक कपड़े पहनें।',
      mr: 'सपाट, धूळमुक्त आणि हवेशीर टेबलवर काम करा. टेबलवर सिलिकॉन मॅट पसरा. नेहमी नायट्रिल हातमोजे, सुरक्षा चष्मा आणि योग्य कपडे वापरा.',
    },
    proTip: {
      en: 'Never use latex gloves — epoxy resin chemicals can penetrate latex. Only medical-grade nitrile gloves provide complete chemical resistance.',
      hi: 'लेटेक्स दस्ताने कभी न पहनें — रेजिन के रसायन लेटेक्स को भेद सकते हैं। केवल नाइट्राइल दस्ताने ही पूर्ण सुरक्षा प्रदान करते हैं।',
      mr: 'लेटेक्स हातमोजे कधीही वापरू नका — रेझिन रसायने लेटेक्समधून आत जाऊ शकतात. फक्त नायट्रिल हातमोजेच पूर्ण रासायनिक संरक्षण देतात.',
    },
  },
  {
    step: 3,
    icon: '🧰',
    badge: { en: 'Equipment', hi: 'सामग्री व उपकरण', mr: 'साहित्य व साधने' },
    title: {
      en: 'Gather Materials & Tools',
      hi: 'सामग्री और उपकरण एकत्र करें',
      mr: 'साहित्य आणि साधने गोळा करा',
    },
    description: {
      en: 'Assemble 2-part epoxy resin, graduated measuring cups, silicone stir sticks, silicone molds, mica powders or alcohol inks, dried flowers, glitter, heat gun/torch, and 400-2000 grit sandpaper.',
      hi: '2-पार्ट एपॉक्सी रेजिन, मापने वाले कप, सिलिकॉन स्टिक्स, सिलिकॉन मोल्ड्स, माइका पाउडर या एल्कोहॉल इंक, सूखे फूल, ग्लिटर, हीट गन और 400-2000 ग्रिट सैंडपेपर तैयार रखें।',
      mr: '2-पार्ट इपॉक्सी रेझिन, मोजण्याचे कप, सिलिकॉन स्टिक्स, सिलिकॉन मोल्ड्स, मायका पावडर, सुकलेली फुले, ग्लिटर, हीट गन आणि 400-2000 ग्रिट सँडपेपर गोळा करा.',
    },
    proTip: {
      en: 'Ensure dried flowers are 100% moisture-free; any moisture inside organic botanicals will cause resin cloudiness or browning over time.',
      hi: 'सुनिश्चित करें कि सूखे फूल 100% नमी-मुक्त हों; फूलों में थोड़ी सी भी नमी रेजिन को धुंधला या भूरा कर देगी।',
      mr: 'सुकलेली फुले 100% कोरडी असल्याची खात्री करा; फुलांमधील थोडासाही ओलावा रेझिनला काळवंडू किंवा धुसर करू शकतो.',
    },
  },
  {
    step: 4,
    icon: '⚖️',
    badge: { en: 'Accuracy', hi: 'सटीक माप', mr: 'अचूक मापन' },
    title: {
      en: 'Measure the Resin Precisely',
      hi: 'रेजिन को सटीकता से मापें',
      mr: 'रेझिन अचूक मोजा',
    },
    description: {
      en: 'Follow your kit mixing ratio (e.g. 2:1 by weight or 1:1 by volume). Use a digital gram scale for weight ratios. Never eyeball or guess measurements—an incorrect ratio will result in permanent stickiness.',
      hi: 'अपने किट के अनुपात (जैसे वजन अनुसार 2:1) का पालन करें। डिजिटल ग्राम वजन कांटे का उपयोग करें। कभी भी अनुमान न लगाएं—गलत अनुपात से रेजिन कभी नहीं सूखेगा।',
      mr: 'तुमच्या किटमधील प्रमाणानुसार (उदा. वजनाने 2:1) मोजा. डिजिटल ग्रॅम वजन काटा वापरा. कधीही अंदाजाने मोजू नका—चुकीच्या प्रमाणामुळे रेझिन कायमचे चिकट राहू शकते.',
    },
    proTip: {
      en: 'Say "Hey Partner, calculate 240g resin" to hear exact Part A & Part B weight ratios automatically.',
      hi: '"हे पार्टनर, 240 ग्राम रेजिन का हिसाब" कहें और पार्ट A तथा पार्ट B का सटीक वजन तुरंत जानें।',
      mr: '"हे पार्टनर, 240 ग्रॅम रेझिनचे प्रमाण" म्हणा आणि पार्ट A व पार्ट B चे अचूक वजन ताबडतोब जाणून घ्या.',
    },
  },
  {
    step: 5,
    icon: '🥣',
    badge: { en: 'Mixing', hi: 'घोलना व मिश्रण', mr: 'ढवळणे व मिश्रण' },
    title: {
      en: 'Mix Slowly & Scrape Sides',
      hi: 'धीरे-धीरे घोलें और किनारे खुरचें',
      mr: 'हळूवारपणे ढवळा आणि बाजू खरवडा',
    },
    description: {
      en: 'Pour both parts into a clean cup. Mix slowly for 3 to 5 minutes in a consistent circular motion. Regularly scrape the cup sides and bottom to guarantee 100% molecular cross-linking without introducing excess air bubbles.',
      hi: 'दोनों भागों को एक साफ कप में डालें। 3 से 5 मिनट तक लगातार एक ही दिशा में धीरे-धीरे घुमाएं। कप के किनारों और तली को अच्छी तरह खुरचें ताकि पूरा घोल मिल जाए।',
      mr: 'दोन्ही भाग स्वच्छ कपमध्ये टाका. 3 ते 5 मिनिटे एकाच दिशेने हळूवार ढवळा. कपाच्या बाजू आणि तळ व्यवस्थित खरवडून घ्या जेणेकरून योग्य रासायनिक प्रक्रिया होईल.',
    },
    proTip: {
      en: 'Say "Hey Partner, start timer 3 minutes" to start stirring countdown hands-free without touching screens with sticky gloves.',
      hi: '"हे पार्टनर, 3 मिनट का टाइमर शुरू करो" कहकर बिना स्क्रीन छुए टाइमर चालू करें।',
      mr: '"हे पार्टनर, 3 मिनिटांचा टायमर सुरू करा" म्हणून स्क्रीनला हात न लावता टायमर सुरू करा.',
    },
  },
  {
    step: 6,
    icon: '🎨',
    badge: { en: 'Creativity', hi: 'रंग व सजावट', mr: 'रंग व सजावट' },
    title: {
      en: 'Add Colors, Inks & Inclusions',
      hi: 'रंग, स्याही और सजावट जोड़ें',
      mr: 'रंग, शाई आणि सजावट घाला',
    },
    description: {
      en: 'Divide mixture into small cups. Add mica pigment, resin dyes, or alcohol ink (keep pigment under 5% total volume to avoid soft cure). Pour thin base layers before placing dried flowers or gold flakes.',
      hi: 'घोल को छोटे कपों में बांटें। माइका पाउडर, रेजिन डाई या एल्कोहॉल इंक डालें (रंग की मात्रा 5% से कम रखें)। सूखे फूल या सोने की पन्नी रखने से पहले पतली बेस परत डालें।',
      mr: 'मिश्रण लहान कपमध्ये वाटा. मायका पावडर, रेझिन रंग किंवा अल्कोहोल इंक घाला (रंग 5% पेक्षा कमी ठेवा). सुकलेली फुले किंवा फॉइल ठेवण्यापूर्वी पातळ बेस लेयर टाका.',
    },
    proTip: {
      en: 'Let the base layer cure to a tacky gel state (approx. 2 hours) before placing heavy charms or flowers to prevent them from sinking to the bottom.',
      hi: 'भारी फूलों या मोतियों को डूबने से बचाने के लिए बेस परत को 2 घंटे तक थोड़ा गाढ़ा (जेल) होने दें, फिर उन पर सजावट रखें।',
      mr: 'जड फुले किंवा वस्तू तळाशी बुडू नयेत म्हणून बेस लेयरला 2 तास थोडे घट्ट (जेल) होऊ द्या, मग त्यावर सजावट ठेवा.',
    },
  },
  {
    step: 7,
    icon: '📐',
    badge: { en: 'Pouring', hi: 'मोल्ड में ढलाई', mr: 'मोल्डमध्ये ओतणे' },
    title: {
      en: 'Pour into the Mold',
      hi: 'मोल्ड में रेजिन डालें',
      mr: 'मोल्डमध्ये रेझिन ओता',
    },
    description: {
      en: 'Pour resin slowly in a thin ribbon from low height into the center of the silicone mold. Avoid overfilling. Pass a heat gun 6 inches away to pop floating surface micro-bubbles.',
      hi: 'कम ऊंचाई से पतली धार में रेजिन को सिलिकॉन मोल्ड के बीच में डालें। अधिक न भरें। सतह के बुलबुलों को फोड़ने के लिए 6 इंच की दूरी से हीट गन चलाएं।',
      mr: 'कमी उंचीवरून पातळ धारेत रेझिन मोल्डच्या मध्यभागी ओता. जास्त भरू नका. वरचे हवेचे बुडबुडे फोडण्यासाठी 6 इंच अंतरावरून हीट गन फिरवा.',
    },
    proTip: {
      en: 'Never hold the heat gun/torch in one spot for more than 2 seconds; excessive direct heat can melt and fuse silicone molds.',
      hi: 'हीट गन को एक जगह पर 2 सेकंड से ज्यादा न रखें; अधिक गर्मी सिलिकॉन मोल्ड को पिघलाकर चिपका सकती है।',
      mr: 'हीट गन एकाच ठिकाणी 2 सेकंदांपेक्षा जास्त धरू नका; अतिउष्णतेमुळे सिलिकॉन मोल्ड वितळून खराब होऊ शकतो.',
    },
  },
  {
    step: 8,
    icon: '⏳',
    badge: { en: 'Curing', hi: 'सुखाना (क्योरिंग)', mr: 'सुकवणे (क्युरिंग)' },
    title: {
      en: 'Dust-Free Curing Cycle',
      hi: 'धूल-मुक्त क्योरिंग चक्र',
      mr: 'धूळमुक्त क्युरिंग सायकल',
    },
    description: {
      en: 'Cover the poured piece with a clean inverted plastic container or cardboard box to shield it from ambient floating dust. Leave undisturbed at 22°C–26°C for 24 to 48 hours.',
      hi: 'ढाले गए उत्पाद को धूल से बचाने के लिए साफ प्लास्टिक के डिब्बे से ढकें। इसे 22°C–26°C तापमान में 24 से 48 घंटे तक बिना हिलाए सूखने दें।',
      mr: 'तयार वस्तूला हवेतील धूळ लागू नये म्हणून प्लास्टिकच्या डब्याने झाका. 22°C–26°C तापमानात 24 ते 48 तास न हलवता सुकू द्या.',
    },
    proTip: {
      en: 'Cold temperatures drastically slow down curing. Maintain warm room temperature for optimal diamond-clear glass cure.',
      hi: 'ठंडे मौसम में रेजिन बहुत देर से सूखता है। शीशे जैसी चमक और कड़कपन के लिए कमरे का तापमान गर्म रखें।',
      mr: 'थंड वातावरणात रेझिन सुकायला जास्त वेळ लागतो. काचेसारख्या चमक आणि कडकपणासाठी खोलीचे तापमान उबदार ठेवा.',
    },
  },
  {
    step: 9,
    icon: '✨',
    badge: { en: 'Demolding', hi: 'मोल्ड से निकालना', mr: 'मोल्डमधून काढणे' },
    title: {
      en: 'Careful Demolding',
      hi: 'सावधानीपूर्वक मोल्ड से बाहर निकालें',
      mr: 'काळजीपूर्वक मोल्डमधून बाहेर काढा',
    },
    description: {
      en: 'After full cure, gently peel back silicone mold edges and push the piece out from the center. Do not force or pull hard if the piece feels pliable—allow an extra 12 hours if needed.',
      hi: 'पूरी तरह कड़ा होने पर सिलिकॉन मोल्ड के किनारों को धीरे से पीछे खींचें और बीच से दबाकर निकालें। यदि उत्पाद थोड़ा नरम लगे तो 12 घंटे और रुकें।',
      mr: 'पूर्ण कडक झाल्यावर सिलिकॉन मोल्डच्या बाजू हळूच सैल करा आणि मध्यभागातून बाहेर ढकला. वस्तू मऊ वाटल्यास आणखी 12 तास वाट पहा.',
    },
    proTip: {
      en: 'A drop of soapy water or mold release spray helps slip tight, intricate silicone molds off easily without tearing.',
      hi: 'साबुन के पानी की एक बूंद या मोल्ड रिलीज स्प्रे जटिल आकृतियों को बिना मोल्ड फाड़े आसानी से बाहर निकाल देता है।',
      mr: 'साबणाच्या पाण्याचा एक थेंब किंवा मोल्ड रिलीज स्प्रे वापरल्यास अवघड मोल्ड्स फाटल्याशिवाय सहज बाहेर पडतात.',
    },
  },
  {
    step: 10,
    icon: '🪚',
    badge: { en: 'Finishing', hi: 'घिसाई व पॉलिश', mr: 'घासणे व पॉलिश' },
    title: {
      en: 'Finishing & Hardware Attachment',
      hi: 'फिनिशिंग और हार्डवेयर जोड़ें',
      mr: 'फिनिशिंग आणि हार्डवेअर जोडा',
    },
    description: {
      en: 'Wet-sand rough back edges with 400 → 800 → 1500 → 2000 grit sandpaper. Polish with buffing compound. Attach keychain rings, hooks, or handles.',
      hi: 'पीछे के खुरदुरे किनारों को 400 → 800 → 1500 → 2000 ग्रिट गीले सैंडपेपर से घिसें। पॉलिशिंग पेस्ट से चमकाएं और कीचेन रिंग या हैंडल लगाएं।',
      mr: 'खालच्या खडबडीत कडा 400 → 800 → 1500 → 2000 ग्रिट ओल्या सँडपेपरने घासा. पॉलिश करून चकचकीत करा आणि कीचेन कडी जोडा.',
    },
    proTip: {
      en: 'Always wet-sand with a bowl of water to eliminate airborne resin dust particles completely for lung safety.',
      hi: 'सैंडपेपर हमेशा पानी में भिगोकर ही घिसें ताकि रेजिन की धूल हवा में न उड़े और फेफड़ों को नुकसान न पहुंचे।',
      mr: 'नेहमी पाण्यात भिजवूनच सँडपेपर वापरा जेणेकरून रेझिनची धूळ हवेत उडणार नाही आणि आरोग्याला धोका होणार नाही.',
    },
  },
  {
    step: 11,
    icon: '🔍',
    badge: { en: 'Inspection', hi: 'गुणवत्ता जांच', mr: 'गुणवत्ता तपासणी' },
    title: {
      en: 'Quality Assurance Inspection',
      hi: 'गुणवत्ता नियंत्रण निरीक्षण',
      mr: 'गुणवत्ता नियंत्रण तपासणी',
    },
    description: {
      en: 'Audit the piece for 6 key metrics: 1) Hardness & zero stickiness, 2) Micro-bubble clarity, 3) Smooth rounded edges, 4) Secure embedded decorations, 5) Even level thickness, 6) Dust-free crystal finish.',
      hi: 'उत्पाद की 6 मानकों पर जांच करें: 1) पूर्ण कठोरता व चिपचिपाहट का न होना, 2) बुलबुला-मुक्त स्पष्टता, 3) चिकने किनारे, 4) मजबूती से जड़े फूल, 5) समान मोटाई, 6) धूल-मुक्त शीशे जैसी चमक।',
      mr: 'वस्तूची 6 निकषांवर तपासणी करा: 1) पूर्ण कडकपणा व चिकटपणा नसणे, 2) बुडबुडे नसलेली पारदर्शकता, 3) गुळगुळीत कडा, 4) पक्के बसलेले घटक, 5) एकसारखी जाडी, 6) धूळमुक्त काचेसारखी चमक.',
    },
    proTip: {
      en: 'If back edges have minor imperfections, dome them with a micro-layer of clear UV resin for an ultra-glossy finish.',
      hi: 'यदि पीछे के किनारे हल्के खुरदुरे रह जाएं, तो उन पर साफ UV रेजिन की पतली परत चढ़ाकर धूप में सुखा लें।',
      mr: 'मागच्या बाजूला काही त्रुटी राहिल्यास त्यावर स्वच्छ UV रेझिनचा पातळ थर देऊन अल्ट्रा-ग्लॉसी फिनिश मिळवा.',
    },
  },
  {
    step: 12,
    icon: '💰',
    badge: { en: 'Quotation', hi: 'मूल्य व कोटेशन', mr: 'किंमत व कोटेशन' },
    title: {
      en: 'Packaging & Quotation Calculation (@Quote)',
      hi: 'पैकेजिंग और मूल्य कोटेशन (@Quote)',
      mr: 'पॅकेजिंग आणि किंमत कोटेशन (@Quote)',
    },
    description: {
      en: 'Calculate final price using the 12-Step Cost Equation: Total Price = (Materials + Crafting Labor + Packaging + Studio Overhead) × (1 + Profit Margin). Pack in custom gift boxes with care cards.',
      hi: '12-चरणीय मूल्य सूत्र का उपयोग करें: विक्रय मूल्य = (कच्चा माल + कारीगरी मजदूरी + पैकेजिंग + स्टूडियो खर्च) × (1 + लाभ मार्जिन)। उपहार बॉक्स और केयर कार्ड के साथ पैक करें।',
      mr: '12-टप्प्यांच्या किंमत सूत्राचा वापर करा: विक्री किंमत = (कच्चा माल + मजुरी + पॅकेजिंग + स्टुडिओ खर्च) × (1 + नफा मार्जिन). गिफ्ट बॉक्स आणि केअर कार्डसह पॅक करा.',
    },
    proTip: {
      en: 'Click "Open Quotation Calculator" to generate an itemized WhatsApp-ready client quote card instantly.',
      hi: '"कोटेशन कैलकुलेटर खोलें" पर क्लिक करके व्हाट्सएप पर ग्राहकों को भेजने योग्य कोटेशन कार्ड तुरंत तैयार करें।',
      mr: '"कोटेशन कॅल्क्युलेटर उघडा" वर क्लिक करून व्हॉट्सॲपवर पाठवण्यासाठी तयार असलेले कोटेशन कार्ड त्वरित मिळवा.',
    },
  },
];

export const Studio12StepGuideModal: React.FC = () => {
  const navigate = useNavigate();
  const { isGuideModalOpen, closeGuideModal } = useStudioNoteStore();
  const { language, setLanguage } = useVoiceStore();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!isGuideModalOpen) return null;

  const currentStep = PROCESS_STEPS[activeStepIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-poppins bg-art-300/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-art-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-3 sm:my-6"
        >
          {/* Header */}
          <div className="h-1 bg-gradient-to-r from-brand-600 via-rose-500 to-plum-600 shrink-0" />
          <div className="p-3.5 sm:p-6 border-b border-art-800 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 bg-art-950/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200 shadow-sm shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-art-300 truncate">
                  {language === 'hi'
                    ? '12-चरणीय रेजिन आर्ट स्टूडियो गाइड'
                    : language === 'mr'
                    ? '12-टप्प्यांचे रेझिन आर्ट स्टुडिओ मार्गदर्शक'
                    : '12-Step Resin Art Studio Process Guide'}
                </h3>
                <p className="text-[11px] sm:text-xs text-art-500 truncate">
                  {language === 'hi'
                    ? 'मानक संचालन प्रक्रिया और गुणवत्ता कार्यशाला ब्लूप्रिंट'
                    : language === 'mr'
                    ? 'प्रमाणित कार्यप्रणाली आणि कार्यशाळा गुणवत्ता ब्लूप्रिंट'
                    : 'Standard Operating Procedure & Workshop Quality Blueprint'}
                </p>
              </div>
            </div>

            {/* Language Switcher in Guide Modal */}
            <div className="flex items-center justify-between w-full xs:w-auto gap-2 shrink-0">
              <div className="flex items-center p-0.5 rounded-full bg-art-900 border border-art-800 text-[11px] font-bold">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    language === 'en' ? 'bg-brand-500 text-white shadow-xs' : 'text-art-400 hover:text-art-200 hover:bg-art-850'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    language === 'hi' ? 'bg-brand-500 text-white shadow-xs' : 'text-art-400 hover:text-art-200 hover:bg-art-850'
                  }`}
                >
                  हिं
                </button>
                <button
                  onClick={() => setLanguage('mr')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    language === 'mr' ? 'bg-brand-500 text-white shadow-xs' : 'text-art-400 hover:text-art-200 hover:bg-art-850'
                  }`}
                >
                  मरा
                </button>
              </div>

              <button
                onClick={closeGuideModal}
                className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 border border-art-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Step Bar */}
          <div className="px-3 sm:px-6 py-2 sm:py-3 bg-art-950/60 border-b border-art-800 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-1.5 shrink-0">
            {PROCESS_STEPS.map((step, idx) => (
              <button
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  idx === activeStepIndex
                    ? 'bg-brand-500 text-white shadow-sm'
                    : idx < activeStepIndex
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-art-500 hover:text-art-300'
                }`}
              >
                <span>{step.step}.</span>
                <span className="hidden sm:inline">{step.badge[language]}</span>
              </button>
            ))}
          </div>

          {/* Step Detail Body */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                  <span>
                    {language === 'hi'
                      ? `चरण ${currentStep.step} / 12`
                      : language === 'mr'
                      ? `टप्पा ${currentStep.step} / 12`
                      : `Step ${currentStep.step} of 12`}
                  </span>
                  <span>•</span>
                  <span>{currentStep.badge[language]}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-art-300 flex items-center gap-2 pt-1">
                  <span>{currentStep.icon}</span>
                  <span>{currentStep.title[language]}</span>
                </h2>
              </div>
            </div>

            {/* Main Instruction */}
            <div className="p-4 sm:p-5 rounded-2xl bg-art-950 border border-art-800 text-xs text-art-400 leading-relaxed space-y-2">
              <p className="font-medium text-art-300 text-xs sm:text-sm leading-relaxed">{currentStep.description[language]}</p>
            </div>

            {/* Pro Tip Callout */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {language === 'hi' ? 'स्टूडियो प्रो-टिप:' : language === 'mr' ? 'स्टुडिओ प्रो-टिप:' : 'Studio Pro-Tip:'}
                </span>
              </div>
              <p className="leading-relaxed">{currentStep.proTip[language]}</p>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-3.5 sm:p-6 border-t border-art-800 bg-white flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStepIndex === 0}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-art-800 text-xs font-bold text-art-400 hover:text-art-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'hi' ? 'पिछला' : language === 'mr' ? 'मागे' : 'Previous'}</span>
            </button>

            <div className="flex items-center justify-end gap-2 flex-1">
              {activeStepIndex === 4 && (
                <button
                  onClick={() => {
                    closeGuideModal();
                    navigate('/admin/resin-calculator');
                  }}
                  className="px-3 sm:px-4 py-2.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Timer className="w-3.5 h-3.5 text-brand-600" />
                  <span>
                    {language === 'hi' ? 'घोलने का टाइमर खोलें' : language === 'mr' ? 'ढवळण्याचा टायमर उघडा' : 'Open Stirring Timer'}
                  </span>
                </button>
              )}

              {activeStepIndex === 11 && (
                <button
                  onClick={() => {
                    closeGuideModal();
                    navigate('/admin/pricing-calculator');
                  }}
                  className="px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md glow-brand"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi'
                      ? 'कोटेशन खोलें'
                      : language === 'mr'
                      ? 'कोटेशन उघडा'
                      : 'Open Quote'}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  if (activeStepIndex === PROCESS_STEPS.length - 1) {
                    closeGuideModal();
                  } else {
                    setActiveStepIndex((prev) => Math.min(PROCESS_STEPS.length - 1, prev + 1));
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md glow-brand transition-all active:scale-95 flex-1 xs:flex-initial"
              >
                <span>
                  {activeStepIndex === PROCESS_STEPS.length - 1
                    ? language === 'hi' ? 'गाइड समाप्त करें' : language === 'mr' ? 'मार्गदर्शक पूर्ण करा' : 'Finish Guide'
                    : language === 'hi' ? 'अगला चरण' : language === 'mr' ? 'पुढील टप्पा' : 'Next Step'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
