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

**密码这块说明一下**：后端永远不返回密码（`passwordHash` 标了 `WRITE_ONLY`），所以列表页"密码"列显示的是「已加密」标签，不是没做完。**新增用户要输两遍密码**，两次不一致会被表单拦住；编辑时密码留空表示不改密码。

## 没有后端也能用（离线演示模式）

`src/api/fallback.js` 里放了一份内存数据。**接口调不通时自动切过去**，页面顶部会出现一条蓝色提示条说明当前是离线模式，增删改都在内存里生效（刷新还原）。

这样做的原因：线上是纯静态部署，没有后端；如果直接请求 `/api` 会 404，页面就变成空白、"新增"按钮点了也没反应。有了这层回退，老师打开链接就能把用户管理、题目管理的增删改查完整点一遍。

判断规则在 `src/api/request.js`：后端有响应且是业务错误（4xx 且 `code:1`）就原样抛给页面；连不上、超时、404 都算离线，切回退数据。

## 用真实接口的完整链路

```
浏览器 → :8080 (vue dev server) → /api 代理 → :8081 (quiz-java) → MySQL quiz_db
```

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

后端没起来也能开发：页面会自动进入离线演示模式，顶部有蓝色提示条。

## 部署

线上 <https://web-quiz-admin.vercel.app> 部署的是 `web-quiz-admin-dist` 仓库（只放编译产物，不含源码）。

### 现在的流程

```bash
npm run build                          # 生成 dist
# 把 dist 内容同步到 web-quiz-admin-dist 仓库后提交推送，Vercel 会自动重新部署
```

Framework Preset 选 **Other**，不需要构建命令（产物仓库里已经是编译好的文件）。

### 为什么静态站也能用

因为接口调不通会自动切 `src/api/fallback.js` 里的内存数据（见上文「离线演示模式」）。等后端上了公网，把 `src/api/request.js` 的 `baseURL` 改成公网地址、重新 build 即可，页面逻辑不用动。

> 坑：`npm run serve` 对有 lint 问题的代码只是 warning，但 `npm run build` 会直接失败。所以每次改完记得跑一次 build。

