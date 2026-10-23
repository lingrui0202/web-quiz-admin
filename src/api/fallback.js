// 离线演示用的内存数据。
//
// 线上那份是纯静态站（Vercel），没有后端；直接请求 /api 会 404，
// 于是页面空白、按钮点了也没反应。所以接口调不通时自动切到这里，
// 让老师打开链接就能完整点一遍增删改查。
//
// 本地开发时后端活着，走的仍然是 quiz-java 的真实接口。

export const state = {
  offline: false
}

export function markOffline() {
  state.offline = true
}

export function isOffline() {
  return state.offline
}

const seedQuestions = [
  { category: 'HTML BASICS', title: '在 HTML 中，哪个标签用于创建最大的标题？', options: ['<heading>', '<h6>', '<h1>', '<title>'], answer: 2 },
  { category: 'HTML BASICS', title: '哪个属性可以为图片提供替代文本？', options: ['src', 'alt', 'href', 'title'], answer: 1 },
  { category: 'CSS BASICS', title: '哪个 CSS 属性用于改变文字颜色？', options: ['font-style', 'text-decoration', 'color', 'background'], answer: 2 },
  { category: 'CSS BASICS', title: '使用 Flexbox 时，哪个属性可以控制主轴方向？', options: ['align-items', 'flex-direction', 'justify-content', 'flex-wrap'], answer: 1 },
  { category: 'CSS BASICS', title: '哪个单位相对于根元素的字体大小？', options: ['px', 'em', 'rem', '%'], answer: 2 },
  { category: 'JAVASCRIPT', title: '使用哪个关键字可以声明一个不会重新赋值的变量？', options: ['var', 'let', 'const', 'static'], answer: 2 },
  { category: 'JAVASCRIPT', title: '哪个方法可以把字符串转换成整数？', options: ['parseInt()', 'toString()', 'parseFloat()', 'Number.isInteger()'], answer: 0 },
  { category: 'JAVASCRIPT', title: '哪个 DOM 方法可以根据 id 获取元素？', options: ['querySelectorAll()', 'getElementById()', 'getElementsByClassName()', 'createElement()'], answer: 1 }
]

let nextQuestionId = 9

export const offlineQuestions = seedQuestions.map((item, index) => Object.assign({ id: index + 1 }, item))

let nextUserId = 3

export const offlineUsers = [
  { id: 1, name: 'admin', email: 'admin@example.com', date: '2026-10-23' },
  { id: 2, name: 'lingrui', email: 'lingrui@example.com', date: '2026-10-23' }
]

export function addOfflineQuestion(data) {
  const row = Object.assign({ id: nextQuestionId++ }, data)
  offlineQuestions.push(row)
  return row
}

export function updateOfflineQuestion(id, data) {
  const index = offlineQuestions.findIndex(item => item.id === id)
  if (index === -1) {
    throw new Error('题目不存在')
  }
  offlineQuestions.splice(index, 1, Object.assign({ id }, data))
  return offlineQuestions[index]
}

export function removeOfflineQuestion(id) {
  const index = offlineQuestions.findIndex(item => item.id === id)
  if (index !== -1) {
    offlineQuestions.splice(index, 1)
  }
  return null
}

export function addOfflineUser(data) {
  if (offlineUsers.some(item => item.name === data.name)) {
    throw new Error('用户名已存在：' + data.name)
  }
  const row = {
    id: nextUserId++,
    name: data.name,
    email: data.email || '',
    date: new Date().toISOString().slice(0, 10)
  }
  offlineUsers.push(row)
  return row
}

export function updateOfflineUser(id, data) {
  const row = offlineUsers.find(item => item.id === id)
  if (!row) {
    throw new Error('用户不存在')
  }
  row.name = data.name
  row.email = data.email || ''
  return row
}

export function removeOfflineUser(id) {
  const index = offlineUsers.findIndex(item => item.id === id)
  if (index !== -1) {
    offlineUsers.splice(index, 1)
  }
  return null
}
