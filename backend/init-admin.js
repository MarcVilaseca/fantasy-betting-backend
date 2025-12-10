import bcrypt from 'bcryptjs';
import { initDatabase, userQueries } from './config/db.js';

async function createAdminUser() {
  console.log('🔧 Inicialitzant base de dades...');
  await initDatabase();

  const adminUsername = 'admin';
  const adminPassword = 'admin123'; // CANVIAR EN PRODUCCIÓ!

  try {
    // Verificar si ja existeix
    const existing = await userQueries.findByUsername(adminUsername);
    if (existing) {
      console.log('⚠️  L\'usuari admin ja existeix');
      return;
    }

    // Crear admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await userQueries.create(adminUsername, hashedPassword, 1); // 1 = is_admin

    console.log('✅ Usuari admin creat correctament!');
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Canvia la contrasenya després del primer login!');
  } catch (error) {
    console.error('❌ Error en crear admin:', error);
  }
}

createAdminUser();
