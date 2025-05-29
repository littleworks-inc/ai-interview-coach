// ==========================================
// AI Interview Coach - Analytics Setup Script
// ==========================================

const AnalyticsDB = require('./database/analytics-db');
const fs = require('fs');
const path = require('path');

async function setupAnalytics() {
  console.log('🎯 Setting up AI Interview Coach Analytics...\n');
  
  try {
    // Create database directory if it doesn't exist
    const dbDir = path.join(__dirname, 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('✅ Created database directory');
    }
    
    // Initialize analytics database
    const analyticsDB = new AnalyticsDB();
    await analyticsDB.initialize();
    
    console.log('✅ Analytics database initialized successfully');
    
    // Create enhanced tables
    console.log('📊 Creating enhanced analytics tables...');
    const enhancedSchemaPath = path.join(__dirname, 'database/enhanced-analytics-schema.sql');
    
    if (fs.existsSync(enhancedSchemaPath)) {
      const enhancedSchema = fs.readFileSync(enhancedSchemaPath, 'utf8');
      const statements = enhancedSchema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await analyticsDB.runQuery(statement);
        }
      }
      console.log('✅ Enhanced analytics tables created');
    }
    
    console.log('✅ Tables created');
    console.log('✅ Indexes created');
    
    // Test the database
    await analyticsDB.runQuery('INSERT OR IGNORE INTO sessions (session_id, created_at, first_seen, last_seen, total_events) VALUES (?, ?, ?, ?, ?)', 
      ['test-session', Date.now(), Date.now(), Date.now(), 0]);
    
    const testSession = await analyticsDB.getQuery('SELECT * FROM sessions WHERE session_id = ?', ['test-session']);
    if (testSession) {
      console.log('✅ Database test successful');
      
      // Clean up test data
      await analyticsDB.runQuery('DELETE FROM sessions WHERE session_id = ?', ['test-session']);
    }
    
    console.log('\n🎉 Enhanced Analytics setup complete!');
    console.log('📊 Dashboard: http://localhost:3000/admin/analytics?password=admin123');
    console.log('🔍 Health check: http://localhost:3000/api/analytics/health');
    console.log('💰 Now tracking: Tokens, Costs, Parsing Quality, Response Analysis\n');
    
    analyticsDB.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure SQLite3 is installed: npm install sqlite3');
    console.error('2. Check file permissions in the backend/database directory');
    console.error('3. Try deleting backend/database/analytics.db and running setup again\n');
    process.exit(1);
  }
}

// Run setup
setupAnalytics();