import request from './request'
import {
  state,
  markOffline,
  isOffline,
  offlineQuestions,
  addOfflineQuestion,
  updateOfflineQuestion,
  removeOfflineQuestion
} from './fallback'

export { isOffline }

// 字段转换：后端是 content / optionA~D，页面用 title / options[]。
// 转换只放在这里，视图不用关心接口长什么样。
function fromApi(q) {
  return {
    id: q.id,
    category: q.category || '',
    title: q.content,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    answer: q.answer
  }
}

function toApi(form) {
  const options = form.options || []
  return {
    id: form.id || undefined,
    category: form.category || 'UNCATEGORIZED',
    content: form.title,
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    answer: form.answer
  }
}

// 调真实接口；连不上就切离线演示数据，并把 offline 标记设上。
// 业务错误（400）原样抛出，不当成离线。
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

const LABELS = ['A', 'B', 'C', 'D']

export function labels() {
  return LABELS.slice()
}

export function listQuestions(params = {}) {
  return withFallback(
    async () => {
      const rows = await request.get('/questions', { params })
      return rows.map(fromApi)
    },
    () => {
      const keyword = (params.keyword || '').trim().toLowerCase()
      const rows = keyword
        ? offlineQuestions.filter(item => item.title.toLowerCase().indexOf(keyword) !== -1)
        : offlineQuestions
      return rows.map(item => JSON.parse(JSON.stringify(item)))
    }
  )
}

export function createQuestion(form) {
  return withFallback(
    async () => fromApi(await request.post('/questions', toApi(form))),
    () => addOfflineQuestion(JSON.parse(JSON.stringify({
      category: form.category,
      title: form.title,
      options: form.options,
      answer: form.answer
    })))
  )
}

export function updateQuestion(id, form) {
  return withFallback(
    async () => fromApi(await request.put(`/questions/${id}`, toApi(form))),
    () => updateOfflineQuestion(id, JSON.parse(JSON.stringify({
      category: form.category,
      title: form.title,
      options: form.options,
      answer: form.answer
    })))
  )
}

export function removeQuestion(id) {
  return withFallback(
    () => request.delete(`/questions/${id}`),
    () => removeOfflineQuestion(id)
  )
}
