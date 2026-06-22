const { getDb } = require('./connection');

const CREATE_TABLE_USERS = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone VARCHAR(20) NOT NULL UNIQUE,
    nickname VARCHAR(100) DEFAULT '',
    avatar_url VARCHAR(500) DEFAULT '',
    password_hash VARCHAR(255) DEFAULT '',
    wx_openid VARCHAR(100) UNIQUE,
    role VARCHAR(20) DEFAULT 'patient',
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

const CREATE_TABLE_DEVICES = `
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50),
    device_sn VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'offline',
    temperature REAL DEFAULT 0,
    humidity REAL DEFAULT 0,
    noise_level REAL DEFAULT 0,
    last_sync_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const CREATE_TABLE_SLEEP_REPORTS = `
CREATE TABLE IF NOT EXISTS sleep_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    report_date DATE NOT NULL,
    total_sleep_minutes INTEGER DEFAULT 0,
    deep_sleep_minutes INTEGER DEFAULT 0,
    light_sleep_minutes INTEGER DEFAULT 0,
    rem_sleep_minutes INTEGER DEFAULT 0,
    sleep_score INTEGER DEFAULT 0,
    sleep_stages TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, report_date)
);
`;

const CREATE_TABLE_USER_SETTINGS = `
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    wake_up_time TIME,
    sleep_time TIME,
    noise_threshold INTEGER DEFAULT 50,
    temp_min INTEGER DEFAULT 18,
    temp_max INTEGER DEFAULT 28,
    humidity_min INTEGER DEFAULT 30,
    humidity_max INTEGER DEFAULT 70,
    notification_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const CREATE_TABLE_DOCTOR_AUTHORIZATIONS = `
CREATE TABLE IF NOT EXISTS doctor_authorizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    doctor_id VARCHAR(50),
    hospital VARCHAR(200),
    department VARCHAR(100),
    status INTEGER DEFAULT 0,
    authorized_at DATETIME,
    revoked_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_reports_user_id ON sleep_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_reports_report_date ON sleep_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_doctor_authorizations_user_id ON doctor_authorizations(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_authorizations_status ON doctor_authorizations(status);
`;

async function initSchema() {
    const db = await getDb();
    
    db.run(CREATE_TABLE_USERS);
    db.run(CREATE_TABLE_DEVICES);
    db.run(CREATE_TABLE_SLEEP_REPORTS);
    db.run(CREATE_TABLE_USER_SETTINGS);
    db.run(CREATE_TABLE_DOCTOR_AUTHORIZATIONS);
    
    const indexStatements = CREATE_INDEXES.trim().split(';').filter(s => s.trim());
    indexStatements.forEach(stmt => {
        if (stmt.trim()) {
            db.run(stmt);
        }
    });
    
    console.log('Database schema initialized successfully');
}

module.exports = {
    initSchema
};
