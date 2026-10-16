const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 用相对路径打包，部署到 Vercel 上直接打开就行
  publicPath: './',
  productionSourceMap: false
})
