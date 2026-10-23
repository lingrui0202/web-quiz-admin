import request from './request'

// 后端的字段和页面用的字段不一样，转换集中放这里，视图里就不用关心接口长什么样。
//
// 后端（quiz-java）：{ id, category, content, optionA..optionD, answer, createdAt, options[] }
// 页面：            { id, category, title, options[4], answer }

const LABELS = ['A', 'B', 'C', 'D']

export function fromApi(q) {
  return {
    id: q.id,
    category: q.category || '',
    title: q.content,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    answer: q.answer
  }
}

export function toApi(form) {
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

export function labelsOf() {
  return LABELS.slice()
}

// 查询：后端支持 keyword / category 两个过滤条件
export async function listQuestions(params = {}) {
  const rows = await request.get('/questions', { params })
  return rows.map(fromApi)
}

export async function createQuestion(form) {
  return fromApi(await request.post('/questions', toApi(form)))
}

export async function updateQuestion(id, form) {
  return fromApi(await request.put(`/questions/${id}`, toApi(form)))
}

export async function removeQuestion(id) {
  return request.delete(`/questions/${id}`)
}

export async function questionStats() {
  return request.get('/questions/stats')
}
