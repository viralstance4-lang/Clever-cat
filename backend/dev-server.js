// Local-only convenience runner: spins up an in-memory MongoDB (no install,
// no admin rights, no system service) so the app is demoable before real
// MongoDB Atlas credentials exist. Data resets every time this process
// restarts — swap MONGO_URI in .env for a real database when ready and use
// `npm run dev` / `npm start` instead.
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create({ instance: { dbName: 'clevercat' } });
  process.env.MONGO_URI = mongod.getUri('clevercat');
  console.log(`[dev:memory] In-memory MongoDB started — data will NOT persist after this process stops.`);

  const seed = require('./src/scripts/seed');
  await seed();
  console.log('[dev:memory] Sample products + admin user seeded.');

  require('./server.js');
})();
