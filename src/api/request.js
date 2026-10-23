import axios from 'axios'

// 统一的 axios 实例。
// baseURL 用相对路径 /api：开发时由 vue.config.js 的 devServer.proxy 转发到 8081，
// 打包部署时改成后端域名即可（见 src/api/README 里的说明）。
const request = axios.create({
  baseURL: '/api',
  timeout: 8000
})

// 响应拦截：后端统一返回 { code, message, data }，
// 这里把 data 直接剥出来，页面里就不用每处都写 res.data.data。
request.interceptors.response.use(
  response => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) {
        return body.data
      }
      return Promise.reject(new Error(body.message || '接口返回失败'))
    }
    return body
  },
  error => {
    const message = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : (error.message || '网络请求失败')
    return Promise.reject(new Error(message))
  }
)

export default request
