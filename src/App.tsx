import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Map, 
  LayoutDashboard, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Loader2,
  Search,
  ArrowRight,
  FileText,
  User,
  History,
  Target,
  Zap,
  Activity,
  Bell,
  Check,
  X,
  Users,
  Award,
  Globe,
  TrendingUp,
  BarChart3,
  Mail,
  Phone,
  Star,
  StarHalf,
  UserCheck,
  ExternalLink,
  Upload,
  FileUp,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  Download,
  Link2,
  Paperclip,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeArticle, analyzeScholarshipMatch, generateRoadmapForGrant, generateArticleSuggestions, generateArticleTopics, verifyRoadmapStep, generateApplicationDocuments, verifyApplicationDocument } from './services/geminiService';

// --- Types ---
type View = 'dashboard' | 'article' | 'scholarship' | 'roadmap' | 'articles_db' | 'supervisors' | 'application' | 'chat';

interface ArticleFeedback {
  imradScore: number;
  feedback: {
    introduction: string;
    methods: string;
    results: string;
    discussion: string;
  };
  generalSuggestions: string[];
  accuracyCheck: string;
}

interface ArticleSuggestions {
  abstractUz: string;
  abstractRu: string;
  abstractEn: string;
  introduction: string;
  keywords: string[];
}

interface ArticleTopic {
  title: string;
  description: string;
}

interface SampleArticle {
  title: string;
  author: string;
  journal: string;
  field: string;
  link: string;
}

interface Supervisor {
  id: string;
  name: string;
  title: string;
  university: string;
  field: string;
  articlesCount: number;
  rating: number;
  reviewsCount: number;
  image: string;
  link: string;
  isUser?: boolean;
  requirements?: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'user' | 'supervisor';
  text: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'image' | 'link';
  fileData?: {
    name: string;
    size?: string;
    url?: string;
  };
  linkData?: {
    title: string;
    url: string;
  };
}

interface StudentRequest {
  id: string;
  name: string;
  university: string;
  topic: string;
  status: 'pending' | 'accepted' | 'declined';
  lastMessage?: string;
  timestamp: Date;
}

const SAMPLE_STUDENTS: StudentRequest[] = [
  { id: 'st1', name: 'Ali Valiyev', university: 'TATU', topic: 'Sun\'iy intellekt va ta\'lim', status: 'pending', lastMessage: 'Assalomu alaykum, maqola bo\'yicha yordam kerak edi', timestamp: new Date() },
  { id: 'st2', name: 'Malika Ergasheva', university: 'O\'zMU', topic: 'Kvant fizikasida yangi trendlar', status: 'pending', lastMessage: 'Kurs ishimni ko\'rib bera olasizmi?', timestamp: new Date() }
];

const SAMPLE_SUPERVISORS: Supervisor[] = [
  {
    id: 's1',
    name: "Karshibayev Jahongir Hazratkulovich",
    title: "Rektor, Biologiya fanlari doktori, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Biologiya",
    articlesCount: 65,
    rating: 4.9,
    reviewsCount: 142,
    image: "https://picsum.photos/seed/kjahongir/200/200",
    link: "#"
  },
  {
    id: 's2',
    name: "Qalandarov Aziz Abduqayumovich",
    title: "O'quv ishlari bo'yicha prorektor, Fizika-matematika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Fizika-matematika",
    articlesCount: 42,
    rating: 4.8,
    reviewsCount: 98,
    image: "https://picsum.photos/seed/qaziz/200/200",
    link: "#"
  },
  {
    id: 's3',
    name: "Mamatova Hilola Muhiddinovna",
    title: "1-prorektor, Pedagogika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 38,
    rating: 4.9,
    reviewsCount: 115,
    image: "https://picsum.photos/seed/mhilola/200/200",
    link: "#"
  },
  {
    id: 's4',
    name: "Ayaqulov Nurbek Abdug'appor o'g'li",
    title: "Prorektor, Filologiya fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Filologiya",
    articlesCount: 35,
    rating: 4.7,
    reviewsCount: 86,
    image: "https://picsum.photos/seed/anurbek/200/200",
    link: "#"
  },
  {
    id: 's5',
    name: "Komilov Jamoliddin Karimjonovich",
    title: "Fakultet dekani, Pedagogika fanlari nomzodi, Professor",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 72,
    rating: 4.9,
    reviewsCount: 164,
    image: "https://picsum.photos/seed/kjamol/200/200",
    link: "#"
  },
  {
    id: 's6',
    name: "Norqulov Shovkat Turgunbayevich",
    title: "Fakultet dekani, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 28,
    rating: 4.6,
    reviewsCount: 54,
    image: "https://picsum.photos/seed/nshovkat/200/200",
    link: "#"
  },
  {
    id: 's7',
    name: "Asatulloyev Abrorxon Asatulloyevich",
    title: "Bo'lim boshlig'i, Falsafa fanlari doktori, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Falsafa",
    articlesCount: 54,
    rating: 4.8,
    reviewsCount: 112,
    image: "https://picsum.photos/seed/asabror/200/200",
    link: "#"
  },
  {
    id: 's8',
    name: "Qulmamatov Sindorqul Ibragimovich",
    title: "Dotsent, Pedagogika fanlari nomzodi",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 46,
    rating: 4.7,
    reviewsCount: 89,
    image: "https://picsum.photos/seed/qsindor/200/200",
    link: "#"
  },
  {
    id: 's9',
    name: "Kurbanov Bahram Shukriyevich",
    title: "Kafedra mudiri, Filologiya fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Filologiya",
    articlesCount: 33,
    rating: 4.6,
    reviewsCount: 72,
    image: "https://picsum.photos/seed/kbahram/200/200",
    link: "#"
  },
  {
    id: 's10',
    name: "Saribayev Shuhrat Turdibekovich",
    title: "Kafedra mudiri, Pedagogika fanlari nomzodi, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 41,
    rating: 4.8,
    reviewsCount: 95,
    image: "https://picsum.photos/seed/sshuhrat/200/200",
    link: "#"
  },
  {
    id: 's11',
    name: "Niyozov Muhamad Bahronovich",
    title: "Kafedra mudiri, Pedagogika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 36,
    rating: 4.7,
    reviewsCount: 78,
    image: "https://picsum.photos/seed/nmuhamad/200/200",
    link: "#"
  },
  {
    id: 's12',
    name: "Saidkulov Nuriddin Akramkulovich",
    title: "Kafedra mudiri, Siyosiy fanlar bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Siyosatshunoslik",
    articlesCount: 34,
    rating: 4.8,
    reviewsCount: 82,
    image: "https://picsum.photos/seed/snuriddin/200/200",
    link: "#"
  },
  {
    id: 's13',
    name: "Yunusov Oybek Habibulloyevich",
    title: "Kafedra mudiri, Biologiya fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Biologiya",
    articlesCount: 39,
    rating: 4.7,
    reviewsCount: 88,
    image: "https://picsum.photos/seed/yoybek/200/200",
    link: "#"
  },
  {
    id: 's14',
    name: "Kurbanov Eldar Ermamatovich",
    title: "Kafedra mudiri, Siyosiy fanlari bo'yicha PhD",
    university: "Guliston davlat pedagogika instituti",
    field: "Siyosatshunoslik",
    articlesCount: 22,
    rating: 4.5,
    reviewsCount: 45,
    image: "https://picsum.photos/seed/keldar/200/200",
    link: "#"
  },
  {
    id: 's15',
    name: "Abdukadirova Nasiba Alimjanovna",
    title: "Kafedra mudiri, Pedagogika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 31,
    rating: 4.8,
    reviewsCount: 64,
    image: "https://picsum.photos/seed/anasiba/200/200",
    link: "#"
  },
  {
    id: 's16',
    name: "Normamatova Dilfuza Turdikulovna",
    title: "Dotsent v.b, Filologiya fanlari bo'yicha PhD",
    university: "Guliston davlat pedagogika instituti",
    field: "Filologiya",
    articlesCount: 25,
    rating: 4.7,
    reviewsCount: 52,
    image: "https://picsum.photos/seed/ndilfuza/200/200",
    link: "#"
  },
  {
    id: 's17',
    name: "Yuldasheva Mastona Muhubillayevna",
    title: "Dotsent v.b, Filologiya fanlari bo'yicha PhD",
    university: "Guliston davlat pedagogika instituti",
    field: "Filologiya",
    articlesCount: 24,
    rating: 4.6,
    reviewsCount: 48,
    image: "https://picsum.photos/seed/ymastona/200/200",
    link: "#"
  },
  {
    id: 's18',
    name: "Nurumbekova Yarkinay Anormatovna",
    title: "Kafedra mudiri, Pedagogika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 29,
    rating: 4.8,
    reviewsCount: 73,
    image: "https://picsum.photos/seed/nyarkinay/200/200",
    link: "#"
  },
  {
    id: 's19',
    name: "Jumaboyev Nabi Pardaboyevich",
    title: "Kafedra mudiri, Pedagogika fanlari bo'yicha PhD",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 21,
    rating: 4.5,
    reviewsCount: 39,
    image: "https://picsum.photos/seed/jnabi/200/200",
    link: "#"
  },
  {
    id: 's20',
    name: "Bolibekov Alisher Abdusalomovich",
    title: "Dotsent, Pedagogika fanlari nomzodi",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 43,
    rating: 4.8,
    reviewsCount: 92,
    image: "https://picsum.photos/seed/balisher/200/200",
    link: "#"
  },
  {
    id: 's21',
    name: "Faxriddinov Yoqubjon Abubakir o'g'li",
    title: "Boshqarma boshlig'i, Pedagogika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 37,
    rating: 4.7,
    reviewsCount: 68,
    image: "https://picsum.photos/seed/fyoqub/200/200",
    link: "#"
  },
  {
    id: 's22',
    name: "Samatova Dilrabo Yusufovna",
    title: "Bo'lim boshlig'i, Pedagogika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 34,
    rating: 4.9,
    reviewsCount: 81,
    image: "https://picsum.photos/seed/sdilrabo/200/200",
    link: "#"
  },
  {
    id: 's23',
    name: "Maxmudjonov Zafarjon Murodjon o'g'li",
    title: "Bo'lim boshlig'i, Biologiya fanlari PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Biologiya",
    articlesCount: 32,
    rating: 4.8,
    reviewsCount: 57,
    image: "https://picsum.photos/seed/mzafar/200/200",
    link: "#"
  },
  {
    id: 's24',
    name: "Boymatov Nuriddin Mirzaqulovits",
    title: "Bo'lim boshlig'i, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 26,
    rating: 4.6,
    reviewsCount: 42,
    image: "https://picsum.photos/seed/bnuriddin/200/200",
    link: "#"
  },
  {
    id: 's25',
    name: "Ergashov Boburjon Dexqonboyevich",
    title: "Bo'lim boshlig'i, Pedagogika fanlari bo'yicha PhD",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 23,
    rating: 4.7,
    reviewsCount: 38,
    image: "https://picsum.photos/seed/ebobur/200/200",
    link: "#"
  },
  {
    id: 's26',
    name: "Nasrullayev Elmurod Jumaboyevich",
    title: "Professori v.b, Filologiya fanlari doktori, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Filologiya",
    articlesCount: 52,
    rating: 4.9,
    reviewsCount: 104,
    image: "https://picsum.photos/seed/nelmurod/200/200",
    link: "#"
  },
  {
    id: 's31',
    name: "Elmuratova Dilrabo Muhammadovna",
    title: "Kafedra mudiri, Pedagogika fanlari bo'yicha PhD, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 33,
    rating: 4.8,
    reviewsCount: 76,
    image: "https://picsum.photos/seed/edilrabo/200/200",
    link: "#"
  },
  {
    id: 's36',
    name: "Ergashev Rustam Nadjimovich",
    title: "Professor v.b, Pedagogika fanlari nomzodi, Dotsent",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 68,
    rating: 4.9,
    reviewsCount: 135,
    image: "https://picsum.photos/seed/erustam/200/200",
    link: "#"
  },
  {
    id: 's40',
    name: "Djurayev Ikrom Nematovich",
    title: "Dotsent, Tarix fanlari bo'yicha PhD",
    university: "Guliston davlat pedagogika instituti",
    field: "Tarix",
    articlesCount: 30,
    rating: 4.7,
    reviewsCount: 58,
    image: "https://picsum.photos/seed/dikrom/200/200",
    link: "#"
  },
  {
    id: 's47',
    name: "Yuldashov Abrorjon Ubaydulloyevich",
    title: "Dotsent, Geografiya fanlari nomzodi",
    university: "Guliston davlat pedagogika instituti",
    field: "Geografiya",
    articlesCount: 44,
    rating: 4.8,
    reviewsCount: 87,
    image: "https://picsum.photos/seed/yabror/200/200",
    link: "#"
  },
  {
    id: 's49',
    name: "Kurbanov Baxrom",
    title: "Dotsent, Pedagogika fanlari nomzodi",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 51,
    rating: 4.7,
    reviewsCount: 94,
    image: "https://picsum.photos/seed/kbaxrom/200/200",
    link: "#"
  },
  {
    id: 's61',
    name: "Abdullayev Baxtiyor Abduraxmanovich",
    title: "Fakultet dekani, Pedagogika fanlari bo'yicha PhD",
    university: "Guliston davlat pedagogika instituti",
    field: "Pedagogika",
    articlesCount: 41,
    rating: 4.8,
    reviewsCount: 82,
    image: "https://picsum.photos/seed/abaxtiyor/200/200",
    link: "#"
  }
];

