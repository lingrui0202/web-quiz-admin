<template>
  <div>
    <el-alert
      v-if="offline"
      title="当前是离线演示模式：没有连接后端，增删改只保存在内存里，刷新页面会还原"
      type="info"
      :closable="false"
      show-icon
      class="tip">
    </el-alert>

    <el-form :inline="true" :model="query" class="query-form">
      <el-form-item label="题目">
        <el-input v-model="query.keyword" placeholder="输入题干关键词" clearable @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAdd">新增题目</el-button>
        <el-button icon="el-icon-refresh" @click="load">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" border stripe empty-text="没有符合条件的题目">
      <el-table-column prop="id" label="序号" width="70"></el-table-column>
      <el-table-column prop="category" label="分类" width="130"></el-table-column>
      <el-table-column prop="title" label="题干" min-width="240"></el-table-column>
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
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pager"
      background
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next"
      :total="total">
    </el-pagination>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      top="8vh"
      append-to-body
      :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="questionForm" label-width="80px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题干" prop="title">
          <el-input v-model="form.title" type="textarea" :rows="2" placeholder="请输入题干"></el-input>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in form.options"
          :key="index"
          :label="'选项' + labels[index]"
          :prop="'options.' + index"
          :rules="{ required: true, message: '选项不能为空', trigger: 'blur' }">
          <el-input v-model="form.options[index]" :placeholder="'选项 ' + labels[index]"></el-input>
        </el-form-item>
        <el-form-item label="正确答案" prop="answer">
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
  pageQuestions,
  createQuestion,
  updateQuestion,
  removeQuestion,
  labels,
  isOffline
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
      labels: labels(),
      categories: ['HTML BASICS', 'CSS BASICS', 'JAVASCRIPT', 'VUE'],
      // 服务端分页：表里只有当前页这几条，总数单独拿
      tableData: [],
      offline: false,
      loading: false,
      submitting: false,
      query: {
        keyword: ''
      },
      currentPage: 1,
      pageSize: 5,
      total: 0,
      dialogVisible: false,
      dialogTitle: '新增题目',
      form: emptyForm(),
      rules: {
        category: [{ required: true, message: '请选择分类', trigger: 'change' }],
        title: [{ required: true, message: '请输入题干', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.loadPage()
  },
  methods: {
    async loadPage() {
      this.loading = true
      try {
        const keyword = this.query.keyword.trim()
        const result = await pageQuestions({
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword
        })
        this.total = result.total

        // 删掉最后一页最后一条后，页码会越界，往回退一页再取
        if (result.list.length === 0 && this.currentPage > 1 && this.total > 0) {
          this.currentPage = Math.max(1, Math.ceil(this.total / this.pageSize))
          this.loading = false
          return this.loadPage()
        }

        this.tableData = result.list
      } catch (e) {
        this.$message.error(e.message)
        this.tableData = []
        this.total = 0
      } finally {
        this.offline = isOffline()
        this.loading = false
      }
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadPage()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadPage()
    },
    handleQuery() {
      // 查询时回到第一页，否则关键字变了页码还停在旧位置会很怪
      this.currentPage = 1
      this.loadPage()
    },
    openAdd() {
      this.dialogTitle = '新增题目'
      this.form = emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.questionForm.clearValidate()
      })
    },
    openEdit(row) {
      this.dialogTitle = '编辑题目'
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
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          await this.loadPage()
        } catch (e) {
          this.$message.error(e.message)
        } finally {
          this.submitting = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除这道题目吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await removeQuestion(row.id)
          this.$message.success('删除成功')
          await this.loadPage()
        } catch (e) {
          this.$message.error(e.message)
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.tip {
  margin-top: 16px;
}

.query-form {
  padding-top: 18px;
}

.pager {
  margin-top: 16px;
  text-align: right;
}
</style>
