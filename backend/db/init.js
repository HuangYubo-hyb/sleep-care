const { initSchema } = require('./schema');

async function initDatabase() {
    try {
        await initSchema();
        console.log('Database initialization completed successfully');
        return true;
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

module.exports = {
    initDatabase
};
