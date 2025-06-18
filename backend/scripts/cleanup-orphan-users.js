// Script para limpar usuários órfãos do Firebase Auth
// Usuários que existem no Auth mas não têm perfil no Firestore

const admin = require('firebase-admin');
const path = require('path');

// Configurar Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '../src/config/credencialFirebase.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function cleanupOrphanUsers() {
  try {
    console.log('🔍 Iniciando busca por usuários órfãos...');
    
    // Listar todos os usuários do Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    const authUsers = listUsersResult.users;
    
    console.log(`📊 Total de usuários no Auth: ${authUsers.length}`);
    
    const orphanUsers = [];
    const validUsers = [];
    
    // Verificar cada usuário do Auth no Firestore
    for (const authUser of authUsers) {
      const userRef = db.collection('users').doc(authUser.uid);
      const doc = await userRef.get();
      
      if (!doc.exists) {
        orphanUsers.push({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          createdAt: authUser.metadata.creationTime,
          lastSignInTime: authUser.metadata.lastSignInTime
        });
      } else {
        validUsers.push({
          uid: authUser.uid,
          email: authUser.email
        });
      }
    }
    
    console.log(`✅ Usuários válidos: ${validUsers.length}`);
    console.log(`❌ Usuários órfãos encontrados: ${orphanUsers.length}`);
    
    if (orphanUsers.length === 0) {
      console.log('🎉 Nenhum usuário órfão encontrado!');
      return;
    }
    
    // Mostrar usuários órfãos
    console.log('\n📋 Usuários órfãos:');
    orphanUsers.forEach((user, index) => {
      console.log(`${index + 1}. UID: ${user.uid}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nome: ${user.displayName || 'N/A'}`);
      console.log(`   Criado em: ${user.createdAt}`);
      console.log(`   Último login: ${user.lastSignInTime}`);
      console.log('');
    });
    
    // Perguntar se deve deletar (simular confirmação)
    console.log('⚠️  ATENÇÃO: Esta operação irá deletar permanentemente os usuários órfãos do Firebase Auth!');
    console.log('💡 Para executar a limpeza, descomente as linhas de código no final deste script.');
    
    // DESCOMENTE AS LINHAS ABAIXO PARA EXECUTAR A LIMPEZA
    console.log('\n🗑️  Iniciando limpeza...');
    
    for (const orphanUser of orphanUsers) {
      try {
        await admin.auth().deleteUser(orphanUser.uid);
        console.log(`✅ Usuário deletado: ${orphanUser.email} (${orphanUser.uid})`);
      } catch (error) {
        console.error(`❌ Erro ao deletar usuário ${orphanUser.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  }
}

// Executar o script
cleanupOrphanUsers()
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }); 