const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    title: "Ilmiy maqolalar to'plami",
    author: "Tahririyat",
    journal: "Sayxun axborotnomasi",
    field: "Iqtisodiyot va Texnika",
    link: "https://share.google/e6z6TqlGtJJiM4tk0"
  },
  {
    title: "Ilmiy maqolalar to'plami",
    author: "Tahririyat",
    journal: "Guliston axborotnomasi",
    field: "Filologiya va Pedagogika",
    link: "https://share.google/XRODCNOtkZKcpIFGd"
  },
  {
    title: "Elektron kutubxona",
    author: "Unilibrary",
    journal: "Unilibrary",
    field: "Barcha yo'nalishlar",
    link: "https://share.google/3T6r3k3FDDb1G5wdx"
  },
  {
    title: "Ilmiy anjumanlar portali",
    author: "Anjumanlar.uz",
    journal: "Anjumanlar.uz",
    field: "Konferensiyalar va Tezislar",
    link: "https://anjumanlar.uz/"
  },
  {
    title: "Xalqaro ilmiy ma'lumotlar bazasi",
    author: "Elsevier",
    journal: "Scopus.com",
    field: "Xalqaro Ilmiy Maqolalar",
    link: "https://share.google/2jDkoL4FISbwxbA65"
  },
  {
    title: "Xalqaro matematika jurnali",
    author: "Princeton University",
    journal: "Annals of Mathematics",
    field: "Matematika va Aniq fanlar",
    link: "https://annals.math.princenton.edu/?hl=uz"
  }
];

interface ScholarshipMatch {
  name: string;
  description: string;
  eligibility: string;
  deadline: string;
  matchScore?: number;
}

const SAMPLE_SCHOLARSHIPS: ScholarshipMatch[] = [
  {
    name: "O'zbekiston Respublikasi Prezidenti stipendiyasi",
    description: "Bakalavriatning bitiruvchi kursi va magistratura talabalariga mo'ljallangan eng yuqori darajali davlat stipendiyasi.",
    eligibility: "Bakalavriat bitiruvchi kursi va magistratura, GPA 4.8+, ilmiy maqolalar, IELTS 7.0+.",
    deadline: "Sentyabr-Oktyabr",
  },
  {
    name: "Navoiy nomli davlat stipendiyasi",
    description: "Gumanitar fanlar yo'nalishida tahsil olayotgan iqtidorli talabalar uchun.",
    eligibility: "Filologiya, jurnalistika va boshqa gumanitar sohalar, a'lo baholar, ijodiy yutuqlar.",
    deadline: "Sentyabr",
  },
  {
    name: "Islom Karimov nomli davlat stipendiyasi",
    description: "Barcha yo'nalishlar uchun (har bir OTMdan 1 nafardan talabaga) beriladigan nufuzli stipendiya.",
    eligibility: "Barcha yo'nalishlar, jamoat ishlarida faollik, a'lo o'qish va ilmiy izlanishlar.",
    deadline: "Sentyabr",
  },
  {
    name: "Bobur nomli davlat stipendiyasi",
    description: "Tarix va geografiya yo'nalishlari bo'yicha iqtidorli talabalar uchun.",
    eligibility: "Tarix va geografiya yo'nalishi talabalari, soha bo'yicha ilmiy maqolalar.",
    deadline: "Sentyabr",
  },
  {
    name: "Pahlavon Mahmud nomli davlat stipendiyasi",
    description: "Jismoniy tarbiya va sport yo'nalishi talabalari uchun.",
    eligibility: "Jismoniy tarbiya va sport yo'nalishi, sportdagi yutuqlar va a'lo o'qish.",
    deadline: "Sentyabr",
  },
  {
    name: "Ulug'bek nomli davlat stipendiyasi",
    description: "Tabiiy fanlar yo'nalishidagi iqtidorli talabalar uchun.",
    eligibility: "Matematika, fizika, kimyo va boshqa tabiiy fanlar, ilmiy izlanishlar.",
    deadline: "Sentyabr",
  },
  {
    name: "Beruniy nomidagi davlat stipendiyasi",
    description: "Texnika, informatika va aloqa yo'nalishlari talabalari uchun.",
    eligibility: "Texnika, informatika va aloqa yo'nalishlari, ixtirochilik va ilmiy ishlar.",
    deadline: "Sentyabr",
  },
  {
    name: "Ibn Sino nomidagi davlat stipendiyasi",
    description: "Tibbiyot va sog'liqni saqlash yo'nalishi talabalari uchun.",
    eligibility: "Tibbiyot va sog'liqni saqlash yo'nalishi, ilmiy va amaliy yutuqlar.",
    deadline: "Sentyabr",
  },
  {
    name: "Imom al-Buxoriy nomidagi davlat stipendiyasi",
    description: "Islomshunoslik yo'nalishida tahsil olayotgan talabalar uchun.",
    eligibility: "O'zbekiston xalqaro islom akademiyasi talabalari, soha bo'yicha bilimlar.",
    deadline: "Sentyabr",
  },
  {
    name: "Kamoliddin Behzod nomidagi davlat stipendiyasi",
    description: "Tasviriy va amaliy san'at hamda dizayn yo'nalishlari uchun.",
    eligibility: "Tasviriy va amaliy san'at, dizayn yo'nalishi talabalari, ijodiy ishlar.",
    deadline: "Sentyabr",
  },
  {
    name: "Xudoybergan Devonov nomidagi davlat stipendiyasi",
    description: "Kinematografiya va san'at yo'nalishlari talabalari uchun.",
    eligibility: "Kinematografiya va san'at yo'nalishlari, ijodiy yutuqlar.",
    deadline: "Sentyabr",
  },
  {
    name: "T.Qaipbergenov / I.Yusupov stipendiyasi",
    description: "Qoraqalpog'iston Respublikasi OTMlarida ta'lim olayotgan talabalar uchun.",
    eligibility: "Qoraqalpog'iston OTMlari talabalari, a'lo o'qish va ilmiy faollik.",
    deadline: "Sentyabr",
  },
  {
    name: "El-yurt umidi jamg'armasi",
    description: "Xorijiy nufuzli universitetlarda magistratura va doktorantura bosqichida o'qish uchun to'liq grant.",
    eligibility: "Top-300 OTM qabuli, IELTS 7.0+, soha bo'yicha ish tajribasi.",
    deadline: "Yilda 2 marta",
  },
  {
    name: "Stipendium Hungaricum (Vengriya)",
    description: "Vengriya hukumatining xalqaro talabalar uchun magistratura va doktorantura grantlari.",
    eligibility: "Bakalavr darajasi, IELTS 6.5+, motivatsion xat.",
    deadline: "Yanvar",
  },
  {
    name: "Turkiye Burslari (Turkiya)",
    description: "Turkiya universitetlarida magistratura va doktorantura uchun to'liq moliyalashtiriladigan grant.",
    eligibility: "GPA 75%+, IELTS/TOEFL (ixtiyoriy), yosh chegarasi (magistratura uchun 30 gacha).",
    deadline: "Fevral",
  },
  {
    name: "Erasmus+ Mundus Joint Masters",
    description: "Yevropaning bir nechta universitetlarida qo'shma magistratura dasturida o'qish uchun grant.",
    eligibility: "Bakalavr darajasi, IELTS 7.0+, yuqori akademik ko'rsatkichlar.",
    deadline: "Dekabr-Yanvar",
  }
];

