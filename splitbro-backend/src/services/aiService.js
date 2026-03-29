import ApiError from '../utils/ApiError.js';
import { GoogleGenAI } from '@google/genai';

const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(500, 'Sunucuda GEMINI_API_KEY ayarlanmamış! Lütfen .env dosyanızı kontrol edin.');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const verifyPriceWithAI = async (itemName, price) => {
  const ai = getAiClient();
  
  const prompt = `Lütfen "${itemName}" adlı ürünün "${price} TL" fiyatının piyasa ortalamalarına (Türkiye şartlarında) göre bir anomali (çok pahalı veya çok ucuz) olup olmadığını analiz et. Lütfen sadece JSON formatında yanıt dön. Herhangi bir markdown, açıklama veya json etiketi kullanma. Sadece geçerli JSON:
  {
     "isAnomaly": true veya false,
     "message": "sebep veya tavsiye (Türkçe)",
     "marketAverage": tahmini_ortalama_sayi_olarak,
     "accuracy": "high" veya "low"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const cleanJson = response.text.match(/\{[\s\S]*\}/);
    if (cleanJson) {
      return JSON.parse(cleanJson[0]);
    }
    throw new Error('Geçerli bir JSON formatı bulunamadı');
  } catch (err) {
    console.error('AI Verify Price Error:', err);
    throw new ApiError(500, 'Yapay Zeka (Gemini) Fiyat Doğrulaması yaparken bir hata ile karşılaşıldı.');
  }
};

export const categorizeItemsWithAI = async (itemsList) => {
  if (!itemsList || itemsList.length === 0) {
    throw new ApiError(400, 'Kategorize edilecek ürün listesi boş olamaz.');
  }

  const ai = getAiClient();
  const prompt = `Aşağıda verilen ürün isimlerini mantıklı kategorilere (Gıda, İçecek, Temizlik, Kişisel Bakım, Kırtasiye, Diğer vb.) ayır. Lütfen sadece aşağıdaki JSON formatında cevap dön, başka hiçbir açıklama yapma:
  {
    "categories": [
      { "itemName": "kola", "category": "İçecek" },
      { "itemName": "şampuan", "category": "Kişisel Bakım" }
    ]
  }
  
  Ürünler: ${itemsList.join(', ')}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const cleanJson = response.text.match(/\{[\s\S]*\}/);
    if (cleanJson) {
      return JSON.parse(cleanJson[0]);
    }
    throw new Error('Geçerli bir JSON formatı bulunamadı');
  } catch (err) {
    console.error('AI Categorization Error:', err);
    throw new ApiError(500, 'Yapay Zeka (Gemini) Kategorizasyon sistemi geçici olarak kullanılamıyor.');
  }
};
