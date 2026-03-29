import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import ApiError from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scanReceiptMockAI = async (imageUrl) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        extractedData: {
          title: 'Akşam Yemeği - Burger',
          amount: 250.75,
          confidenceScore: 92.5,
          ocrText: 'RESTORAN A.Ş.\\n1x BIG MENU 220.75\\n1x AYRAN 30.00\\nTOPLAM 250.75 TRY',
        },
      });
    }, 1500);
  });
};

export const scanReceiptWithAI = async (imageUrl) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY bulunamadı, MOCK OCR API kullanılıyor...');
    return scanReceiptMockAI(imageUrl);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let base64Image;
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('data:image/')) {
      const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Image = matches[2];
      } else {
        throw new ApiError(400, 'Geçersiz Base64 görüntü formatı.');
      }
    } else {
      const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
      const filePath = path.join(__dirname, '..', '..', cleanUrl);

      if (!fs.existsSync(filePath)) {
         throw new ApiError(404, 'Fiş/Fatura resmi sunucuda bulunamadı: ' + filePath);
      }

      if (filePath.endsWith('.png')) mimeType = 'image/png';
      else if (filePath.endsWith('.webp')) mimeType = 'image/webp';

      base64Image = fs.readFileSync(filePath).toString('base64');
    }
    
    const prompt = `Ekteki fiş veya fatura görüntüsünü analiz et. Fişteki ana satıcı/restoran adını (title olarak) ve en alttaki toplam ödenecek tutarı (amount olarak sayısal) çıkart. Ayrıca ürünlerin ne olduğunu anlamamızı sağlayacak fişin içeriğini okunaklı bir metin olarak (ocrText olarak) çıkart.
    Lütfen sadece şu JSON formatında cevap ver, harici markdown ekleme:
    {
      "title": "Restoran/Satıcı Adı",
      "amount": 100.50,
      "confidenceScore": 95,
      "ocrText": "..."
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]
    });

    const cleanJson = response.text.match(/\{[\s\S]*\}/);
    if (cleanJson) {
      const data = JSON.parse(cleanJson[0]);
      return {
        success: true,
        extractedData: data
      };
    }
    throw new Error('Geçerli bir JSON formatı bulunamadı');
  } catch (err) {
    console.error('AI Scanner Error:', err);
    throw new ApiError(500, 'Fiş/Fatura okunurken yapay zeka (Vision) tarafında bir hata oluştu veya resim okunamadı.');
  }
};
