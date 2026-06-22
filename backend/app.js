require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { initDatabase } = require('./db/init');
const { getDb, saveDb } = require('./db/connection');

const JWT_SECRET = 'sleep-care-secret-key-2026';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function dbGetOne(db, sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
}

function dbGetAll(db, sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

app.get('/', (req, res) => {
    res.json({
        code: 0,
        message: 'success',
        data: {
            service: 'sleep-care-api',
            status: 'running',
            timestamp: new Date().toISOString()
        }
    });
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { phone, password, nickname } = req.body;

        if (!phone || !password) {
            return res.json({
                code: 400,
                message: '手机号和密码不能为空',
                data: null
            });
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.json({
                code: 400,
                message: '手机号格式不正确',
                data: null
            });
        }

        if (password.length < 6) {
            return res.json({
                code: 400,
                message: '密码长度不能少于6位',
                data: null
            });
        }

        const db = await getDb();

        const existingUser = dbGetOne(db, 'SELECT * FROM users WHERE phone = ?', [phone]);
        if (existingUser) {
            return res.json({
                code: 400,
                message: '该手机号已注册',
                data: null
            });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const now = new Date().toISOString();
        
        const userNickname = nickname || `用户${phone.slice(-4)}`;

        try {
            db.run(
                'INSERT INTO users (phone, password_hash, nickname, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [phone, passwordHash, userNickname, 'patient', 1, now, now]
            );

            await saveDb();

            const newUser = dbGetOne(db, 'SELECT id, phone, nickname, role FROM users WHERE phone = ?', [phone]);

            res.json({
                code: 0,
                message: '注册成功',
                data: newUser
            });
        } catch (error) {
            if (error.message && error.message.includes('UNIQUE')) {
                return res.json({
                    code: 400,
                    message: '该手机号已注册',
                    data: null
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.json({
                code: 400,
                message: '手机号和密码不能为空',
                data: null
            });
        }

        const db = await getDb();

        const user = dbGetOne(db, 'SELECT * FROM users WHERE phone = ?', [phone]);
        if (!user) {
            return res.json({
                code: 400,
                message: '用户不存在，请先注册',
                data: null
            });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            return res.json({
                code: 400,
                message: '密码错误',
                data: null
            });
        }

        if (user.status !== 1) {
            return res.json({
                code: 400,
                message: '账号已被禁用',
                data: null
            });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const now = new Date().toISOString();
        db.run('UPDATE users SET updated_at = ? WHERE id = ?', [now, user.id]);
        await saveDb();

        res.json({
            code: 0,
            message: '登录成功',
            data: {
                token,
                id: user.id,
                phone: user.phone,
                nickname: user.nickname,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }
});

async function startServer() {
    try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('Database initialized successfully');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
