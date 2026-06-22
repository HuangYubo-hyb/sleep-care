const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let db = null;
let SQL = null;

const DB_FILE_PATH = path.join(__dirname, '../../sleep_care.db');

async function getDb() {
    if (db) {
        return db;
    }

    if (!SQL) {
        SQL = await initSqlJs({
            locateFile: file => `node_modules/sql.js/dist/${file}`
        });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
        const data = fs.readFileSync(DB_FILE_PATH);
        db = new SQL.Database(new Uint8Array(data));
    } else {
        db = new SQL.Database();
        await saveDb();
    }

    return db;
}

function saveDb() {
    if (!db) {
        throw new Error('Database not initialized. Call getDb() first.');
    }

    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
}

module.exports = {
    getDb,
    saveDb
};
