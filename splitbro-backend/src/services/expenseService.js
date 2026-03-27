exports.calculateDebtsForExpense = (expense) => {
    const creditorId = expense.paidById.toString();
    
    const debtMap = new Map();

    expense.items.forEach(item => {
        const usersCount = item.assignedUserIds.length;
        
        if (usersCount === 0) return;

        const splitAmount = item.price / usersCount;

        item.assignedUserIds.forEach(userIdObj => {
            const debtorId = userIdObj.toString();

            if (debtorId === creditorId) return;

            const currentDebt = debtMap.get(debtorId) || 0;
            debtMap.set(debtorId, currentDebt + splitAmount);
        });
    });

    const results = [];
    debtMap.forEach((amount, debtorId) => {
        results.push({
            debtorId: debtorId,
            creditorId: creditorId,
            amount: parseFloat(amount.toFixed(2)) 
        });
    });

    return results;
};