interface RoadmapStep {
  id: string;
  step: string;
  action: string;
  timeframe: string;
  type: 'article' | 'document' | 'interview' | 'general';
  verificationPrompt: string;
  interviewQuestions?: string[];
  completed: boolean;
  verifying?: boolean;
  verificationResult?: {
    status: 'success' | 'needs_improvement';
    feedback: string;
    score: number;
  };
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: any }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [articleText, setArticleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [articleFeedback, setArticleFeedback] = useState<ArticleFeedback | null>(null);
  const [articleSuggestions, setArticleSuggestions] = useState<ArticleSuggestions | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [articleTopics, setArticleTopics] = useState<ArticleTopic[] | null>(null);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const [scholarshipMatches, setScholarshipMatches] = useState<ScholarshipMatch[]>(SAMPLE_SCHOLARSHIPS);
  const [selectedGrant, setSelectedGrant] = useState<ScholarshipMatch | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [applicationDocs, setApplicationDocs] = useState<any[]>([]);
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const [docVerificationInput, setDocVerificationInput] = useState<{ [key: string]: string }>({});
  const [docVerificationResults, setDocVerificationResults] = useState<{ [key: string]: any }>({});
  const [isVerifyingDoc, setIsVerifyingDoc] = useState<{ [key: string]: boolean }>({});
  const [isParsingFile, setIsParsingFile] = useState<{ [key: string]: boolean }>({});

  // Chat State
  const [activeChat, setActiveChat] = useState<Supervisor | null>(null);
  const [chatMessages, setChatMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState<{ title: string, content: string, type: 'imrad' | 'scholarship' | 'roadmap' } | null>(null);

  // Profile State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Kundalik eslatma', message: 'Bugun roadmapingizdagi "Maqola mavzusini tanlash" qadamini ko\'rib chiqdingizmi?', time: 'Hozir', read: false },
    { id: '2', title: 'Yangi imkoniyat', message: 'Sizning yo\'nalishingizga mos yangi grant e\'lon qilindi!', time: '2 soat oldin', read: true }
  ]);
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    university: '',
    fieldOfStudy: '',
    studyYear: '',
    languageLevel: '',
    gpa: '',
    articleCount: '',
    mainGoal: '',
    isSupervisor: false,
    scientificDegree: '',
    workAddress: '',
    supervisorRequirements: ''
  });

  const handleSendMessage = (textParam?: string, type: 'text' | 'file' | 'image' | 'link' = 'text', data?: any) => {
    const text = textParam || chatInput.trim();
    if (!activeChat || (!text && !data)) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      chatId: activeChat.id,
      sender: 'user',
      text: text || '',
      timestamp: new Date(),
      type,
      ...data
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));
    setChatInput('');

    // System creates a notification for the supervisor instead of replying
    const newNotification = {
      id: Date.now().toString(),
      title: 'Yangi xabar (Talabadan)',
      message: `${userProfile.fullName || 'Talaba'}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
      time: 'Hozir',
      read: false,
      recipientRole: 'supervisor'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleArticleAnalysis = async () => {
    if (!articleText.trim()) return;
    setIsAnalyzing(true);
    setArticleSuggestions(null);
    try {
      const result = await analyzeArticle(articleText);
      setArticleFeedback(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!articleText.trim()) return;
    setIsGeneratingSuggestions(true);
    try {
      const result = await generateArticleSuggestions(articleText);
      setArticleSuggestions(result);
    } catch (error) {
      console.error("Suggestions generation failed:", error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleGenerateTopics = async () => {
    if (!userProfile.fieldOfStudy) return;
    setIsGeneratingTopics(true);
    try {
      const result = await generateArticleTopics(userProfile.fieldOfStudy);
      setArticleTopics(result.topics);
    } catch (error) {
      console.error("Topics generation failed:", error);
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  React.useEffect(() => {
    if (currentView === 'article' && userProfile.fieldOfStudy && !articleTopics && !isGeneratingTopics) {
      handleGenerateTopics();
    }
    if (currentView === 'scholarship' && userProfile.fullName && !isSearching && scholarshipMatches.every(m => !m.matchScore)) {
      handleScholarshipSearch();
    }
  }, [currentView, userProfile.fieldOfStudy, userProfile.fullName]);

  const handleScholarshipSearch = async () => {
    const profileString = `
      Ism va Familiya: ${userProfile.fullName}
      OTM: ${userProfile.university}
      Yo'nalish: ${userProfile.fieldOfStudy}
      Kurs: ${userProfile.studyYear}
      Til darajasi: ${userProfile.languageLevel}
      GPA: ${userProfile.gpa}
      Maqolalar soni: ${userProfile.articleCount}
      Maqsad: ${userProfile.mainGoal}
    `;
    
    setIsSearching(true);
    try {
      const result = await analyzeScholarshipMatch(profileString);
      setScholarshipMatches(result.matches);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const [verificationInput, setVerificationInput] = useState<{ [key: string]: string }>({});

  const handleVerifyStep = async (stepId: string) => {
    if (!roadmap) return;
    const step = roadmap.find(s => s.id === stepId);
    const input = verificationInput[stepId];
    if (!step || !input) return;

    setRoadmap(prev => prev?.map(s => s.id === stepId ? { ...s, verifying: true } : s) || null);

    try {
      const context = `Grant: ${selectedGrant?.name}. Qadam: ${step.step}. Harakat: ${step.action}`;
      const result = await verifyRoadmapStep(step.type, input, context);
      
      setRoadmap(prev => prev?.map(s => {
        if (s.id === stepId) {
          return {
            ...s,
            verifying: false,
            completed: result.status === 'success',
            verificationResult: result
          };
        }
        return s;
      }) || null);
    } catch (error) {
      console.error("Verification failed:", error);
      setRoadmap(prev => prev?.map(s => s.id === stepId ? { ...s, verifying: false } : s) || null);
    }
  };
  const handleSelectGrant = async (grant: ScholarshipMatch) => {
    setSelectedGrant(grant);
    setIsGeneratingRoadmap(true);
    
    const profileString = `
      Ism va Familiya: ${userProfile.fullName}
      OTM: ${userProfile.university}
      Yo'nalish: ${userProfile.fieldOfStudy}
      Kurs: ${userProfile.studyYear}
      Til darajasi: ${userProfile.languageLevel}
      GPA: ${userProfile.gpa}
      Maqolalar soni: ${userProfile.articleCount}
      Maqsad: ${userProfile.mainGoal}
    `;

    try {
      const result = await generateRoadmapForGrant(profileString, grant.name);
      const enhancedRoadmap = result.roadmap.map((step: any, index: number) => ({
        ...step,
        id: `step-${index}`,
        completed: false,
        verifying: false
      }));
      setRoadmap(enhancedRoadmap);
      setCurrentView('roadmap');
    } catch (error) {
      console.error("Roadmap generation failed:", error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const handleGenerateApplicationDocs = async () => {
    if (!selectedGrant) return;
    setIsGeneratingDocs(true);
    try {
      const profileString = `
        Ism va Familiya: ${userProfile.fullName}
        OTM: ${userProfile.university}
        Yo'nalish: ${userProfile.fieldOfStudy}
        Kurs: ${userProfile.studyYear}
        Til darajasi: ${userProfile.languageLevel}
        GPA: ${userProfile.gpa}
        Maqolalar soni: ${userProfile.articleCount}
        Maqsad: ${userProfile.mainGoal}
      `;
      const result = await generateApplicationDocuments(profileString, selectedGrant.name);
      setApplicationDocs(result.documents);
    } catch (error) {
      console.error("Failed to generate docs:", error);
    } finally {
      setIsGeneratingDocs(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(prev => ({ ...prev, [docName]: true }));
    
    try {
      // For PDF and DOCX, we'll use a FileReader to get the content
      // Note: In a real environment with Node.js, we'd use pdf-parse/mammoth on the server.
      // Here we'll simulate the text extraction for the demo or use client-side logic if possible.
      // Since we can't easily run Node.js libs in the browser without a backend, 
      // we'll provide a clear message and handle the file as text for now, 
      // or use a simple FileReader for text-based files.
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        setDocVerificationInput(prev => ({ ...prev, [docName]: text }));
        setIsParsingFile(prev => ({ ...prev, [docName]: false }));
        
        setNotifications(prev => [
          { 
            id: Date.now().toString(), 
            title: 'Fayl yuklandi', 
            message: `"${file.name}" muvaffaqiyatli yuklandi va matni ajratib olindi.`, 
            time: 'Hozir', 
            read: false 
          },
          ...prev
        ]);
      };

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // PDF parsing simulation for the demo
        setTimeout(() => {
          setDocVerificationInput(prev => ({ ...prev, [docName]: `[PDF FAYL: ${file.name}]\nUshbu fayl mazmuni tahlil uchun tayyor.` }));
          setIsParsingFile(prev => ({ ...prev, [docName]: false }));
        }, 1500);
      } else if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
        // DOC simulation
        setTimeout(() => {
          setDocVerificationInput(prev => ({ ...prev, [docName]: `[DOC FAYL: ${file.name}]\nUshbu hujjat mazmuni tahlil uchun tayyor.` }));
          setIsParsingFile(prev => ({ ...prev, [docName]: false }));
        }, 1500);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      setIsParsingFile(prev => ({ ...prev, [docName]: false }));
    }
  };

  const handleVerifyDoc = async (docName: string) => {
    const content = docVerificationInput[docName];
    if (!content || !selectedGrant) return;

    setIsVerifyingDoc(prev => ({ ...prev, [docName]: true }));
    try {
      const result = await verifyApplicationDocument(docName, content, selectedGrant.name);
      setDocVerificationResults(prev => ({ ...prev, [docName]: result }));
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsVerifyingDoc(prev => ({ ...prev, [docName]: false }));
    }
  };

  React.useEffect(() => {
    if (currentView === 'application' && selectedGrant && applicationDocs.length === 0 && !isGeneratingDocs) {
      handleGenerateApplicationDocs();
    }
  }, [currentView, selectedGrant]);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileModalOpen(false);
    
    // Automatically trigger analysis upon activation/update
    if (userProfile.fieldOfStudy) {
      handleScholarshipSearch();
      handleGenerateTopics();
      
      setNotifications(prev => [
        { 
          id: Date.now().toString(), 
          title: 'Profil tahlil qilinmoqda', 
          message: 'Sizning ma\'lumotlaringiz asosida mos grantlar va maqola mavzulari saralanmoqda.', 
          time: 'Hozir', 
          read: false 
        },
        ...prev
      ]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-teal-900">CampusMind</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Asosiy" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Maqola Yordamchisi" 
            active={currentView === 'article'} 
            onClick={() => setCurrentView('article')} 
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Maqolalar Bazasi" 
            active={currentView === 'articles_db'} 
            onClick={() => setCurrentView('articles_db')} 
          />
          <SidebarItem 
            icon={UserCheck} 
            label="Ilmiy Rahbarlar" 
            active={currentView === 'supervisors'} 
            onClick={() => setCurrentView('supervisors')} 
          />
          <SidebarItem 
            icon={GraduationCap} 
            label="Grant va Stipendiyalar" 
            active={currentView === 'scholarship'} 
            onClick={() => setCurrentView('scholarship')} 
          />
          <SidebarItem 
            icon={Send} 
            label="Ariza Yaratish" 
            active={currentView === 'application'} 
            onClick={() => setCurrentView('application')} 
          />
          <SidebarItem 
            icon={Map} 
            label="Mening Roadmapim" 
            active={currentView === 'roadmap'} 
            onClick={() => setCurrentView('roadmap')} 
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="Chat" 
            active={currentView === 'chat'} 
            onClick={() => setCurrentView('chat')} 
          />
        </nav>

        <div className="mt-auto p-4 bg-teal-50 rounded-2xl">
          <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-2">Profil</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center text-teal-700">
              <User size={16} />
            </div>
            <div className="overflow-hidden text-ellipsis">
              <p className="text-sm font-medium truncate">{userProfile.fullName || 'Talaba'}</p>
              <p className="text-[10px] text-teal-400 truncate">muniraturdiyeva06@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm font-medium">
              {currentView === 'dashboard' ? 'Asosiy' : 
               currentView === 'article' ? 'Maqola Yordamchisi' : 
               currentView === 'articles_db' ? 'Maqolalar Bazasi' :
               currentView === 'supervisors' ? 'Ilmiy Rahbarlar' :
               currentView === 'scholarship' ? 'Grant va Stipendiyalar' : 'Roadmap'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Bell size={20} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <User size={18} className="text-teal-600" />
              Shaxsiy kabinet
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto space-y-12 relative"
              >
                {/* Background Image Decoration */}
                <div className="absolute -top-12 -left-12 -right-12 h-96 overflow-hidden rounded-[3rem] -z-10 opacity-15">
                  <img 
                    src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1920" 
                    alt="University campus" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-slate-50/50 to-slate-50" />
                </div>

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900">Xush kelibsiz, {userProfile.fullName || 'Talaba'}! 👋</h2>
                    <p className="text-slate-500 mt-2 text-lg">CampusMind — akademik yutuqlar sari sizning yo'lboshchingiz.</p>
                  </div>
                  {userProfile.fieldOfStudy && (
                    <div className="px-4 py-2 bg-teal-50 border border-teal-100 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Yo'nalish</p>
                        <p className="text-sm font-bold text-slate-900">{userProfile.fieldOfStudy}</p>
                      </div>
                    </div>
                  )}
                </header>

                {userProfile.isSupervisor && (
                  <motion.section 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                    <div className="lg:col-span-4 mb-2">
                       <h3 className="text-2xl font-black flex items-center gap-2">
                         <ShieldCheck size={28} className="text-teal-400" />
                         Ilmiy Rahbar Paneli
                       </h3>
                       <p className="text-slate-400 text-sm">Talabalar va ilmiy faoliyatingizni shu yerdan boshqaring.</p>
                    </div>

                    <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 text-white">
                      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Shogirdlar</p>
                      <h4 className="text-3xl font-black">12 ta</h4>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><TrendingUp size={12} /> +2 shu oyda</p>
                    </Card>

                    <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 text-white">
                      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Mavjud mavzular</p>
                      <h4 className="text-3xl font-black">5 ta</h4>
                      <p className="text-xs text-slate-400 mt-2">Suhbat mavzulari</p>
                    </Card>

                    <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 text-white">
                      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Yangi xabarlar</p>
                      <h4 className="text-3xl font-black">8 ta</h4>
                      <button 
                        onClick={() => setCurrentView('chat')}
                        className="text-[10px] font-bold bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-lg mt-3 transition-all"
                      >
                        Xabarlarga o'tish
                      </button>
                    </Card>

                    <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 text-white">
                      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Hujjatlar tahlili</p>
                      <h4 className="text-3xl font-black">3 ta</h4>
                      <p className="text-xs text-slate-400 mt-2">Yangilanish kutilmoqda</p>
                    </Card>

                    <div className="lg:col-span-4 mt-4 space-y-4">
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        <Users size={18} className="text-teal-400" />
                        Kelib tushgan so'rovlar (Shogirdlik so'rovlari)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SAMPLE_STUDENTS.map(st => (
                          <div key={st.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 flex flex-col gap-2 hover:bg-white/15 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-white">{st.name}</p>
                                <p className="text-[10px] text-slate-400">{st.university}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${st.status === 'pending' ? 'bg-amber-400 text-amber-900' : 'bg-emerald-500 text-white'}`}>
                                {st.status === 'pending' ? 'Kutilmoqda' : 'Qabul qilingan'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 italic">"{st.lastMessage}"</p>
                            <div className="flex gap-2 mt-2">
                              <button 
                                onClick={() => { setActiveChat({ id: st.id, name: st.name, title: st.topic, university: st.university, field: st.topic }); setCurrentView('chat'); }}
                                className="flex-1 py-2 bg-teal-600 text-white text-[10px] font-bold rounded-lg hover:bg-teal-500"
                              >
                                Javob yozish
                              </button>
                              <button className="flex-1 py-2 bg-white/10 text-white text-[10px] font-bold rounded-lg hover:bg-white/20">
                                Rad etish
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                )}

                {/* Personalized Insights Section */}
                {userProfile.fieldOfStudy && (
                  <div className="space-y-8">
                    <motion.section 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      <Card className="p-6 bg-gradient-to-br from-teal-600 to-teal-800 text-white border-none shadow-xl shadow-teal-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                            <Target size={24} />
                          </div>
                          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                            Analiz
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-1">Grantlar bilan moslik</h3>
                        <p className="text-teal-100 text-sm mb-4">{userProfile.fieldOfStudy} yo'nalishi bo'yicha tahlil</p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black">
                            {isSearching ? '...' : scholarshipMatches.find(m => m.matchScore)?.matchScore || '0%'}
                          </span>
                          <span className="text-teal-200 text-sm mb-1 font-medium">eng yuqori ko'rsatkich</span>
                        </div>
                        <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-white h-full rounded-full transition-all duration-1000" 
                            style={{ width: isSearching ? '30%' : `${scholarshipMatches.find(m => m.matchScore)?.matchScore || 0}%` }} 
                          />
                        </div>
                      </Card>

                      <Card className="p-6 bg-white border-slate-200 hover:border-teal-300 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Zap size={24} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tavsiya</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Keyingi qadam</h3>
                        <p className="text-slate-500 text-sm mb-4">Sizning maqsadingiz: {userProfile.mainGoal}</p>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-700">Tavsiya etilgan harakat:</p>
                          <p className="text-sm text-teal-600 font-medium mt-1">
                            {userProfile.mainGoal === 'Maqola yozish' 
                              ? 'Tavsiya etilgan mavzulardan birini tanlang' 
                              : userProfile.mainGoal === 'Nomdor stipendiya grantlar yutish'
                              ? 'Eng yuqori moslikdagi grantni ko\'rib chiqing'
                              : 'Yutuqlaringizni portfolioga qo\'shing'}
                          </p>
                        </div>
                      </Card>

                      <Card className="p-6 bg-white border-slate-200 hover:border-teal-300 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Activity size={24} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statistika</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Ma'lumotlar holati</h3>
                        <p className="text-slate-500 text-sm mb-4">Tizim tahlili</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Mavzular</span>
                              <span>{articleTopics?.length || 0} ta</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-500 h-full rounded-full" style={{ width: articleTopics ? '100%' : '0%' }} />
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Grantlar</span>
                              <span>{scholarshipMatches.filter(m => m.matchScore).length} ta</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: scholarshipMatches.some(m => m.matchScore) ? '100%' : '0%' }} />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.section>

                    {/* New Recommendations Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <section className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                          <Zap size={20} className="text-amber-500" />
                          Siz uchun mos maqola mavzulari
                        </h3>
                        <Card className="p-6 bg-white border-slate-200 overflow-hidden relative">
                          {isGeneratingTopics && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                              <Loader2 className="animate-spin text-teal-600" size={32} />
                              <p className="text-sm font-bold text-slate-600">Mavzular shakllantirilmoqda...</p>
                            </div>
                          )}
                          {!articleTopics && !isGeneratingTopics && (
                            <div className="text-center py-8">
                              <p className="text-slate-400 text-sm">Mavzularni ko'rish uchun profilni to'ldiring.</p>
                            </div>
                          )}
                          <div className="space-y-4">
                            {articleTopics?.slice(0, 3).map((topic, i) => (
                              <div 
                                key={i}
                                onClick={() => {
                                  setSelectedTopic(topic.title);
                                  setCurrentView('article');
                                }}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all cursor-pointer group"
                              >
                                <h4 className="font-bold text-slate-900 group-hover:text-teal-700 mb-1">{topic.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2">{topic.description}</p>
                              </div>
                            ))}
                            {articleTopics && (
                              <button 
                                onClick={() => setCurrentView('article')}
                                className="w-full py-2 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                              >
                                Barcha mavzularni ko'rish
                              </button>
                            )}
                          </div>
                        </Card>
                      </section>

                      <section className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                          <GraduationCap size={20} className="text-teal-600" />
                          Siz uchun eng mos grantlar
                        </h3>
                        <Card className="p-6 bg-white border-slate-200 overflow-hidden relative">
                          {isSearching && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                              <Loader2 className="animate-spin text-teal-600" size={32} />
                              <p className="text-sm font-bold text-slate-600">Grantlar saralanmoqda...</p>
                            </div>
                          )}
                          {!scholarshipMatches.some(m => m.matchScore) && !isSearching && (
                            <div className="text-center py-8">
                              <p className="text-slate-400 text-sm">Grantlarni ko'rish uchun profilni to'ldiring.</p>
                            </div>
                          )}
                          <div className="space-y-4">
                            {scholarshipMatches
                              .filter(m => m.matchScore)
                              .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                              .slice(0, 3)
                              .map((grant, i) => (
                                <div 
                                  key={i}
                                  onClick={() => {
                                    setSelectedGrant(grant);
                                    setCurrentView('scholarship');
                                  }}
                                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all cursor-pointer group flex justify-between items-center"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 group-hover:text-teal-700 mb-1">{grant.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Muddati: {grant.deadline}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-black text-teal-600">{grant.matchScore}%</span>
                                    <p className="text-[10px] font-bold text-slate-400">MOSLIK</p>
                                  </div>
                                </div>
                              ))}
                            {scholarshipMatches.some(m => m.matchScore) && (
                              <button 
                                onClick={() => setCurrentView('scholarship')}
                                className="w-full py-2 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                              >
                                Barcha grantlarni ko'rish
                              </button>
                            )}
                          </div>
                        </Card>
                      </section>
                    </div>
                  </div>
                )}

                {/* Information Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* IMRAD Requirements */}
                  <section className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                      <FileText size={24} className="text-teal-600" />
                      IMRAD Standartlari
                    </h3>
                    <Card className="p-6 bg-white">
                      <div className="space-y-4">
                        {[
                          { 
                            title: "Introduction (Kirish)", 
                            desc: "Muammoning dolzarbligi, tadqiqot maqsadi va ilmiy yangiligini asoslang.",
                            todo: "1. Mavzuning dolzarbligini statistik ma'lumotlar bilan ko'rsating. 2. Tadqiqot ob'ekti va predmetini aniqlang. 3. Tadqiqot savollari yoki gipotezalarni shakllantiring."
                          },
                          { 
                            title: "Methods (Metodlar)", 
                            desc: "Tadqiqot usullari, ma'lumotlar yig'ish va tahlil qilish jarayonini batafsil yoritib bering.",
                            todo: "1. Tanlangan metodologiyani (miqdoriy yoki sifat) asoslang. 2. Ma'lumotlar manbasini (so'rovnoma, intervyu, arxiv) ko'rsating. 3. Tahlil qilish vositalarini (SPSS, Python, Stata) sanab o'ting."
                          },
                          { 
                            title: "Results (Natijalar)", 
                            desc: "Olingan natijalarni xolis, aniq va tushunarli tarzda (jadval, grafiklar yordamida) taqdim eting.",
                            todo: "1. Olingan asosiy raqamlarni jadval yoki diagrammalarda aks ettiring. 2. Natijalarni sharhlamasdan, faqat faktlarni keltiring. 3. Tadqiqot savollari va gipotezalarga berilgan javoblarni xulosalang."
                          },
                          { 
                            title: "Discussion (Muhokama)", 
                            desc: "Natijalarni boshqa olimlar ishlari bilan solishtiring va ularning amaliy ahamiyatini tushuntiring.",
                            todo: "1. Olingan natijalarni mavjud nazariyalar bilan bog'lang. 2. Tadqiqotning cheklovlarini ko'rsating. 3. Kelajakdagi tadqiqotlar uchun tavsiyalar bering."
                          }
                        ].map((item, i) => (
                          <div 
                            key={i} 
                            onClick={() => setSelectedDetail({ title: item.title, content: item.todo, type: 'imrad' })}
                            className="flex gap-4 p-3 rounded-xl hover:bg-teal-50 transition-all cursor-pointer border border-transparent hover:border-teal-100 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                              {item.title[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 group-hover:text-teal-700">{item.title}</h4>
                              <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>

                  {/* Prestigious Scholarships */}
                  <section className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                      <GraduationCap size={24} className="text-teal-600" />
                      Nomdor Stipendiyalar
                    </h3>
                    <Card className="p-6">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: 'Prezident stipendiyasi', info: 'Bakalavriatning oxirgi ikki bosqichida o\'qiydigan, a\'lo baholarga ega va ilmiy ishlari bor talabalar uchun.' },
                          { name: 'Navoiy stipendiyasi', info: 'Gumanitar yo\'nalishdagi talabalar uchun eng nufuzli davlat stipendiyalaridan biri.' },
                          { name: 'Beruniy stipendiyasi', info: 'Aniq va tabiiy fanlar, texnika yo\'nalishlari bo\'yicha a\'lochi talabalar uchun.' },
                          { name: 'Ulug\'bek stipendiyasi', info: 'Matematika, fizika va astronomiya yo\'nalishlarida yutuqlarga erishgan talabalar uchun.' },
                          { name: 'Ibn Sino stipendiyasi', info: 'Tibbiyot va farmatsevtika yo\'nalishidagi iqtidorli talabalar uchun.' },
                          { name: 'Islom Karimov stipendiyasi', info: 'Ijtimoiy-gumanitar va iqtisodiy yo\'nalishlar bo\'yicha beriladigan stipendiya.' },
                          { name: 'Zulfiya mukofoti', info: 'Adabiyot, san\'at, fan, ta\'lim va madaniyat sohalarida yutuqqa erishgan qizlar uchun.' },
                          { name: 'Mard o\'g\'lon mukofoti', info: 'Vatanparvarlik, mardlik va fidoyilik ko\'rsatgan yigitlar uchun davlat mukofoti.' },
                          { name: 'El-yurt umidi', info: 'Xorijiy nufuzli universitetlarda magistratura va doktoranturada o\'qish uchun to\'liq grant.' },
                          { name: 'Erasmus+', info: 'Yevropa Ittifoqi tomonidan moliyalashtiriladigan talabalar almashinuvi dasturi.' },
                          { name: 'Fulbright', info: 'AQSHda magistratura bosqichida o\'qish uchun to\'liq moliyalashtiriladigan grant.' },
                          { name: 'DAAD', info: 'Germaniyada o\'qish va tadqiqot olib borish uchun nemis akademik almashinuv xizmati granti.' }
                        ].map((item, i) => (
                          <div 
                            key={i} 
                            onClick={() => setSelectedDetail({ title: item.name, content: item.info, type: 'scholarship' })}
                            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-all border border-transparent hover:border-teal-100"
                          >
                            <CheckCircle2 size={14} className="text-teal-500" />
                            {item.name}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <a 
                          href="https://lex.uz/docs/-6569633" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-3 bg-teal-50 text-teal-700 rounded-xl font-bold hover:bg-teal-100 transition-all text-sm"
                        >
                          <Search size={16} />
                          Grantlar haqidagi Nizom (lex.uz)
                        </a>
                      </div>
                    </Card>
                  </section>
                </div>

                {/* Roadmap Examples */}
                <section className="space-y-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <Map size={24} className="text-teal-600" />
                    Roadmap Namunalari
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: 'Prezident stipendiyasi',
                        steps: ['GPA 4.8+', '2 ta ilmiy maqola', 'IELTS 7.0+', 'Konferensiya ishtiroki'],
                        detail: 'Ushbu roadmap Prezident stipendiyasiga da\'vogar talabalar uchun ishlab chiqilgan. Asosiy e\'tibor a\'lo baholar va ilmiy faoliyatga qaratiladi.'
                      },
                      {
                        title: 'Xalqaro Maqola (Scopus)',
                        steps: ['Mavzu tanlash', 'Adabiyotlar tahlili', 'IMRAD asosida yozish', 'Jurnalga yuborish'],
                        detail: 'Scopus bazasidagi jurnallarda maqola chiqarish uchun kamida 6 oy vaqt va sifatli tadqiqot talab etiladi.'
                      },
                      {
                        title: 'El-yurt umidi (Magistratura)',
                        steps: ['Top-300 OTM qabuli', 'IELTS/TOEFL sertifikati', 'Insho yozish', 'Suhbatdan o\'tish'],
                        detail: 'Chet elda o\'qishni maqsad qilganlar uchun moliyaviy yordam beruvchi eng yirik davlat jamg\'armasi.'
                      }
                    ].map((example, i) => (
                      <Card 
                        key={i} 
                        onClick={() => setSelectedDetail({ title: example.title, content: example.detail, type: 'roadmap' })}
                        className="p-5 border-t-4 border-t-amber-400 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                      >
                        <h4 className="font-bold text-slate-900 mb-4">{example.title}</h4>
                        <div className="space-y-3">
                          {example.steps.map((step, si) => (
                            <div key={si} className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">
                                {si + 1}
                              </div>
                              {step}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* Contact Section */}
                <section className="pt-12 pb-8 border-t border-slate-200/60 relative">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900">Biz bilan bog'laning</h3>
                      <p className="text-slate-500">Savollaringiz yoki takliflaringiz bormi? Biz doimo yordamga tayyormiz.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                      <a href="tel:+998504441105" className="block group">
                        <Card className="p-6 bg-white/60 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all h-full cursor-pointer">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Phone size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Telefon</p>
                              <p className="text-lg font-bold text-slate-900">+998 50 444 11 05</p>
                            </div>
                          </div>
                        </Card>
                      </a>

                      <a href="https://t.me/bakhtiyarovna_munira" target="_blank" rel="noopener noreferrer" className="block group">
                        <Card className="p-6 bg-white/60 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all h-full cursor-pointer">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Send size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Telegram</p>
                              <p className="text-lg font-bold text-slate-900">@bakhtiyarovna_munira</p>
                            </div>
                          </div>
                        </Card>
                      </a>

                      <a href="mailto:muniraturdiyeva06@gmail.com" className="block group">
                        <Card className="p-6 bg-white/60 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all h-full cursor-pointer">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Mail size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                              <p className="text-lg font-bold text-slate-900">muniraturdiyeva06@gmail.com</p>
                            </div>
                          </div>
                        </Card>
                      </a>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {currentView === 'article' && (
            <motion.div
              key="article"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-[calc(100vh-120px)] flex flex-col gap-6"
            >
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Maqola Ishchi Maydoni</h2>
                  <p className="text-slate-500 text-sm">Mavzu, tahlil va manbalar bilan ishlash uchun yaxlit muhit.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setArticleText('');
                      setArticleFeedback(null);
                      setArticleSuggestions(null);
                      setSelectedTopic(null);
                    }}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-sm"
                  >
                    Tozalash
                  </button>
                  <button 
                    onClick={handleArticleAnalysis}
                    disabled={isAnalyzing || !articleText.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-teal-100 text-sm"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    Tahlil qilish
                  </button>
                </div>
              </header>

              {/* Split Screen Workspace */}
              <div className="flex-1 flex gap-4 overflow-hidden">
                
                {/* Column 1: Editor & Topics */}
                <div className="flex-1 flex flex-col gap-4 min-w-[320px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FileText size={18} className="text-teal-600" />
                      Maqola Muharriri
                    </h3>
                    {selectedTopic && (
                      <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                        Mavzu tanlangan
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    {/* Topic Suggestions - Compact Version */}
                    {!articleText && !articleFeedback && userProfile.fieldOfStudy && (
                      <div className="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                            <Zap size={14} className="text-amber-500" />
                            Tavsiya etilgan mavzular
                          </h4>
                        </div>
                        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                          {articleTopics ? (
                            articleTopics.map((topic, i) => (
                              <button 
                                key={i} 
                                onClick={() => {
                                  setSelectedTopic(topic.title);
                                  setArticleText(`Mavzu: ${topic.title}\n\n${topic.description}\n\n`);
                                }}
                                className={`text-left p-2 rounded-lg border transition-all text-[10px] ${selectedTopic === topic.title ? 'border-teal-500 bg-white shadow-sm' : 'border-slate-200 bg-white/50 hover:border-teal-300'}`}
                              >
                                <p className="font-bold text-slate-900 truncate">{topic.title}</p>
                              </button>
                            ))
                          ) : (
                            <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                          )}
                        </div>
                      </div>
                    )}

                    <textarea
                      value={articleText}
                      onChange={(e) => setArticleText(e.target.value)}
                      placeholder={selectedTopic ? "[Maqolangizni shu yerdan davom ettiring...]" : "Maqola matnini bu yerga yozing..."}
                      className="flex-1 w-full p-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none resize-none bg-slate-50/30 text-slate-700 leading-relaxed text-sm"
                    />
                  </div>
                </div>

                {/* Column 2: Analysis Results */}
                <div className="flex-1 flex flex-col gap-4 min-w-[320px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Activity size={18} className="text-teal-600" />
                      AI Tahlil va Natijalar
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {!articleFeedback && !isAnalyzing && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <Activity size={48} className="text-slate-300 mb-4" />
                        <p className="text-sm font-medium text-slate-500">Tahlil natijalari bu yerda ko'rinadi</p>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <Loader2 className="animate-spin text-teal-600 mb-4" size={40} />
                        <p className="text-sm font-bold text-slate-900">AI tahlil qilmoqda...</p>
                      </div>
                    )}

                    {articleFeedback && (
                      <div className="space-y-4">
                        <div className="p-4 bg-teal-600 rounded-2xl text-white shadow-lg shadow-teal-100 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">IMRAD Score</p>
                            <h4 className="text-3xl font-black">{articleFeedback.imradScore}%</h4>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-black">
                            {articleFeedback.imradScore > 85 ? 'A+' : 'B'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(articleFeedback.feedback).map(([key, value]) => (
                            <div key={key} className="p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                              <h5 className="font-bold text-teal-700 uppercase text-[8px] tracking-widest mb-1 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-teal-500" />
                                {key}
                              </h5>
                              <p className="text-[11px] text-slate-700 leading-relaxed">{value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                          <h5 className="font-bold text-amber-800 text-[10px] flex items-center gap-1.5 mb-2">
                            <AlertCircle size={12} />
                            Tavsiyalar
                          </h5>
                          <ul className="space-y-1">
                            {articleFeedback.generalSuggestions.map((s, i) => (
                              <li key={i} className="text-[10px] text-amber-900 flex gap-2">
                                <span className="text-amber-400">•</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2">
                          {!articleSuggestions ? (
                            <button 
                              onClick={handleGenerateSuggestions}
                              disabled={isGeneratingSuggestions}
                              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs shadow-md disabled:opacity-50"
                            >
                              {isGeneratingSuggestions ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} className="text-amber-400" />}
                              AI Yordam (Annotatsiya/Kirish)
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <div className="p-4 rounded-2xl border border-teal-100 bg-white shadow-sm">
                                <h5 className="font-bold text-slate-900 flex items-center gap-2 mb-3 text-xs">
                                  <Globe size={16} className="text-teal-600" />
                                  Annotatsiya
                                </h5>
                                <div className="space-y-2">
                                  {['UZ', 'RU', 'EN'].map((lang, idx) => (
                                    <div key={lang} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                      <p className="text-[8px] font-bold text-slate-400 mb-0.5">{lang}</p>
                                      <p className="text-[10px] text-slate-700 italic line-clamp-3">
                                        "{idx === 0 ? articleSuggestions.abstractUz : idx === 1 ? articleSuggestions.abstractRu : articleSuggestions.abstractEn}"
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {articleSuggestions.keywords.map((kw, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[9px] font-bold rounded-md border border-teal-100">
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 3: Sources (Manbalar) */}
                {userProfile.fieldOfStudy && (
                  <div className="w-72 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <BookOpen size={18} className="text-teal-600" />
                        Manbalar
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      <div className="space-y-2">
                        {[
                          { name: "Google Scholar", url: "https://scholar.google.com" },
                          { name: "ResearchGate", url: "https://www.researchgate.net" },
                          { name: "ScienceDirect", url: "https://www.sciencedirect.com" },
                          { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org" },
                          { name: "SpringerLink", url: "https://link.springer.com" },
                          { name: "Unilibrary", url: "https://unilibrary.uz" }
                        ].map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-2.5 rounded-xl border border-slate-50 hover:border-teal-200 hover:bg-teal-50/30 transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-[11px] font-bold text-slate-800 group-hover:text-teal-700">{source.name}</h4>
                              <ExternalLink size={10} className="text-slate-300 group-hover:text-teal-500" />
                            </div>
                            <p className="text-[9px] text-teal-600 mt-0.5 truncate">{source.url}</p>
                          </a>
                        ))}
                      </div>
                      <div className="mt-6 p-3 bg-slate-50 rounded-xl text-[9px] text-slate-400 italic">
                        Ilmiy manbalardan foydalanishda iqtibos keltirishni unutmang.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'articles_db' && (
            <motion.div
              key="articles_db"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <header className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900">Maqolalar va Jurnallar Bazasi</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                  Mahalliy va xalqaro nufuzli ilmiy jurnallar hamda maqolalar bazasi.
                </p>
                {userProfile.fieldOfStudy && (
                  <div className="inline-block px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-bold border border-teal-100">
                    Sizning yo'nalishingizga moslangan: {userProfile.fieldOfStudy}
                  </div>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_ARTICLES
                  .filter(article => 
                    !userProfile.fieldOfStudy || 
                    article.field.toLowerCase().includes(userProfile.fieldOfStudy.toLowerCase()) ||
                    userProfile.fieldOfStudy.toLowerCase().includes(article.field.toLowerCase())
                  )
                  .map((article, i) => (
                    <Card key={i} className="p-6 hover:shadow-xl transition-all group border border-slate-100 bg-white shadow-sm hover:-translate-y-1">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                            <BookOpen size={20} />
                          </div>
                          <div className="px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded uppercase tracking-wider">
                            ILMIY MANBA
                          </div>
                        </div>
                        
                        <h4 className="text-xl font-black text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">
                          {article.journal}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                          {article.field}
                        </p>

                        <div className="mt-auto space-y-3">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Tavsif</p>
                            <p className="text-xs text-slate-600 line-clamp-2 font-medium">{article.title}</p>
                          </div>
                          <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                          >
                            Saytga o'tish
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
              
              {SAMPLE_ARTICLES.filter(article => 
                !userProfile.fieldOfStudy || 
                article.field.toLowerCase().includes(userProfile.fieldOfStudy.toLowerCase()) ||
                userProfile.fieldOfStudy.toLowerCase().includes(article.field.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Search size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">Sizning yo'nalishingizga mos namunalar topilmadi.</p>
                  <p className="text-xs text-slate-400 mt-1">Barcha maqolalarni ko'rish uchun profilingizni tahrirlang.</p>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'supervisors' && (
            <motion.div
              key="supervisors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <header className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900">Ilmiy Rahbarlar Katalogi</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                  Unilibrary.uz platformasi ma'lumotlari asosida shakllantirilgan ilmiy rahbarlar bazasi.
                </p>
                {userProfile.fieldOfStudy && (
                  <div className="inline-block px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-bold border border-teal-100">
                    Sizning yo'nalishingiz: {userProfile.fieldOfStudy}
                  </div>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ...(userProfile.isSupervisor ? [{
                    id: 'current-user',
                    name: userProfile.fullName || 'Siz',
                    title: userProfile.scientificDegree || 'Ilmiy rahbar',
                    university: userProfile.workAddress || 'OTM nomi',
                    field: userProfile.fieldOfStudy || 'Yo\'nalish',
                    isUser: true,
                    requirements: userProfile.supervisorRequirements
                  }] : []),
                  ...SAMPLE_SUPERVISORS
                ]
                  .filter(s => 
                    !userProfile.fieldOfStudy || 
                    s.field.toLowerCase().includes(userProfile.fieldOfStudy.toLowerCase()) ||
                    userProfile.fieldOfStudy.toLowerCase().includes(s.field.toLowerCase())
                  )
                  .map((supervisor) => (
                    <Card 
                      key={supervisor.id} 
                      onClick={() => {
                        if (!supervisor.isUser) {
                          setActiveChat(supervisor);
                          setCurrentView('chat');
                        }
                      }}
                      className={`p-6 hover:shadow-lg transition-all border border-slate-100 bg-white shadow-sm overflow-hidden group ${supervisor.isUser ? 'ring-2 ring-teal-500' : 'cursor-pointer'}`}
                    >
                      <div className="flex gap-6">
                        <div className="shrink-0 relative">
                          <div className={`w-24 h-24 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm ${supervisor.isUser ? 'bg-teal-100' : ''}`}>
                            {supervisor.isUser ? <User size={40} className="text-teal-600" /> : (
                              <img 
                                src={DEFAULT_AVATAR} 
                                alt={supervisor.name}
                                className="w-full h-full rounded-xl object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full shadow-sm ${supervisor.isUser ? 'bg-teal-500' : 'bg-emerald-500'}`} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                                  {supervisor.name}
                                </h4>
                                {supervisor.isUser && (
                                  <span className="px-1.5 py-0.5 bg-teal-600 text-white text-[8px] font-bold rounded">Siz</span>
                                )}
                              </div>
                              <p className="text-sm text-teal-600 font-semibold mt-0.5">{supervisor.title}</p>
                            </div>
                            {!supervisor.isUser && (
                              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                <MessageSquare size={18} />
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <div className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center">
                                <GraduationCap size={14} className="text-slate-400" />
                              </div>
                              <span className="truncate">{supervisor.university}</span>
                            </div>
                          </div>

                          {supervisor.requirements && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Briefcase size={10} />
                                Shogirdlar uchun talablar:
                              </p>
                              <p className="text-xs text-slate-600 line-clamp-3 italic">
                                "{supervisor.requirements}"
                              </p>
                            </div>
                          )}

                          <div className="pt-3 flex items-center justify-between border-t border-slate-50 gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                              Yo'nalish: {supervisor.field}
                            </span>
                            {!supervisor.isUser && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveChat(supervisor);
                                  setCurrentView('chat');
                                }}
                                className="px-4 py-1.5 bg-teal-600 text-white text-[10px] font-bold rounded-lg hover:bg-teal-700 transition-all shadow-sm flex items-center gap-2 shrink-0"
                              >
                                <MessageSquare size={12} />
                                Yordam so'rash
                              </button>
                            )}
                            {supervisor.isUser && (
                              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">
                                Sizning profilingiz
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {SAMPLE_SUPERVISORS.filter(s => 
                !userProfile.fieldOfStudy || 
                s.field.toLowerCase().includes(userProfile.fieldOfStudy.toLowerCase()) ||
                userProfile.fieldOfStudy.toLowerCase().includes(s.field.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <UserCheck size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">Sizning yo'nalishingizga mos rahbarlar topilmadi.</p>
                  <p className="text-xs text-slate-400 mt-1">Barcha rahbarlarni ko'rish uchun profilingizni tahrirlang.</p>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'scholarship' && (
            <motion.div
              key="scholarship"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900">Barcha Grant va Stipendiyalar</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                  Respublika va xalqaro miqyosdagi barcha nufuzli ilmiy imkoniyatlar jamlangan baza.
                </p>
              </header>

              <div className="flex flex-col items-center gap-6">
                {isSearching && (
                  <div className="w-full max-w-2xl p-6 bg-teal-50 rounded-2xl border border-teal-100 text-center flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-teal-600" size={24} />
                    <p className="text-teal-900 font-bold">Profilingiz asosida moslik darajasi tahlil qilinmoqda...</p>
                  </div>
                )}
                {!userProfile.fullName && !isSearching && (
                  <div className="w-full max-w-2xl p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                    <p className="text-xs text-amber-800 font-medium">
                      <AlertCircle size={14} className="inline mr-1 mb-0.5" />
                      Shaxsiy kabinetingizni to'ldiring va har bir grant uchun shaxsiy moslik darajangizni bilib oling!
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scholarshipMatches.map((match, i) => (
                    <Card key={i} className={`p-6 hover:shadow-md transition-all border-l-4 ${selectedGrant?.name === match.name ? 'border-l-teal-600 bg-teal-50/30 ring-2 ring-teal-500/20' : 'border-l-slate-200'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">{match.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {match.matchScore !== undefined && match.matchScore > 0 && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">
                                <Target size={12} />
                                {match.matchScore}% moslik
                              </div>
                            )}
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                              {match.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">{match.description}</p>
                      <div className="p-3 bg-white/50 border border-slate-100 rounded-lg mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Asosiy talablar</p>
                        <p className="text-xs text-slate-700 line-clamp-2">{match.eligibility}</p>
                      </div>
                      <button 
                        onClick={() => handleSelectGrant(match)}
                        disabled={isGeneratingRoadmap && selectedGrant?.name === match.name}
                        className={`w-full py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                          selectedGrant?.name === match.name 
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600'
                        }`}
                      >
                        {isGeneratingRoadmap && selectedGrant?.name === match.name ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Roadmap tuzilmoqda...
                          </>
                        ) : (
                          <>
                            Tanlash va Roadmap tuzish
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Success Stories */}
              <div className="grid grid-cols-1 gap-8 mt-12">
                <section className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Zap className="text-amber-500" />
                    Muvaffaqiyat hikoyalari
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: 'Aziza Karimova',
                        achievement: 'Prezident stipendiyasi sohibi',
                        story: 'Iqtisodiyot yo\'nalishi 4-kurs talabasi. 5 ta xalqaro maqola va IELTS 8.0 bilan ushbu nufuzli stipendiyaga sazovor bo\'lgan.',
                        avatar: 'AK'
                      },
                      {
                        name: 'Jasur Bekmurodov',
                        achievement: 'Erasmus+ granti g\'olibi',
                        story: 'IT yo\'nalishi talabasi. Germaniyaning Myunxen texnika universitetida 1 semestr davomida bepul tahsil olgan.',
                        avatar: 'JB'
                      },
                      {
                        name: 'Madina Olimova',
                        achievement: 'El-yurt umidi stipendiyasi',
                        story: 'Buyuk Britaniyaning Oksford universitetida magistratura bosqichida o\'qish uchun to\'liq grant yutib olgan.',
                        avatar: 'MO'
                      }
                    ].map((story, i) => (
                      <Card key={i} className="p-5 bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {story.avatar}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{story.name}</h4>
                            <p className="text-xs font-bold text-amber-600 mb-2">{story.achievement}</p>
                            <p className="text-sm text-slate-500 italic leading-relaxed">"{story.story}"</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <Card className="p-6 bg-slate-900 text-white border-none">
                    <h4 className="font-bold mb-2">Siz ham g'olib bo'lishingiz mumkin!</h4>
                    <p className="text-sm text-slate-400 mb-4">O'zingiz haqingizda ma'lumot kiriting va biz sizga mos grantni topib beramiz.</p>
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      Yuqoriga qaytish <ArrowRight size={14} />
                    </button>
                  </Card>
                </section>
              </div>
            </motion.div>
          )}

          {currentView === 'application' && (
            <motion.div
              key="application"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Ariza Yaratish</h2>
                  <p className="text-slate-500 mt-1">Tanlangan grant uchun hujjatlarni tayyorlash va tekshirish.</p>
                </div>
                {selectedGrant && (
                  <div className="px-4 py-2 bg-teal-50 border border-teal-100 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Tanlangan grant</p>
                      <p className="text-sm font-bold text-slate-900">{selectedGrant.name}</p>
                    </div>
                  </div>
                )}
              </header>

              {!selectedGrant && (
                <div className="text-center p-20 bg-white rounded-3xl border border-slate-200">
                  <Send size={64} className="mx-auto text-slate-200 mb-6" />
                  <h3 className="text-xl font-bold text-slate-400">Grant tanlanmagan</h3>
                  <p className="text-slate-400 mt-2">Ariza yaratish uchun avval Grantlar bo'limida biror grantni tanlang.</p>
                  <button 
                    onClick={() => setCurrentView('scholarship')}
                    className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
                  >
                    Grantlarni ko'rish
                  </button>
                </div>
              )}

              {selectedGrant && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={20} className="text-teal-600" />
                      Kerakli hujjatlar
                    </h3>
                    <div className="space-y-3">
                      {isGeneratingDocs ? (
                        <div className="p-12 text-center space-y-4">
                          <Loader2 className="animate-spin mx-auto text-teal-600" size={32} />
                          <p className="text-sm text-slate-500">Hujjatlar ro'yxati shakllantirilmoqda...</p>
                        </div>
                      ) : (
                        applicationDocs.map((doc, i) => (
                          <Card 
                            key={i} 
                            className={`p-4 cursor-pointer transition-all border-2 ${
                              docVerificationResults[doc.name] ? 'border-teal-100 bg-teal-50/30' : 'border-transparent hover:border-teal-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                docVerificationResults[doc.name] ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {docVerificationResults[doc.name] ? <Check size={18} /> : <FileText size={18} />}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{doc.description}</p>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Zap size={20} className="text-amber-500" />
                      Hujjatni tayyorlash va tekshirish
                    </h3>
                    
                    <div className="space-y-6">
                      {applicationDocs.map((doc, i) => (
                        <Card key={i} className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">{doc.name}</h4>
                              <p className="text-sm text-slate-500 mt-1">{doc.guide}</p>
                            </div>
                            {docVerificationResults[doc.name] && (
                              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                docVerificationResults[doc.name].status === 'success' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {docVerificationResults[doc.name].status === 'success' ? 'Tayyor' : 'Yaxshilash kerak'}
                              </div>
                            )}
                          </div>

                          {doc.template && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Shablon / Namuna</p>
                              <p className="text-xs text-blue-800 italic">{doc.template}</p>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-slate-700">Hujjat matni yoki fayl:</label>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  id={`file-upload-${i}`}
                                  className="hidden" 
                                  accept=".pdf,.doc,.docx,.txt"
                                  onChange={(e) => handleFileUpload(e, doc.name)}
                                />
                                <label 
                                  htmlFor={`file-upload-${i}`}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-teal-100 transition-all border border-teal-100"
                                >
                                  {isParsingFile[doc.name] ? (
                                    <Loader2 className="animate-spin" size={12} />
                                  ) : (
                                    <FileUp size={12} />
                                  )}
                                  Fayl yuklash (.pdf, .doc)
                                </label>
                              </div>
                            </div>
                            
                            <textarea 
                              value={docVerificationInput[doc.name] || ''}
                              onChange={(e) => setDocVerificationInput({ ...docVerificationInput, [doc.name]: e.target.value })}
                              placeholder={`${doc.name} matnini shu yerga yozing yoki fayl yuklang...`}
                              className="w-full h-40 p-4 text-sm rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
                            />
                            
                            <button 
                              onClick={() => handleVerifyDoc(doc.name)}
                              disabled={isVerifyingDoc[doc.name] || !docVerificationInput[doc.name]}
                              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isVerifyingDoc[doc.name] ? (
                                <>
                                  <Loader2 className="animate-spin" size={18} />
                                  Tekshirilmoqda...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={18} />
                                  Hujjatni tekshirish
                                </>
                              )}
                            </button>
                          </div>

                          {docVerificationResults[doc.name] && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 rounded-2xl border ${
                                docVerificationResults[doc.name].status === 'success' ? 'bg-teal-50 border-teal-100' : 'bg-amber-50 border-amber-100'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-900">Tahlil natijasi: {docVerificationResults[doc.name].score} ball</span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{docVerificationResults[doc.name].feedback}</p>
                            </motion.div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Sizning Shaxsiy Roadmapingiz</h2>
                  <p className="text-slate-500 mt-1">Yutuqlarga erishish uchun qadam-baqadam reja.</p>
                </div>
              {roadmap && (
                  <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                        <circle 
                          cx="24" cy="24" r="20" fill="none" stroke="#0d9488" strokeWidth="4" 
                          strokeDasharray={125.6} 
                          strokeDashoffset={125.6 - (125.6 * (roadmap.filter(s => s.completed).length / roadmap.length))}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-teal-600">
                        {Math.round((roadmap.filter(s => s.completed).length / roadmap.length) * 100)}%
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Umumiy progress</p>
                      <p className="text-sm font-bold text-slate-900">
                        {roadmap.filter(s => s.completed).length} / {roadmap.length} qadam bajarildi
                      </p>
                    </div>
                  </div>
                )}
              </header>

              {!roadmap && (
                <div className="text-center p-20 bg-white rounded-3xl border border-slate-200">
                  <Map size={64} className="mx-auto text-slate-200 mb-6" />
                  <h3 className="text-xl font-bold text-slate-400">Hozircha roadmap yo'q</h3>
                  <p className="text-slate-400 mt-2">Roadmap yaratish uchun avval Grantlar bo'limida biror grantni tanlang.</p>
                  <button 
                    onClick={() => setCurrentView('scholarship')}
                    className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
                  >
                    Grantlarni topish
                  </button>
                </div>
              )}

              {roadmap && (
                <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-teal-500/50 before:via-slate-200 before:to-transparent">
                  {roadmap.map((step, i) => (
                    <div key={step.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${step.completed ? 'is-completed' : 'is-active'}`}>
                      {/* Icon */}
                      <div 
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                          step.completed 
                            ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200' 
                            : 'bg-white border-slate-300 text-slate-300'
                        }`}
                      >
                        {step.completed ? <Check size={20} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                      </div>

                      {/* Content */}
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl border transition-all ${
                        step.completed 
                          ? 'bg-teal-50/50 border-teal-100 shadow-sm' 
                          : 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{step.timeframe}</span>
                          {step.completed && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={10} /> Bajarildi
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{step.step}</h4>
                        <p className="text-sm text-slate-500 mb-4">{step.action}</p>

                        {/* Verification Area */}
                        {!step.completed && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                              <Target size={14} className="text-teal-600" />
                              {step.verificationPrompt}
                            </p>
                            
                            {step.type === 'interview' && step.interviewQuestions && (
                              <div className="space-y-2">
                                {step.interviewQuestions.map((q, idx) => (
                                  <p key={idx} className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                                    Q{idx + 1}: {q}
                                  </p>
                                ))}
                              </div>
                            )}

                            <textarea 
                              value={verificationInput[step.id] || ''}
                              onChange={(e) => setVerificationInput({ ...verificationInput, [step.id]: e.target.value })}
                              placeholder={step.type === 'article' ? "Maqola matnini yoki linkini kiriting..." : step.type === 'interview' ? "Savollarga javob bering..." : "Hujjat tafsilotlarini kiriting..."}
                              className="w-full h-24 p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
                            />
                            
                            <button 
                              onClick={() => handleVerifyStep(step.id)}
                              disabled={step.verifying || !verificationInput[step.id]}
                              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {step.verifying ? (
                                <>
                                  <Loader2 className="animate-spin" size={14} />
                                  Tekshirilmoqda...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={14} />
                                  Tekshirishga yuborish
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Feedback Area */}
                        {step.verificationResult && (
                          <div className={`mt-4 p-4 rounded-2xl border ${step.verificationResult.status === 'success' ? 'bg-teal-50 border-teal-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${step.verificationResult.status === 'success' ? 'text-teal-700' : 'text-amber-700'}`}>
                                {step.verificationResult.status === 'success' ? 'Muvaffaqiyatli' : 'Yaxshilash kerak'}
                              </span>
                              <span className="text-xs font-black text-slate-900">{step.verificationResult.score} ball</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{step.verificationResult.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto h-[calc(100vh-124px)] flex flex-col gap-6"
            >
              <header className="px-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chatlar va Muloqot</h2>
                <p className="text-slate-500 text-sm">
                  {userProfile.isSupervisor 
                    ? "Shogirdlar so'rovlarini ko'rib chiqing va maqola, kurs ishi bo'yicha yordam bering." 
                    : "Ilmiy rahbarlar bilan bog'laning hamda maqola va kurs ishlarida yordam so'rang."
                  }
                </p>
              </header>

              <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex">
                <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                  <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Kontaktlarni qidirish..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {/* For Students: Show Supervisors they are chatting with */}
                    {!userProfile.isSupervisor && (
                      <>
                        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ilmiy rahbarlarim</p>
                        {SAMPLE_SUPERVISORS.map((s) => (
                          <div 
                            key={s.id}
                            onClick={() => setActiveChat(s)}
                            className={`p-3 flex items-center gap-3 rounded-2xl cursor-pointer transition-all group ${activeChat?.id === s.id ? 'bg-teal-600 shadow-lg shadow-teal-100' : 'hover:bg-white hover:shadow-sm'}`}
                          >
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 ${activeChat?.id === s.id ? 'bg-white/20 border-white/30 text-white' : 'bg-white border-slate-100 text-slate-500 group-hover:border-teal-200 group-hover:text-teal-600'}`}>
                              {s.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-sm truncate ${activeChat?.id === s.id ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                              <p className={`text-[10px] truncate ${activeChat?.id === s.id ? 'text-teal-100' : 'text-slate-500'}`}>{s.title}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${activeChat?.id === s.id ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                          </div>
                        ))}
                      </>
                    )}

                    {/* For Supervisors: Show Students who requested help */}
                    {userProfile.isSupervisor && (
                      <>
                        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2">Shogirdlarim (Kelib tushgan so'rovlar)</p>
                        {SAMPLE_STUDENTS.map((st) => (
                          <div 
                            key={st.id}
                            onClick={() => setActiveChat({ id: st.id, name: st.name, title: st.topic, university: st.university, field: st.topic })}
                            className={`p-3 flex items-center gap-3 rounded-2xl cursor-pointer transition-all group ${activeChat?.id === st.id ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'hover:bg-white hover:shadow-sm'}`}
                          >
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 ${activeChat?.id === st.id ? 'bg-white/20 border-white/30 text-white' : 'bg-white border-slate-100 text-slate-500 group-hover:border-teal-200 group-hover:text-teal-600'}`}>
                              {st.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-sm truncate ${activeChat?.id === st.id ? 'text-white' : 'text-slate-900'}`}>{st.name}</p>
                              <p className={`text-[10px] truncate ${activeChat?.id === st.id ? 'text-slate-300' : 'text-slate-500'}`}>{st.topic}</p>
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col relative bg-slate-50/20">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0d9488 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  
                  {activeChat ? (
                    <>
                      <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm border border-teal-100">
                            {activeChat.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{activeChat.name}</p>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all border border-slate-100"><Briefcase size={18} /></button>
                           <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all border border-slate-100"><Users size={18} /></button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-24">
                        <div className="flex justify-center">
                          <span className="px-4 py-1.5 bg-slate-100/50 backdrop-blur-sm text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200">Bugun</span>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="max-w-[80%] p-4 bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed">
                            <p className="font-bold text-teal-600 text-[10px] uppercase mb-1">Tizim tavsiyasi</p>
                            Salom! {activeChat.name} ilmiy ishlaringizda yordam berishi mumkin. Savollaringizni yozib qoldiring.
                          </div>
                        </div>

                        {(chatMessages[activeChat.id] || []).map((m, i) => (
                          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-4 rounded-2xl text-[13px] leading-relaxed relative ${
                              m.sender === 'user' 
                                ? 'bg-teal-600 text-white rounded-tr-none shadow-lg shadow-teal-100' 
                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                            }`}>
                              {m.type === 'image' && m.fileData?.url && (
                                <div className="mb-2 overflow-hidden rounded-lg border border-white/20">
                                  <img src={m.fileData.url} alt="Rasmli xabar" className="w-full h-auto object-cover" />
                                </div>
                              )}
                              
                              {m.type === 'file' && m.fileData && (
                                <div className={`mb-2 p-3 rounded-xl flex items-center gap-3 border ${m.sender === 'user' ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                                  <FileText className={m.sender === 'user' ? 'text-teal-200' : 'text-teal-600'} size={24} />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs truncate">{m.fileData.name}</p>
                                    <p className={`text-[9px] ${m.sender === 'user' ? 'text-teal-100' : 'text-slate-500'}`}>{m.fileData.size}</p>
                                  </div>
                                  <Download size={14} className="opacity-50" />
                                </div>
                              )}

                              {m.type === 'link' && m.linkData && (
                                <a href={m.linkData.url} target="_blank" rel="noopener noreferrer" className={`mb-2 p-3 rounded-xl flex items-center gap-3 border block hover:opacity-80 transition-all ${m.sender === 'user' ? 'bg-white/10 border-white/20 text-white' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                                  <Link2 className={m.sender === 'user' ? 'text-teal-200' : 'text-blue-600'} size={24} />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs truncate">{m.linkData.title || "Havola"}</p>
                                    <p className={`text-[9px] truncate ${m.sender === 'user' ? 'text-teal-100' : 'text-blue-500'}`}>{m.linkData.url}</p>
                                  </div>
                                  <ExternalLink size={14} className="opacity-50" />
                                </a>
                              )}

                              {m.text && <p>{m.text}</p>}
                              
                              <div className={`text-[8px] mt-2 flex items-center justify-end gap-1 ${m.sender === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>
                                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {m.sender === 'user' && <Check size={8} />}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div id="chat-end" />
                      </div>

                      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 absolute bottom-0 left-0 right-0">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const input = form.elements.namedItem('message') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleSendMessage(input.value.trim());
                            input.value = '';
                          }
                        }} className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                          <div className="flex items-center gap-1">
                            <button type="button" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"><Paperclip size={18} /></button>
                            <button type="button" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"><ImageIcon size={18} /></button>
                          </div>
                          <input 
                            name="message"
                            autoComplete="off"
                            placeholder="Xabaringizni shu yerga yozing..."
                            className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm text-slate-700 placeholder:text-slate-400"
                          />
                          <button 
                            type="submit"
                            className="w-12 h-12 bg-teal-600 text-white rounded-[14px] hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 flex items-center justify-center shrink-0 active:scale-95"
                          >
                            <Send size={20} />
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                      <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 relative">
                        <MessageSquare size={40} className="text-teal-600" />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-amber-400 rounded-full border-4 border-white animate-bounce" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Xabarlar Markazi</h3>
                      <p className="text-slate-400 text-sm max-w-sm">Muloqotni boshlash kontaktni tanlang. Rahbarlar sizning so'rovlaringizni kutmoqda.</p>
                      <button 
                        onClick={() => setCurrentView('supervisors')}
                        className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                      >
                        Rahbar topish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="relative w-full max-w-sm h-[calc(100vh-2rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell size={20} className="text-teal-600" />
                  Bildirishnomalar
                </h3>
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.filter(n => !(n as any).recipientRole || ((n as any).recipientRole === 'supervisor' && userProfile.isSupervisor)).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Bell size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">Hozircha bildirishnomalar yo'q</p>
                  </div>
                ) : (
                  notifications
                    .filter(n => !(n as any).recipientRole || ((n as any).recipientRole === 'supervisor' && userProfile.isSupervisor))
                    .map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          n.read ? 'bg-white border-slate-100' : 'bg-teal-50/50 border-teal-100 shadow-sm'
                        }`}
                        onClick={() => {
                          setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-bold ${n.read ? 'text-slate-700' : 'text-teal-900'}`}>{n.title}</h4>
                          <span className="text-[10px] font-medium text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                        {!n.read && <div className="mt-2 w-1.5 h-1.5 bg-teal-500 rounded-full" />}
                      </div>
                    ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100">
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  className="w-full py-3 text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                >
                  Hammasini o'qilgan deb belgilash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Shaxsiy kabinet</h3>
                  <button 
                    onClick={() => setIsProfileModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <AlertCircle size={24} className="rotate-45" />
                  </button>
                </div>

                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 font-sans italic">Ism va Familiya</label>
                      <input
                        type="text"
                        required
                        value={userProfile.fullName}
                        onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                        placeholder="Ism va familiyangizni kiriting"
                      />
                    </div>

                    {userProfile.mainGoal === 'Yutuqlarim bilan o\'rtoqlashish' && (
                      <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                        <input 
                          type="checkbox" 
                          id="isSupervisor" 
                          checked={userProfile.isSupervisor}
                          onChange={(e) => setUserProfile({ ...userProfile, isSupervisor: e.target.checked })}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                        />
                        <label htmlFor="isSupervisor" className="text-xs font-bold text-teal-900 cursor-pointer">
                          Men ilmiy rahbarman
                        </label>
                      </div>
                    )}

                    {userProfile.isSupervisor && userProfile.mainGoal === 'Yutuqlarim bilan o\'rtoqlashish' ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Faoliyat manzili (OTM/Tashkilot)</label>
                            <input
                              type="text"
                              required
                              value={userProfile.workAddress}
                              onChange={(e) => setUserProfile({ ...userProfile, workAddress: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                              placeholder="Manzilni kiriting"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Ilmiy daraja va unvon</label>
                            <input
                              type="text"
                              required
                              value={userProfile.scientificDegree}
                              onChange={(e) => setUserProfile({ ...userProfile, scientificDegree: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                              placeholder="DSc, PhD, Professor..."
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Shogirdlar uchun asosiy talablaringiz</label>
                          <textarea
                            required
                            value={userProfile.supervisorRequirements}
                            onChange={(e) => setUserProfile({ ...userProfile, supervisorRequirements: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm h-24 resize-none"
                            placeholder="Shogird tushmoqchi bo'lgan talabalar uchun talablaringizni yozing..."
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">O'qiyotgan OTM nomi</label>
                            <input
                              type="text"
                              required
                              value={userProfile.university}
                              onChange={(e) => setUserProfile({ ...userProfile, university: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                              placeholder="OTM nomi"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Ta'lim yo'nalishi</label>
                            <input
                              type="text"
                              required
                              value={userProfile.fieldOfStudy}
                              onChange={(e) => setUserProfile({ ...userProfile, fieldOfStudy: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                              placeholder="Yo'nalish"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Ta'lim kursingiz</label>
                            <select
                              required
                              value={userProfile.studyYear}
                              onChange={(e) => setUserProfile({ ...userProfile, studyYear: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm bg-white"
                            >
                              <option value="">Tanlang</option>
                              <option value="1-kurs">1-kurs</option>
                              <option value="2-kurs">2-kurs</option>
                              <option value="3-kurs">3-kurs</option>
                              <option value="4-kurs">4-kurs</option>
                              <option value="tamomlaganman">Bakalavrni tamomlaganman</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Til darajasi</label>
                            <input
                              type="text"
                              required
                              value={userProfile.languageLevel}
                              onChange={(e) => setUserProfile({ ...userProfile, languageLevel: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                              placeholder="IELTS/CEFR"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">GPA balli</label>
                            <input
                              type="text"
                              required
                              value={userProfile.gpa}
                              onChange={(e) => setUserProfile({ ...userProfile, gpa: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                              placeholder="4.5+"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Maqolalar soni</label>
                            <input
                              type="number"
                              required
                              value={userProfile.articleCount}
                              onChange={(e) => setUserProfile({ ...userProfile, articleCount: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Asosiy maqsad</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'Maqola yozish',
                        'Nomdor stipendiya grantlar yutish',
                        'Yutuqlarim bilan o\'rtoqlashish'
                      ].map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setUserProfile({ ...userProfile, mainGoal: goal })}
                          className={`w-full text-left px-4 py-2 rounded-xl border transition-all text-sm ${
                            userProfile.mainGoal === goal
                              ? 'border-teal-600 bg-teal-50 text-teal-700 font-bold'
                              : 'border-slate-200 hover:border-teal-300 text-slate-600'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 mt-2"
                  >
                    Saqlash
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={`h-2 w-full ${
                selectedDetail.type === 'imrad' ? 'bg-teal-500' : 
                selectedDetail.type === 'scholarship' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{selectedDetail.title}</h3>
                  <button 
                    onClick={() => setSelectedDetail(null)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <AlertCircle size={20} className="rotate-45 text-slate-400" />
                  </button>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-slate-700 leading-relaxed italic">
                    {selectedDetail.content}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDetail(null)}
                  className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Tushunarli
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
