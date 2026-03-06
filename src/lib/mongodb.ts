import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(dbName: string = "cloudfuze"): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getJobsCollection(dbName: string = "cloudfuze") {
  const db = await getDatabase(dbName);
  return db.collection("MoveJobDetails");
}

export async function getWorkspacesCollection(dbName: string = "cloudfuze") {
  const db = await getDatabase(dbName);
  return db.collection("MoveWorkSpaces");
}

export async function getFileFolderInfoCollection(dbName: string = "cloudfuze") {
  const db = await getDatabase(dbName);
  return db.collection("FileFolderInfo");
}

export async function getHyperlinksCollection(dbName: string = "cloudfuze") {
  const db = await getDatabase(dbName);
  return db.collection("HyperLinks");
}

export async function getCollabarationDetailsCollection(dbName: string = "cloudfuze") {
  const db = await getDatabase(dbName);
  return db.collection("CollabarationDetails");
}

export async function getPermissionQueueCollection(dbName: string = "cloudfuze") {
  const db = await getDatabase(dbName);
  return db.collection("PermissionQueue");
}
