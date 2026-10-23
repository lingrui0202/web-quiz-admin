import axios from 'axios'

// 统一的 axios 实例。
// baseURL 用相对路径 /api：开发时由 vue.config.js 的 devServer.proxy 转发到 8081，
// 部署到静态站时这个请求会失败，页面会自动切到离线演示数据（见 api/fallback.js）。
const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 把 data 直接剥出来，页面里就不用每处都写 res.data.data
request.interceptors.response.use(
  response => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) {
        return body.data
      }
      // 业务错误（参数不合法等）：打上标记，调用方不要当离线处理
      const err = new Error(body.message || '接口返回失败')
      err.business = true
      return Promise.reject(err)
    }
    return body
  },
  error => {
    const data = error.response && error.response.data
    const err = new Error(
      data && data.message ? data.message : (error.message || '网络请求失败')
    )
    // 后端有响应且是 4xx：属于业务错误；其余（连不上、404、超时）都算离线
    if (error.response && error.response.status >= 400 && error.response.status < 500 && data && data.code === 1) {
      err.business = true
    }
    return Promise.reject(err)
  }
)

export default request
