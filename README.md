<div align="center">

# 🍳 Cookbook Frontend

### 基于 DeepSeek Cookbook Agent 的 AI 智能问答应用

[![Vue](https://img.shields.io/badge/Vue-3.4.21-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.8-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.6.3-409eff?logo=element&logoColor=white)](https://element-plus.org/)
[![Pinia](https://img.shields.io/badge/Pinia-2.1.7-ffd859?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![License](https://img.shields.io/badge/License-Educational-green)](LICENSE)

[✨ 特性](#-核心特性) • [🚀 快速开始](#-快速开始) • [📖 文档](#-项目架构) • [🤝 贡献](#-贡献)

</div>

---

## 📖 项目简介

**Cookbook Frontend** 是一个现代化的 AI 对话应用前端项目，采用 **Vue 3 生态体系**精心构建。该应用为用户提供流畅的 AI 交互体验，支持**智能对话**、**会话管理**、**实时流式响应**等核心功能。

### ✨ 核心特性

<table>
<tr>
<td width="50%">

🤖 **双模式对话**
- Ask 模式：快速问答
- Agent 模式：智能助手

🎨 **主题切换**
- 深色/浅色主题
- 平滑过渡动画

</td>
<td width="50%">

⚡ **实时流式响应**
- SSE 技术支持
- 打字机效果展示

💬 **会话管理**
- 多会话支持
- 历史记录持久化

</td>
</tr>
</table>

### 🎯 技术亮点

- 🚀 **Vite 构建** - 极速开发体验，HMR 毫秒级响应
- 📦 **按需导入** - Element Plus 组件自动按需加载，减小包体积
- 🔄 **SSE 流式传输** - 实时 AI 响应，优雅的交互体验
- 💾 **状态持久化** - 自定义 Pinia 插件，会话数据本地化
- 🎨 **Markdown 渲染** - 支持代码高亮的富文本展示
- 🔐 **安全防护** - Token 认证 + 开发者工具检测

---

## 📚 目录

- [项目架构](#️-项目架构)
  - [技术栈](#-技术栈)
  - [目录结构](#-目录结构)
- [核心功能模块](#-核心功能模块)
- [数据流架构](#-数据流架构)
- [核心技术实现](#️-核心技术实现)
- [快速开始](#-快速开始)
- [环境配置](#-环境配置)
- [安全特性](#-安全特性)
- [代码规范](#-代码规范)
- [主题定制](#-主题定制)
- [与后端对接](#-与后端对接)
- [构建优化](#-构建优化)
- [常见问题](#-常见问题)
- [后续优化方向](#-后续优化方向)

---

## 🏗️ 项目架构

### 📦 技术栈

<table>
<thead>
<tr>
<th width="25%">技术</th>
<th width="15%">版本</th>
<th width="60%">用途</th>
</tr>
</thead>
<tbody>
<tr>
<td><img src="https://img.shields.io/badge/Vue-42b883?logo=vue.js&logoColor=white" alt="Vue" /> <strong>Vue</strong></td>
<td><code>^3.4.21</code></td>
<td>渐进式前端框架，核心 UI 层</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white" alt="Vite" /> <strong>Vite</strong></td>
<td><code>^5.2.8</code></td>
<td>新一代前端构建工具，极速开发体验</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Vue_Router-42b883?logo=vue.js&logoColor=white" alt="Vue Router" /> <strong>Vue Router</strong></td>
<td><code>^4.3.0</code></td>
<td>官方路由管理器，页面导航</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Pinia-ffd859?logo=pinia&logoColor=black" alt="Pinia" /> <strong>Pinia</strong></td>
<td><code>^2.1.7</code></td>
<td>新一代状态管理库，替代 Vuex</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Element_Plus-409eff?logo=element&logoColor=white" alt="Element Plus" /> <strong>Element Plus</strong></td>
<td><code>^2.6.3</code></td>
<td>Vue 3 组件库，UI 组件</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Axios-5a29e4?logo=axios&logoColor=white" alt="Axios" /> <strong>Axios</strong></td>
<td><code>^1.6.8</code></td>
<td>HTTP 请求库，API 通信</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Marked-000000?logo=markdown&logoColor=white" alt="Marked" /> <strong>Marked</strong></td>
<td><code>^12.0.1</code></td>
<td>Markdown 解析器，富文本渲染</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Highlight.js-e34c26?logo=javascript&logoColor=white" alt="Highlight.js" /> <strong>Highlight.js</strong></td>
<td><code>^11.9.0</code></td>
<td>代码语法高亮库</td>
</tr>
<tr>
<td>🔌 <strong>EventSource Polyfill</strong></td>
<td><code>^1.0.31</code></td>
<td>SSE 流式传输支持，跨浏览器兼容</td>
</tr>
</tbody>
</table>

### 目录结构

```
cookbook-fronted/
├── src/
│   ├── api/                    # API 接口层
│   │   ├── auth.js            # 用户认证接口
│   │   ├── chat.js            # 聊天相关接口（普通/SSE流式）
│   │   ├── registerCode.js    # 注册码接口
│   │   └── user.js            # 用户信息接口
│   │
│   ├── components/            # 组件层
│   │   ├── Chat/             # 聊天组件
│   │   │   ├── ChatPanel.vue      # 聊天面板主组件
│   │   │   └── MessageItem.vue    # 消息项组件
│   │   ├── Settings/         # 设置组件
│   │   │   └── SettingsDialog.vue # 设置对话框
│   │   └── Sidebar/          # 侧边栏组件
│   │       ├── index.vue          # 侧边栏主组件
│   │       ├── ConversationItem.vue # 会话列表项
│   │       └── UserInfo.vue       # 用户信息展示
│   │
│   ├── views/                # 视图层（页面级组件）
│   │   ├── Home.vue          # 主页（聊天界面）
│   │   ├── Login.vue         # 登录页
│   │   └── Register.vue      # 注册页
│   │
│   ├── stores/               # 状态管理（Pinia）
│   │   ├── index.js          # Store 主入口（含持久化插件）
│   │   ├── app.js            # 应用全局状态（主题等）
│   │   ├── chat.js           # 聊天状态（会话、消息）
│   │   └── user.js           # 用户状态（登录、用户信息）
│   │
│   ├── router/               # 路由配置
│   │   └── index.js          # 路由定义及守卫
│   │
│   ├── utils/                # 工具函数
│   │   ├── request.js        # Axios 请求封装
│   │   ├── storage.js        # 本地存储封装
│   │   ├── common.js         # 通用工具函数
│   │   └── devtools-detector.js # 开发者工具检测
│   │
│   ├── styles/               # 全局样式
│   │   ├── index.scss        # 样式入口
│   │   ├── reset.scss        # 样式重置
│   │   ├── variables.scss    # CSS 变量定义
│   │   ├── theme.scss        # 主题样式
│   │   └── highlight.scss    # 代码高亮样式
│   │
│   ├── App.vue               # 根组件
│   └── main.js               # 应用入口
│
├── public/                   # 静态资源
│   └── favicon.ico
│
├── dist/                     # 构建输出目录
├── vite.config.js           # Vite 配置
├── package.json             # 项目依赖配置
└── jsconfig.json            # JavaScript 配置

```

## 🎯 核心功能模块

### 1. 用户认证模块

**文件位置**：`src/views/Login.vue`, `src/views/Register.vue`, `src/api/auth.js`, `src/stores/user.js`

**功能说明**：
- 用户注册（支持注册码验证）
- 用户登录（Token 认证）
- 用户登出
- 自动获取用户信息
- Token 持久化存储

**技术实现**：
- 使用 Pinia 管理用户状态
- localStorage 持久化 Token
- 路由守卫实现登录验证

### 2. 会话管理模块

**文件位置**：`src/stores/chat.js`, `src/components/Sidebar/`

**功能说明**：
- 创建新会话
- 切换会话
- 删除会话
- 会话历史持久化
- 自动生成会话标题（基于首条消息）
- 会话列表排序（按更新时间）

**技术实现**：
- Pinia 状态管理
- 自定义持久化插件（localStorage）
- UUID 生成会话 ID
- 会话消息按 conversationId 分组存储

### 3. 聊天交互模块

**文件位置**：`src/components/Chat/`, `src/api/chat.js`

**功能说明**：
- 两种聊天模式：
  - **Ask 模式**：简单问答，无上下文记忆
  - **Agent 模式**：智能助手，具备上下文记忆和工具调用能力
- SSE 流式响应（实时打字效果）
- Markdown 渲染（支持代码块高亮）
- 消息历史展示
- 发送中状态管理

**技术实现**：
- EventSourcePolyfill 实现 SSE 流式传输
- Marked.js 解析 Markdown
- Highlight.js 实现代码语法高亮
- 自定义事件监听（thinking、content）
- 超时重连机制

### 4. 主题切换模块

**文件位置**：`src/stores/app.js`, `src/styles/theme.scss`

**功能说明**：
- 深色/浅色主题切换
- 主题持久化
- 全局 CSS 变量驱动

**技术实现**：
- CSS 变量（`--bg-primary`, `--text-color` 等）
- `data-theme` 属性控制主题
- Element Plus 深色模式支持

### 5. 设置管理模块

**文件位置**：`src/components/Settings/SettingsDialog.vue`

**功能说明**：
- 用户信息展示
- 个人设置调整
- 主题切换
- 系统配置

## 🔄 数据流架构

```
┌─────────────┐
│   View 层   │ ← 用户交互界面
│  (*.vue)    │
└──────┬──────┘
       │
       ↓ dispatch actions
┌─────────────┐
│  Store 层   │ ← 状态管理（Pinia）
│ (stores/)   │
└──────┬──────┘
       │
       ↓ call API
┌─────────────┐
│   API 层    │ ← 接口封装
│   (api/)    │
└──────┬──────┘
       │
       ↓ HTTP/SSE
┌─────────────┐
│  后端服务   │ ← Spring Boot 后端
│ (Port 8000) │
└─────────────┘
```

### 数据流说明

1. **View → Store**：用户操作触发 Store 的 Actions
2. **Store → API**：Actions 调用 API 层发起请求
3. **API → Backend**：通过 Axios 或 EventSource 与后端通信
4. **Backend → API → Store**：响应数据更新 Store 状态
5. **Store → View**：响应式数据自动更新 UI

## 🛠️ 核心技术实现

### 1. Vite 配置特性

**文件位置**：`vite.config.js`

```javascript
// 核心配置
{
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia']  // 自动导入
    }),
    Components({
      resolvers: [ElementPlusResolver()]        // 组件按需导入
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')            // 路径别名
    }
  },
  
  server: {
    port: 3030,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',        // 后端代理
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      }
    }
  }
}
```

**特点**：
- Element Plus 按需自动导入（减小打包体积）
- Vue/Pinia/Router 自动导入（无需手动 import）
- API 代理转发（解决跨域问题）

### 2. SSE 流式传输实现

**文件位置**：`src/api/chat.js`

**核心机制**：
```javascript
// 使用 EventSourcePolyfill 实现跨域 SSE
const eventSource = new EventSourcePolyfill(url, {
  heartbeatTimeout: 120000,
  withCredentials: true
})

// 监听自定义事件
eventSource.addEventListener('thinking', callback)  // 思考过程
eventSource.addEventListener('content', callback)   // 总结内容
```

**特点**：
- Token 通过 URL 参数传递（SSE 不支持自定义 Header）
- 自动超时重连（180 秒）
- 区分 thinking 和 content 事件
- 完善的错误处理机制

### 3. Pinia 状态持久化

**文件位置**：`src/stores/index.js`

**实现原理**：
```javascript
// 自定义持久化插件
pinia.use(({ store, options }) => {
  const persistConfig = options.persist
  if (persistConfig?.enabled) {
    // 从 localStorage 恢复状态
    const savedState = storage.getItem(key)
    store.$patch(JSON.parse(savedState))
    
    // 监听变化并保存
    store.$subscribe(() => {
      storage.setItem(key, JSON.stringify(state))
    })
  }
})
```

**特点**：
- 支持选择性持久化（paths 配置）
- 自动恢复和保存
- 轻量级实现（无外部依赖）

### 4. 路由守卫机制

**文件位置**：`src/router/index.js`

**实现逻辑**：
```javascript
router.beforeEach((to, from, next) => {
  // 1. 设置页面标题
  document.title = to.meta.title || 'Cookbook AI'
  
  // 2. 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (tokenManager.hasToken()) {
      next()  // 已登录，放行
    } else {
      next('/login')  // 未登录，跳转登录页
    }
  }
  
  // 3. 已登录用户访问登录页，跳转首页
  if ((to.path === '/login' || to.path === '/register') && tokenManager.hasToken()) {
    next('/')
  }
})
```

### 5. 请求拦截器

**文件位置**：`src/utils/request.js`

**功能**：
- 自动添加 Token 到请求头
- 统一错误处理
- 401 自动跳转登录
- 请求/响应日志记录

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

应用将运行在 `http://localhost:3030`

### 生产环境构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录

### 预览构建结果

```bash
npm run preview
```

## 🌐 环境配置

### 开发环境

- 前端端口：`3030`
- 后端代理：`http://localhost:8000`
- API 前缀：`/api/v1`

### 生产环境

需要配置环境变量 `VITE_APP_BASE_API`，指向后端服务地址。

## 🔒 安全特性

### 1. Token 认证
- JWT Token 存储在 localStorage
- 每次请求自动携带 Token
- Token 失效自动跳转登录页

### 2. 开发者工具检测
- 生产环境启用（`import.meta.env.PROD`）
- 检测开发者工具打开状态
- 可配置禁用右键菜单和快捷键

### 3. 路由权限控制
- 路由守卫验证登录状态
- 未登录自动跳转登录页
- 支持登录后重定向

## 📝 代码规范

### 组件命名
- 单文件组件使用 PascalCase：`ChatPanel.vue`
- 组件实例使用 camelCase：`<chat-panel>`

### API 命名
- RESTful 风格
- 动词+名词组合：`getUserInfo()`, `createConversation()`

### Store 命名
- 使用 `use` 前缀：`useUserStore()`, `useChatStore()`
- State 使用名词，Actions 使用动词

### 样式管理
- 使用 SCSS 预处理器
- CSS 变量统一管理主题
- BEM 命名规范（可选）

## 🎨 主题定制

项目使用 CSS 变量实现主题切换，可在 `src/styles/variables.scss` 中自定义：

```scss
// 浅色主题
[data-theme='light'] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-color: #333333;
  --border-color: #e0e0e0;
  // ...
}

// 深色主题
[data-theme='dark'] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-color: #e0e0e0;
  --border-color: #3d3d3d;
  // ...
}
```

## 🤝 与后端对接

### API 接口规范

**后端基础地址**：`http://localhost:8000/api/v1`

**主要接口**：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/auth/login` | POST | 用户登录 |
| `/auth/register` | POST | 用户注册 |
| `/auth/info` | GET | 获取用户信息 |
| `/chat/simple` | GET | 简单问答 |
| `/chat/memory` | GET | 记忆对话 |
| `/agent/yicook` | GET | Agent 对话 |
| `/chat/simple/stream/sse` | GET | 简单问答（SSE 流式） |
| `/chat/memory/stream/sse` | GET | 记忆对话（SSE 流式） |
| `/agent/yicook/stream/sse` | GET | Agent 对话（SSE 流式） |
| `/chat/memory/{id}` | DELETE | 清除会话记忆 |
| `/chat/memory/list` | GET | 获取会话列表 |

**SSE 事件类型**：
- `thinking`：AI 思考过程（中间步骤）
- `content`：AI 响应内容（最终结果）

## 📦 构建优化

### 按需导入
- Element Plus 组件按需加载
- 自动导入 Vue Composition API
- Tree Shaking 减小包体积

### 代码分割
- 路由懒加载（`import()` 动态导入）
- 第三方库单独打包
- Vendor chunk 优化

### 资源优化
- CSS 提取和压缩
- 图片压缩和优化
- Gzip 压缩支持

## 🐛 常见问题

### 1. 跨域问题
**解决方案**：开发环境使用 Vite 代理，生产环境配置 Nginx 反向代理

### 2. SSE 连接失败
**可能原因**：
- Token 未正确传递
- 后端 CORS 配置问题
- 网络超时

**解决方案**：检查网络请求，确认 Token 在 URL 参数中

### 3. 状态持久化失效
**可能原因**：
- localStorage 被清空
- 浏览器隐私模式

**解决方案**：检查浏览器存储权限

## 🔮 后续优化方向

- [ ] 添加单元测试（Vitest）
- [ ] 集成 TypeScript
- [ ] 优化移动端适配
- [ ] 添加 PWA 支持
- [ ] 实现消息搜索功能
- [ ] 添加多语言支持（i18n）
- [ ] 优化 SSE 重连机制
- [ ] 增加消息导出功能

## 📄 许可证

本项目仅供学习和研究使用。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**技术支持**：如有问题，请联系开发团队或提交 Issue。

