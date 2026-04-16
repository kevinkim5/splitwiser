import { Balance, SimplifiedDebt } from '@/types'

export function calculateBalances(
  expenses: {
    paid_by_id: string
    amount: number | string
    splits: { user_id: string; amount: number | string }[]
  }[],
  settlements: {
    payer_id: string
    receiver_id: string
    amount: number | string
  }[],
  members: { userId: string; name: string }[],
): Balance[] {
  const balanceMap: Record<string, number> = {}

  for (const m of members) {
    balanceMap[m.userId] = 0
  }

  for (const expense of expenses) {
    const paid = Number(expense.amount)
    balanceMap[expense.paid_by_id] = (balanceMap[expense.paid_by_id] || 0) + paid

    for (const split of expense.splits) {
      balanceMap[split.user_id] =
        (balanceMap[split.user_id] || 0) - Number(split.amount)
    }
  }

  for (const settlement of settlements) {
    balanceMap[settlement.payer_id] =
      (balanceMap[settlement.payer_id] || 0) + Number(settlement.amount)
    balanceMap[settlement.receiver_id] =
      (balanceMap[settlement.receiver_id] || 0) - Number(settlement.amount)
  }

  return members.map((m) => ({
    userId: m.userId,
    name: m.name,
    amount: Math.round((balanceMap[m.userId] || 0) * 100) / 100,
  }))
}

export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
  const transactions: SimplifiedDebt[] = []

  const debtors: { id: string; name: string; amount: number }[] = []
  const creditors: { id: string; name: string; amount: number }[] = []

  for (const b of balances) {
    if (b.amount < -0.01) {
      debtors.push({ id: b.userId, name: b.name, amount: -b.amount })
    } else if (b.amount > 0.01) {
      creditors.push({ id: b.userId, name: b.name, amount: b.amount })
    }
  }

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)
    const rounded = Math.round(amount * 100) / 100

    if (rounded > 0.01) {
      transactions.push({
        from: debtor.id,
        fromName: debtor.name,
        to: creditor.id,
        toName: creditor.name,
        amount: rounded,
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return transactions
}
