# web-quiz-admin

《Web 开发技术》第五次作业：Quiz 后台管理。脚手架 vue-cli 5，UI 用 Element UI 2。

- 线上地址：<https://web-quiz-admin.vercel.app>
- 仓库：<https://github.com/lingrui0202/web-quiz-admin>
- 部署产物仓库：<https://github.com/lingrui0202/web-quiz-admin-dist>

两个页面：用户管理、题目管理。侧边菜单切路由，表格都是 `el-table`，能查、增、改、删。

## 数据源：已经从本地数组换成后端接口

2026-10-23 做了前后端联调，数据现在来自 [quiz-java](https://github.com/lingrui0202/quiz-java)（Spring Boot + MyBatis + MySQL，跑在 8081）。

```
浏览器 → :8080 (vue dev server) → /api 代理 → :8081 (quiz-java) → MySQL quiz_db
```

改动：

| 文件 | 作用 |
|---|---|
| `src/api/request.js` | axios 实例，baseURL 是 `/api`；响应拦截里把 `{code,message,data}` 的 `data` 剥出来 |
| `src/api/question.js` | 题目接口 + 字段转换（后端的 `content`/`optionA~D` ↔ 页面的 `title`/`options[]`） |
| `src/api/user.js` | 用户接口 + 字段转换（`username` ↔ `name`） |
| `vue.config.js` | `devServer.proxy` 把 `/api` 转发到 `localhost:8081` |

**跨域**用了两套办法，任选其一都行：dev 走 vue proxy（浏览器眼里同源）；后端 `CorsConfig` 也开了 CORS，供别的调用方式使用。

**密码这块说明一下**：后端永远不返回密码（`passwordHash` 标了 `WRITE_ONLY`），所以列表页"密码"列显示的是「已加密」标签，不是没做完。编辑时密码留空表示不改密码。

## 怎么跑

**前置**：后端要活着。见 quiz-java 的 README，大概是：

```bash
E:\Dev\tools\mysql.bat start                    # 起 MySQL
cd E:\Dev\GitHub\lingrui0202\quiz-java
E:\Dev\tools\maven\bin\mvn spring-boot:run      # 起后端 :8081
```

**然后**：

```
npm install
npm run serve   # http://localhost:8080 ，/api 自动代理到 8081
npm run build   # 生成 dist
```

后端没起来的话，页面顶部会出现红色提示条「连不上后端：...」，不会白屏。

## 部署

### 为什么线上版本还是"本地数组"版

线上 <https://web-quiz-admin.vercel.app> 部署的是 `web-quiz-admin-dist`，那是**没有后端**的静态版——如果现在重新 build 推上去，页面会去请求 `/api/questions`，Vercel 上没有后端，直接 404。

所以要等后端也部署到公网（比如同一台 Vercel 上的 Serverless，或别的云主机），再把 `src/api/request.js` 里的 `baseURL` 改成后端公网地址，重新 build 推到 `-dist` 仓库。

### 现在的部署方式

Framework Preset 选 **Other**，Output Directory 填 `dist`，不需要构建命令（产物仓库里已经是编译好的文件）。
