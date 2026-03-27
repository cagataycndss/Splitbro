/**
 * Yapay Zeka destekli fatura ve fiş okuma servisi mock simülasyonu.
 * Gerçekte bu aşamada Tesseract.js, Google Cloud Vision, veya OpenAI GPT-4 Vision gibi 
 * bir kütüphane üzerinden dönen response'u parse edeceğiniz yer.
 */

export const scanReceiptMockAI = async (imageUrl) => {
  return new Promise((resolve) => {
    // 1-2 saniyelik okuma sürecini simüle et
    setTimeout(() => {
      // Mock Data (AI Tarafından Çıkarılmış Örnek Gider)
      resolve({
        success: true,
        extractedData: {
          title: 'Akşam Yemeği - Burger',
          amount: 250.75, // Fişten çıkarılan toplam ödenecek tutar
          confidenceScore: 92.5, // %92 başarı ile okundu
          ocrText: 'RESTORAN A.Ş.\\n1x BIG MENU 220.75\\n1x AYRAN 30.00\\nTOPLAM 250.75 TRY',
        },
      });
    }, 1500);
  });
};
