import { MongoClient, MongoNotConnectedError } from "mongodb"

const uri = process.env.MONGODB_URI as string

let client: MongoClient | null = null

async function getClient() {
  if (!client) {
    if (!uri) {
      throw new Error("MONGODB_URI is not defined")
    }
    client = new MongoClient(uri)
    await client.connect()
    console.log("Connected to Database")
  }
  return client
}

async function Execute(__f: (client: MongoClient) => Promise<any>) {
  try {
    const dbClient = await getClient()
    return await __f(dbClient)
  } catch (e) {
    if (e instanceof MongoNotConnectedError) {
      client = null
      return Execute(__f)
    }
    throw e
  }
}

const Database = {
  Execute,
}

export default Database
