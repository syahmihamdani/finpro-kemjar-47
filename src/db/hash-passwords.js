// Script to generate bcrypt hashes for default passwords
const bcrypt = require('bcryptjs');

const password = 'password123';

async function generateHashes() {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('\nUse this hash in schema.sql for all default users');
}

generateHashes();

