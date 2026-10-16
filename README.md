# web-quiz-admin

第五次作业，Quiz 后台管理。脚手架用的是 vue-cli，UI 用 Element UI。

做了两个页面：用户管理、题目管理。侧边菜单切换路由，表格都是 el-table，能查、增、改、删。题库用的是 quiz-game 里那批本地数据，等以后做前后端联调再换成接口。

跑起来：

```
npm install
npm run serve   # http://localhost:8080
npm run build   # 生成 dist
```

dist 目录也提交在仓库里了，部署到 Vercel 时 Framework Preset 选 Other、Output Directory 填 dist 就行。
