import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 try {
  const { groupId, date, amount, payer, participants, description } = req.body

  if (!groupId || !date || !amount || !payer || !participants || !description) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const createRes = await prisma.transactions.create({
    data: {
      group_id: Number(groupId),
      date: new Date(date),
      amount,
      payer,
      participants,
      description,
    },
  })
  const transaction = {
    ...createRes,
    id: Number(createRes.id),
    group_id: Number(createRes.group_id)
  }

  return res.status(200).json(transaction)
 } catch(err) {
  console.error(err)
  return res.status(500).json({ error: 'Internal server error' })
 }

}
