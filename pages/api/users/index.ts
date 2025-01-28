import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/utils/api-middleware'
import { DB_NAME, TABLES } from '@/constants'
import clientPromise from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const usersCollection = db.collection(TABLES.USERS)

    if (req.method === 'GET') {
      const users = await usersCollection.find({}).toArray()
      return res.status(200).json(users)
    } else if (req.method === 'POST') {
      // Your existing POST logic
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (err) {
    console.error(err)
  }
}

export default withAuth(handler, true)
