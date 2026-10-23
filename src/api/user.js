import request from './request'
import {
  state,
  markOffline,
  isOffline,
  offlineUsers,
  addOfflineUser,
  updateOfflineUser,
  removeOfflineUser
} from './fallback'

export { isOffline }

// 后端是 username，页面用 name。密码只往上传，从不往下读。
function fromApi(u) {
  return {
    id: u.id,
    name: u.username,
    email: u.email || '',
    date: (u.createdAt || '').slice(0, 10)
  }
}

async function withFallback(apiFn, offlineFn) {
  if (state.offline) {
    return offlineFn()
  }
  try {
    return await apiFn()
  } catch (e) {
    if (e.business) {
      throw e
    }
    markOffline()
    return offlineFn()
  }
}

export function listUsers() {
  return withFallback(
    async () => (await request.get('/users')).map(fromApi),
    () => offlineUsers.map(item => Object.assign({}, item))
  )
}

// 新增要带密码，后端会转成摘要后入库
export function createUser(form) {
  return withFallback(
    async () => fromApi(await request.post('/users', {
      username: form.name,
      passwordHash: form.password,
      email: form.email
    })),
    () => addOfflineUser({ name: form.name, email: form.email })
  )
}

// 修改时密码留空表示不改密码（后端保留原摘要）
export function updateUser(id, form) {
  return withFallback(
    async () => fromApi(await request.put(`/users/${id}`, {
      username: form.name,
      passwordHash: form.password || '',
      email: form.email
    })),
    () => updateOfflineUser(id, { name: form.name, email: form.email })
  )
}

export function removeUser(id) {
  return withFallback(
    () => request.delete(`/users/${id}`),
    () => removeOfflineUser(id)
  )
}
