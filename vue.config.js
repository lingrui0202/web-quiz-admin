const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 用相对路径打包，部署到 Vercel 上直接打开就行
  publicPath: './',
  productionSourceMap: false,

  devServer: {
    port: 8080,
    // 后端在 8081，开发时把 /api 代理过去：浏览器眼里是同源请求，不触发跨域
    // 后端那边另外也开了 CORS，两种方式都能用
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
