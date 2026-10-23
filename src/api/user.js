import request from './request'

// 后端（quiz-java）：{ id, username, email, createdAt }，永远不含密码
// 页面：            { id, name, email, date }

export function fromApi(u) {
  return {
    id: u.id,
    name: u.username,
    email: u.email || '',
    date: (u.createdAt || '').slice(0, 10)
  }
}

export async function listUsers() {
  const rows = await request.get('/users')
  return rows.map(fromApi)
}

// 新增要带密码，后端会转成摘要后入库
export async function createUser(form) {
  return fromApi(await request.post('/users', {
    username: form.name,
    passwordHash: form.password,
    email: form.email
  }))
}

// 修改时密码留空表示不改（后端会保留原摘要）
export async function updateUser(id, form) {
  return fromApi(await request.put(`/users/${id}`, {
    username: form.name,
    passwordHash: form.password || '',
    email: form.email
  }))
}

export async function removeUser(id) {
  return request.delete(`/users/${id}`)
}
