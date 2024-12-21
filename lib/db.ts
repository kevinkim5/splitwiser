import { MongoClient } from 'mongodb'

// Add this at the top of the file, before other imports
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// Extend the global object directly
const MONGODB_URI = process.env.MONGODB_URI || '' // MongoDB connection string
const options = {}

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local',
  )
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Ensure the global variable is used to store the MongoClient instance across hot reloads in development
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(MONGODB_URI, options)
  clientPromise = client.connect()
}

export default clientPromise
