<template>
  <div>
    <el-alert
      v-if="loadError"
      :title="'连不上后端：' + loadError"
      type="error"
      :closable="false"
      show-icon
      class="load-error">
      <div>确认 <code>quiz-java</code> 已经在 8081 跑起来，并且 MySQL 已启动。</div>
    </el-alert>

    <el-form :inline="true" :model="query" class="query-form">
      <el-form-item label="题目">
        <el-input v-model="query.keyword" placeholder="题目关键词" clearable @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="success" icon="el-icon-search" @click="handleQuery">查询题目</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAdd">添加题目</el-button>
        <el-button icon="el-icon-refresh" @click="load">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="pagedList" border stripe>
      <el-table-column prop="id" label="序号" width="70"></el-table-column>
      <el-table-column prop="category" label="分类" width="130"></el-table-column>
      <el-table-column prop="title" label="问题" min-width="240"></el-table-column>
      <el-table-column label="选项" min-width="220">
        <template slot-scope="scope">
          <div v-for="(item, index) in scope.row.options" :key="index">
            {{ labels[index] }}. {{ item }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="答案" width="70">
        <template slot-scope="scope">{{ labels[scope.row.answer] }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pager"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[5, 10, 20]"
      :page-size="size"
      layout="total, sizes, prev, pager, next"
      :total="list.length">
    </el-pagination>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px">
      <el-form :model="form" :rules="rules" ref="questionForm" label-width="80px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题" prop="title">
          <el-input v-model="form.title" placeholder="请输入问题"></el-input>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in form.options"
          :key="index"
          :label="'选项' + labels[index]"
          :prop="'options.' + index"
          :rules="{ required: true, message: '选项不能为空', trigger: 'blur' }">
          <el-input v-model="form.options[index]"></el-input>
        </el-form-item>
        <el-form-item label="答案">
          <el-radio-group v-model="form.answer">
            <el-radio v-for="(item, index) in labels" :key="item" :label="index">{{ item }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listQuestions,
  createQuestion,
  updateQuestion,
  removeQuestion,
  labelsOf
} from '@/api/question'

function emptyForm() {
  return {
    id: null,
    category: 'HTML BASICS',
    title: '',
    options: ['', '', '', ''],
    answer: 0
  }
}

export default {
  name: 'QuestionView',
  data() {
    return {
      labels: labelsOf(),
      categories: ['HTML BASICS', 'CSS BASICS', 'JAVASCRIPT', 'VUE'],
      // 数据来自 quiz-java 的 /api/questions，不再是本地数组
      list: [],
      loading: false,
      submitting: false,
      loadError: '',
      query: {
        keyword: ''
      },
      page: 1,
      size: 5,
      dialogVisible: false,
      dialogTitle: '添加题目',
      form: emptyForm(),
      rules: {
        category: [{ required: true, message: '请选择分类', trigger: 'change' }],
        title: [{ required: true, message: '请输入问题', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 分页在前端做；过滤交给后端（keyword 会走 MyBatis 的动态 SQL）
    pagedList() {
      const start = (this.page - 1) * this.size
      return this.list.slice(start, start + this.size)
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.loadError = ''
      try {
        const keyword = this.query.keyword.trim()
        this.list = await listQuestions(keyword ? { keyword } : {})
      } catch (e) {
        this.loadError = e.message
        this.list = []
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.page = 1
      this.load()
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
    },
    handleCurrentChange(val) {
      this.page = val
    },
    openAdd() {
      this.dialogTitle = '添加题目'
      this.form = emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.questionForm.clearValidate()
      })
    },
    openEdit(row) {
      this.dialogTitle = '编辑题目'
      // 拷贝一份，避免改到一半表格里的数据跟着变
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.questionForm.clearValidate()
      })
    },
    submitForm() {
      this.$refs.questionForm.validate(async valid => {
        if (!valid) {
          return
        }

        this.submitting = true
        try {
          if (this.form.id) {
            await updateQuestion(this.form.id, this.form)
            this.$message.success('修改成功')
          } else {
            await createQuestion(this.form)
            this.$message.success('添加成功')
          }
          this.dialogVisible = false
          await this.load()
        } catch (e) {
          this.$message.error(e.message)
        } finally {
          this.submitting = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除这道题目吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await removeQuestion(row.id)
          this.$message.success('删除成功')
          await this.load()
        } catch (e) {
          this.$message.error(e.message)
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.query-form {
  padding-top: 18px;
}

.pager {
  margin-top: 16px;
  text-align: right;
}

.load-error {
  margin-top: 16px;
}
</style>
