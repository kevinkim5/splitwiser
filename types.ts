export type User = {
  id: string
  name: string
  mobile: string
  admin: boolean
}

export type GroupMember = {
  userId: string
  name: string
  mobile: string
}

export type Group = {
  id: string
  name: string
  members: GroupMember[]
  created_at: string
}

export type Category = {
  id: string
  name: string
  emoji: string
}

export type ExpenseSplit = {
  id: string
  user_id: string
  amount: number
  user?: { id: string; name: string }
}

export type Expense = {
  id: string
  description: string
  amount: number
  paid_by_id: string
  paid_by?: { id: string; name: string }
  date: string
  split_type: 'equal' | 'exact' | 'percentage'
  splits: ExpenseSplit[]
  group_id: string
  category_id?: string | null
  category?: Category | null
}

export type Settlement = {
  id: string
  payer_id: string
  receiver_id: string
  payer?: { id: string; name: string }
  receiver?: { id: string; name: string }
  amount: number
  date: string
  note?: string
  group_id: string
}

export type Balance = {
  userId: string
  name: string
  amount: number
}

export type SimplifiedDebt = {
  from: string
  fromName: string
  to: string
  toName: string
  amount: number
}

export type GroupActivity =
  | ({ type: 'expense' } & Expense)
  | ({ type: 'settlement' } & Settlement)
