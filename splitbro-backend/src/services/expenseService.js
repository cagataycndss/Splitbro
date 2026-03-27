// services/expenseService.js

exports.calculateDebtsForExpense = (expense) => {
    // Alacaklı (Banka), hesabı ödeyen kişidir.
    const creditorId = expense.paidById.toString();
    
    // Kimin ne kadar borcu olduğunu tutacağımız sanal defter (Map)
    const debtMap = new Map();

    // 1. Fişteki tüm ürünleri tek tek dönüyoruz
    expense.items.forEach(item => {
        const usersCount = item.assignedUserIds.length;
        
        // Eğer ürüne kimse atanmamışsa bu ürünü atla (Sıfıra bölme hatasını önler)
        if (usersCount === 0) return;

        // Ürünün fiyatını paylaşan kişi sayısına böl
        const splitAmount = item.price / usersCount;

        // 2. Ürünü paylaşan kişilerin borcuna bu rakamı ekle
        item.assignedUserIds.forEach(userIdObj => {
            const debtorId = userIdObj.toString();

            // Kendi kendine borçlanma kontrolü: Ödeyen kişi ürünü yediyse atla
            if (debtorId === creditorId) return;

            // Mevcut borcu bul, üzerine yeni payı ekle ve deftere yaz
            const currentDebt = debtMap.get(debtorId) || 0;
            debtMap.set(debtorId, currentDebt + splitAmount);
        });
    });

    // 3. Hesap defterini OpenAPI (DebtCalculation) sözleşmene uygun diziye çevir
    const results = [];
    debtMap.forEach((amount, debtorId) => {
        results.push({
            debtorId: debtorId,
            creditorId: creditorId,
            // Küsüratları virgülden sonra 2 haneye yuvarla (Örn: 33.33)
            amount: parseFloat(amount.toFixed(2)) 
        });
    });

    return results; // Temiz listeyi geri döndür
};