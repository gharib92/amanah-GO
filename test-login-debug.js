import bcrypt from 'bcryptjs';

async function test() {
  const password = 'Password123!';
  
  // Hash comme dans signup
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash généré:', hash);
  
  // Compare
  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
  
  // Test avec hash existant
  const existingHash = '$2b$10$q8wGuYT/ANp77Y9YOr4JXuDMfa0Fhb.OMPf36G6xGqt3izYyQCfRW';
  const matchExisting = await bcrypt.compare('test123', existingHash);
  console.log('Match existing (test123):', matchExisting);
}

test().catch(console.error);
