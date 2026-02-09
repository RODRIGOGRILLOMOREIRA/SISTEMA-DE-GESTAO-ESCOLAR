import bcrypt from 'bcryptjs';

async function hashPassword() {
  const senha = '01020304';
  const hash = await bcrypt.hash(senha, 10);
  console.log('Hash bcrypt da senha "01020304":');
  console.log(hash);
}

hashPassword();
