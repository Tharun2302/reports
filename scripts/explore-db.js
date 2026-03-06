const { MongoClient } = require('mongodb');

const uri = 'mongodb://tharun:X6akpDpbpplogp4kpmlb8345@67.207.160.66:16560/admin';

async function exploreDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!\n');
    
    // Connect to cloudfuze database
    const db = client.db('cloudfuze');
    const collections = await db.listCollections().toArray();
    console.log('=== Collections in cloudfuze database ===');
    collections.forEach(col => console.log(`- ${col.name}`));
    console.log('\n');
    
    // Explore each collection (first 10)
    for (const col of collections.slice(0, 10)) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      console.log(`\n=== Collection: ${col.name} (${count} documents) ===`);
      
      const sample = await collection.findOne();
      if (sample) {
        console.log('Sample document keys:', Object.keys(sample));
        console.log('Sample document:', JSON.stringify(sample, null, 2).substring(0, 2000));
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

exploreDatabase();
