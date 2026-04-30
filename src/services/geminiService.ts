import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function analyzeArticle(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Quyidagi akademik maqola matnini IMRAD (Kirish, Metodlar, Natijalar va Muhokama) standartlariga muvofiqligini tahlil qiling. 
    Quyidagilar bo'yicha fikr-mulohaza bildiring:
    1. Tuzilishi (IMRAD muvofiqligi)
    2. Mazmun sifati
    3. Aniqlik va mantiq
    4. Yaxshilash bo'yicha tavsiyalar
    Maqolani qayta yozmang. Faqat fikr-mulohaza bildiring.
    Barcha javoblar O'zbek tilida bo'lishi SHART.
    
    Maqola matni:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          imradScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
          feedback: {
            type: Type.OBJECT,
            properties: {
              introduction: { type: Type.STRING },
              methods: { type: Type.STRING },
              results: { type: Type.STRING },
              discussion: { type: Type.STRING },
            },
          },
          generalSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          accuracyCheck: { type: Type.STRING },
        },
        required: ["imradScore", "feedback", "generalSuggestions", "accuracyCheck"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeScholarshipMatch(studentProfile: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Quyidagi talaba profili asosida unga mos keladigan grantlar va stipendiyalarni tahlil qiling.
    Sizning vazifangiz - barcha asosiy nomdor stipendiyalar (Prezident, Beruniy, Navoiy, Ulug'bek, Islom Karimov va h.k.) va xalqaro grantlarni (El-yurt umidi, Fulbright, DAAD, Chevening, Stipendium Hungaricum, Turkiye Burslari, Erasmus+ va h.k.) talaba profili bilan solishtirish.
    
    MUHIM: 
    1. Agar talaba "Bakalavrni tamomlaganman" (Kurs: tamomlaganman) deb ko'rsatgan bo'lsa, unga asosan chet elda magistratura o'qish uchun mo'ljallangan xalqaro grantlarni (Erasmus+, El-yurt umidi, DAAD va h.k.) birinchi navbatda va yuqori moslik darajasi bilan taklif qiling.
    2. Agar talaba hali talaba bo'lsa (1-4 kurs), unga O'zbekistondagi davlat stipendiyalarini va talabalar uchun almashinuv dasturlarini taklif qiling.
    
    Har bir grant uchun talabaning profili bilan moslik darajasini (foizda) hisoblang.
    Agar talaba profili to'liq bo'lmasa, umumiy talablar asosida taxminiy moslikni ko'rsating.
    Barcha ma'lumotlar (nomi, tavsifi, talablari, muddati va moslik darajasi) O'zbek tilida bo'lishi SHART.
    
    Talaba profili:
    ${studentProfile}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                eligibility: { type: Type.STRING },
                deadline: { type: Type.STRING },
                matchScore: { type: Type.NUMBER, description: "Moslik darajasi 0 dan 100 gacha" },
              },
            },
          },
        },
        required: ["matches"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateRoadmapForGrant(studentProfile: string, grantName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Talaba tanlagan "${grantName}" granti uchun shaxsiy roadmap (yo'l xaritasi) taqdim eting.
    Roadmap qadam-baqadam bo'lishi va har bir qadamda nima qilish kerakligi aniq ko'rsatilishi kerak.
    Har bir qadam uchun uning turini (type) belgilang: 
    - 'article': Ilmiy maqola yozish bilan bog'liq qadamlar
    - 'document': Hujjatlarni tayyorlash (passport, diploma, motivatsion xat va h.k.)
    - 'interview': Saralash bosqichi yoki suhbatga tayyorgarlik
    - 'general': Umumiy qadamlar
    
    Har bir qadam uchun foydalanuvchiga nima yuklashi yoki nima haqida yozishi kerakligi bo'yicha 'verificationPrompt' bering.
    'interview' turi uchun 'interviewQuestions' maydonida 3 ta ehtimoliy savolni kiriting.
    Barcha ma'lumotlar O'zbek tilida bo'lishi SHART.
    
    Talaba profili:
    ${studentProfile}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                action: { type: Type.STRING },
                timeframe: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['article', 'document', 'interview', 'general'] },
                verificationPrompt: { type: Type.STRING },
                interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["step", "action", "timeframe", "type", "verificationPrompt"],
            },
          },
        },
        required: ["roadmap"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function verifyRoadmapStep(stepType: string, content: string, context: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Foydalanuvchi roadmapning "${stepType}" turidagi qadami uchun quyidagi ma'lumotni taqdim etdi.
    Ushbu ma'lumotni tahlil qiling va uning sifatini, grant talablariga mosligini tekshiring.
    
    Taqdim etilgan ma'lumot:
    ${content}
    
    Kontekst (Grant va qadam haqida):
    ${context}
    
    Javobingizda quyidagilar bo'lsin:
    1. 'status': 'success' (agar ma'lumot qoniqarli bo'lsa) yoki 'needs_improvement'
    2. 'feedback': Foydalanuvchi uchun batafsil fikr-mulohaza va tavsiyalar.
    3. 'score': 0 dan 100 gacha ball.
    
    Barcha ma'lumotlar O'zbek tilida bo'lishi SHART.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ['success', 'needs_improvement'] },
          feedback: { type: Type.STRING },
          score: { type: Type.NUMBER },
        },
        required: ["status", "feedback", "score"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateArticleSuggestions(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Quyidagi akademik maqola matni asosida uning annotatsiyasi (abstract), kirish (introduction) qismi va kalit so'zlarini (keywords) shakllantiring.
    Annotatsiya (abstract) 3 ta tilda (O'zbek, Rus, Ingliz) bo'lishi SHART.
    Kirish va kalit so'zlar O'zbek tilida bo'lishi kerak.
    
    Maqola matni:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          abstractUz: { type: Type.STRING, description: "Annotatsiya O'zbek tilida" },
          abstractRu: { type: Type.STRING, description: "Annotatsiya Rus tilida" },
          abstractEn: { type: Type.STRING, description: "Annotatsiya Ingliz tilida" },
          introduction: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["abstractUz", "abstractRu", "abstractEn", "introduction", "keywords"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateArticleTopics(field: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Foydalanuvchining "${field}" ta'lim yo'nalishi bo'yicha dolzarb va qiziqarli 5 ta ilmiy maqola mavzusini taklif qiling.
    Har bir mavzu uchun qisqacha nima haqida yozish kerakligi bo'yicha tavsiya bering.
    Barcha ma'lumotlar O'zbek tilida bo'lishi SHART.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
          },
        },
        required: ["topics"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateApplicationDocuments(studentProfile: string, grantName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Talaba tanlagan "${grantName}" granti uchun hujjatlar ro'yxatini va ularni tayyorlash bo'yicha qo'llanmani shakllantiring.
    Har bir hujjat uchun:
    1. Nomi
    2. Tavsifi (nima uchun kerak)
    3. Tayyorlash bo'yicha maslahat
    4. Namuna yoki shablon (agar mavjud bo'lsa)
    
    Barcha ma'lumotlar O'zbek tilida bo'lishi SHART.
    
    Talaba profili:
    ${studentProfile}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          documents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                guide: { type: Type.STRING },
                template: { type: Type.STRING },
              },
              required: ["name", "description", "guide"],
            },
          },
        },
        required: ["documents"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function verifyApplicationDocument(docName: string, content: string, grantName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Foydalanuvchi "${grantName}" granti uchun "${docName}" hujjatini taqdim etdi.
    Ushbu hujjatni tahlil qiling va uning grant talablariga mosligini tekshiring.
    
    Hujjat matni:
    ${content}
    
    Javobingizda quyidagilar bo'lsin:
    1. 'status': 'success' (agar hujjat qoniqarli bo'lsa) yoki 'needs_improvement'
    2. 'feedback': Hujjatni yaxshilash bo'yicha batafsil tavsiyalar.
    3. 'score': 0 dan 100 gacha ball.
    
    Barcha ma'lumotlar O'zbek tilida bo'lishi SHART.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ['success', 'needs_improvement'] },
          feedback: { type: Type.STRING },
          score: { type: Type.NUMBER },
        },
        required: ["status", "feedback", "score"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
