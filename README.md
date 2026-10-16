# web-quiz-admin

第五次作业：Quiz 管理后台，用 Vue 脚手架 + Element UI 做的。

## 页面内容

两个管理页面，侧边菜单切换（vue-router）：

- 题目管理：题干关键词 + 分类查询、表格展示、分页，支持新增 / 编辑 / 删除，题目和之前 quiz-game 用的是同一批
- 用户管理：按用户名查询、分页、新增 / 编辑 / 删除

用到的 Element 组件：`el-container` 布局、`el-menu`、`el-form`、`el-table`、`el-pagination`、`el-dialog`、`el-select`、`el-radio`、`$message` / `$confirm`。

数据暂时是本地数组，后面做前后端联调的时候再接接口。

## 目录

```
src/
├── App.vue               # 整体布局：header + 侧边菜单 + 内容区
├── main.js               # 入口，引入 Element UI
├── router/index.js       # 路由：/question、/user
└── views/
    ├── QuestionView.vue  # 题目管理
    └── UserView.vue      # 用户管理
```

## 常用命令

```powershell
npm install     # 装依赖
npm run serve   # 本地开发，http://localhost:8080
npm run build   # 打包，生成 dist 目录
```

## 部署说明

源代码推在 GitHub 上，`npm run build` 生成的 dist 目录也提交在仓库里，部署到 Vercel 的时候 Framework Preset 选 Other、Output Directory 填 `dist` 就行。
