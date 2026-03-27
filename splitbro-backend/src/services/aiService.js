import ApiError from '../utils/ApiError.js';

export const verifyPriceWithAI = async (itemName, price) => {
  // Gelen veriler için dummy bir istatistiksel / AI tespiti
  // Örnek: "su" için fiyat 500 girildiyse anomali tespiti.
  const lowerItemName = itemName.trim().toLowerCase();
  let marketAverage = 0;
  
  if (lowerItemName.includes('su') || lowerItemName.includes('water')) {
    marketAverage = 10;
  } else if (lowerItemName.includes('ekmek')) {
    marketAverage = 10;
  } else if (lowerItemName.includes('kahve')) {
    marketAverage = 100;
  } else {
    // Bilinmeyen ürünler için varsayılan güvenli limit. 
    // OpenAI API call buraya gelebilir.
    return {
      isAnomaly: false,
      message: 'Fiyat anomali testinden geçti. (Mock API)',
      marketAverage: null,
      accuracy: 'low'
    };
  }

  // Fiyat %300'den fazlaysa Anomali
  if (price > marketAverage * 3) {
    return {
      isAnomaly: true,
      message: `Girdiğiniz tutar (${price} ₺) piyasa ortalamasının (${marketAverage} ₺) çok üstünde. Lütfen fiyatı kontrol edin.`,
      marketAverage,
      accuracy: 'high'
    };
  }

  return {
    isAnomaly: false,
    message: 'Fiyat piyasa koşullarına uygun görünüyor.',
    marketAverage,
    accuracy: 'high'
  };
};
