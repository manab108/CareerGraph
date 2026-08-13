const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !user || !password) {
  console.error("CRITICAL: Missing database connection details in env variables.");
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Verify database connection
driver.getServerInfo()
  .then(info => console.log(`Connected to CognoDB: ${info.agent}`))
  .catch(err => console.error("Database connection check failed:", err.message));

async function runQuery(query, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result;
  } finally {
    await session.close();
  }
}

module.exports = {
  driver,
  runQuery
};
