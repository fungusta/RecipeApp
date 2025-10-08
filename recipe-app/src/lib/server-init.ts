import { initializeDatabase } from './database';

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully!');
    isInitialized = true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
