const { MongoClient } = require('mongodb');
const uri = 'mongodb://tharun:X6akpDpbpplogp4kpmlb8345@67.207.160.66:16560/admin';

async function find() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('cloudfuze');
    const col = db.collection('MoveJobDetails');
    const jobs = await col.find(
      { "listOfMoveWorkspaceId.1": { $exists: true } },
      { projection: { jobName: 1, listOfMoveWorkspaceId: 1 } }
    ).limit(3).toArray();
    jobs.forEach(j => console.log(`${j.jobName}: ${j.listOfMoveWorkspaceId.length} workspaces`));
  } finally { await client.close(); }
}
find();
