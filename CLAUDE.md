# 智能睡眠环境调控设备 - 项目约束与规范

## 1. 技术栈约束

### 1.1 前端技术栈
- 框架：微信小程序原生开发
- 语言：JavaScript ES6+
- 样式：WXSS（类似CSS）
- 图标：使用微信官方图标库或自定义SVG

### 1.2 后端技术栈
- 框架：Express.js 4.x
- 语言：Node.js 18+
- 数据库：SQLite 3.x
- ORM：使用 sqlite3 原生驱动或 Sequelize
- API文档：Swagger/OpenAPI 3.0

### 1.3 工具链
- 构建工具：微信开发者工具
- 包管理：npm 8+
- 代码规范：ESLint
- 版本控制：Git

## 2. 数据库规范

### 2.1 命名规范
- 表名：使用小写英文单词，下划线分隔（如 users, sleep_reports）
- 字段名：使用小写英文单词，下划线分隔（如 user_id, created_at）
- 主键：统一使用 `id`，类型为 INTEGER，自增
- 外键：使用 `表名_id` 格式（如 user_id）

### 2.2 字段类型规范
- 字符串：使用 VARCHAR，明确长度（如 VARCHAR(100)）
- 数字：整数用 INTEGER，小数用 REAL
- 日期时间：使用 DATETIME，默认值 CURRENT_TIMESTAMP
- 布尔值：使用 INTEGER（0/1），避免使用 BOOLEAN
- 大文本：使用 TEXT

### 2.3 约束规范
- 非空约束：必填字段必须加 NOT NULL
- 唯一约束：唯一标识字段加 UNIQUE
- 外键约束：关联字段必须加 FOREIGN KEY，级联删除
- 默认值：合理设置默认值（如 status DEFAULT 1）

### 2.4 索引规范
- 外键字段必须建索引
- 频繁查询的字段建议建索引
- 复合索引根据查询场景合理创建

## 3. API设计规范

### 3.1 协议与版本
- 协议：HTTPS（生产环境）
- 版本：URL中包含版本号（如 /api/v1/users）
- 字符编码：UTF-8

### 3.2 路径命名
- 使用 RESTful 风格
- 资源名使用复数形式（如 /users, /devices）
- 路径使用小写，下划线或连字符分隔

### 3.3 HTTP方法
- GET：查询资源（单个或列表）
- POST：创建资源
- PUT：更新资源（完整替换）
- PATCH：更新资源（部分字段）
- DELETE：删除资源

### 3.4 请求格式
- Content-Type：application/json
- 参数校验：所有参数必须进行校验
- 分页：使用 page 和 limit 参数

### 3.5 响应格式
- 成功响应：{ "code": 200, "message": "success", "data": {...} }
- 失败响应：{ "code": 4xx/5xx, "message": "错误描述", "data": null }
- 统一错误码：定义全局错误码表

### 3.6 认证授权
- 使用 JWT Token 认证
- Token放在 Authorization 头中（Bearer token）
- 权限校验：根据用户角色判断访问权限

## 4. 代码规范

### 4.1 文件结构
```
├── app.js                 # 应用入口
├── routes/                # 路由定义
│   ├── users.js
│   ├── devices.js
│   └── sleep.js
├── controllers/           # 控制器
│   ├── userController.js
│   └── deviceController.js
├── models/                # 数据模型
│   ├── User.js
│   └── Device.js
├── services/              # 业务逻辑
│   ├── userService.js
│   └── sleepService.js
├── middleware/            # 中间件
│   ├── auth.js
│   └── error.js
├── config/                # 配置文件
│   └── database.js
└── utils/                 # 工具函数
    └── logger.js
```

### 4.2 命名规范
- 变量名：小驼峰命名（如 userName）
- 函数名：小驼峰命名（如 getUserById）
- 类名：大驼峰命名（如 UserController）
- 常量：全大写，下划线分隔（如 MAX_PAGE_SIZE）

### 4.3 代码风格
- 缩进：使用 4 个空格
- 语句结尾：必须加分号
- 大括号：左括号不换行
- 空行：函数之间、逻辑块之间加空行

### 4.4 错误处理
- 使用 try-catch 捕获异常
- 统一错误处理中间件
- 错误信息不暴露内部实现细节

## 5. 注释规范

### 5.1 文件头注释
```javascript
/**
 * @file 用户控制器
 * @description 处理用户相关的请求
 * @author 开发团队
 * @date 2024-01-01
 */
```

### 5.2 函数注释
```javascript
/**
 * 获取用户信息
 * @param {number} userId - 用户ID
 * @param {object} options - 选项参数
 * @param {boolean} options.includeDevices - 是否包含设备列表
 * @returns {Promise<Object>} 用户对象
 */
async function getUserById(userId, options = {}) {
    // 代码实现
}
```

### 5.3 行注释
```javascript
// 计算睡眠评分（0-100分）
const score = Math.round((deepSleepMinutes / totalMinutes) * 100);
```

### 5.4 数据库注释
- 建表语句中必须包含字段注释
- 使用 COMMENT 关键字添加中文说明

## 6. AI行为约束

### 6.1 数据隐私
- 不存储用户敏感信息（密码明文、身份证号等）
- 敏感数据传输必须加密
- 用户数据仅用于睡眠分析，不得泄露给第三方

### 6.2 数据安全
- 定期备份数据库
- 访问日志记录与审计
- SQL注入防护
- XSS攻击防护

### 6.3 AI模型使用
- 睡眠分期算法使用经过验证的模型
- 模型输出需人工验证
- 不使用未经验证的AI模型

### 6.4 合规要求
- 遵守个人信息保护法
- 提供用户数据导出和删除功能
- 明确告知用户数据使用方式

## 附录：错误码定义

| 错误码 | 含义 | 说明 |
| :--- | :--- | :--- |
| 200 | 成功 | 请求成功 |
| 400 | 请求参数错误 | 参数校验失败 |
| 401 | 未授权 | 需要登录 |
| 403 | 禁止访问 | 无权限 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 500 | 服务器错误 | 服务器内部错误 |
