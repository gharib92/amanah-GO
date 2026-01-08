// Test bcrypt dans un environnement similaire à Cloudflare Workers
import bcrypt from 'bcryptjs';

async function testBcrypt() {
  const password = 'password123';
  
  console.log('1) Hash du mot de passe...');
  const hash = await bcrypt.hash(password, 10);
  console.log('   Hash généré:', hash);
  console.log('   Longueur:', hash.length);
  console.log('   Commence par:', hash.substring(0, 7));
  
  console.log('\n2) Comparaison correcte...');
  const match1 = await bcrypt.compare(password, hash);
  console.log('   Match:', match1);
  
  console.log('\n3) Comparaison incorrecte...');
  const match2 = await bcrypt.compare('wrongpassword', hash);
  console.log('   Match:', match2);
  
  console.log('\n4) Test avec hash existant...');
  const existingHash = '$2b$10$H47E6Bu1filxbjO6QnCCSOavOI4hQwWETROmDUiu7LYvFEFFgJnZO';
  const match3 = await bcrypt.compare('test123', existingHash);
  console.log('   Match (test123):', match3);
}

testBcrypt().catch(console.error);
