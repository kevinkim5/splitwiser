import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/db'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const client = await clientPromise
    const db = client.db('splitwiser') // Connect to the `splitwiser` database
    const groupsCollection = db.collection('groups') // Access the `groups` collection
    const transactions = db.collection('transactions')

    if (req.method === 'GET') {
      const { groupId } = req.query

      // Fetch a single group by ID
      if (groupId) {
        const group = await groupsCollection.findOne({
          _id: new ObjectId(groupId as string),
        })

        // Fetch transactions
        const trx = await transactions.find({ groupId: groupId }).toArray()

        if (!group) {
          return res.status(404).json({ error: 'Group not found' })
        }
        return res.status(200).json({
          ...group,
          transactions: trx,
        })
      }

      // Fetch all groups
      const groups = await groupsCollection.find({}).toArray()

      return res.status(200).json(groups)
    }

    if (req.method === 'POST') {
      const { name, members } = req.body

      if (!name || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ error: 'Invalid input' })
      }

      const newGroup = { name, members, expenses: [], createdAt: new Date() }
      const result = await groupsCollection.insertOne(newGroup)
      return res.status(201).json(result.insertedId)
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
