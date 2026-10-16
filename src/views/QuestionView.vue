<template>
  <div>
    <el-form :inline="true" :model="query" class="query-form">
      <el-form-item label="题目">
        <el-input v-model="query.keyword" placeholder="题目关键词" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="success" icon="el-icon-search" @click="handleQuery">查询题目</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAdd">添加题目</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pagedList" border stripe>
      <el-table-column prop="id" label="序号" width="70"></el-table-column>
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
      :total="filteredList.length">
    </el-pagination>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px">
      <el-form :model="form" :rules="rules" ref="questionForm" label-width="80px">
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 题目数据先用本地数组存着，跟 quiz-game 里的是同一批题
const initList = [
  {
    id: 1,
    title: '在 HTML 中，哪个标签用于创建最大的标题？',
    options: ['<heading>', '<h6>', '<h1>', '<title>'],
    answer: 2
  },
  {
    id: 2,
    title: '哪个属性可以为图片提供替代文本？',
    options: ['src', 'alt', 'href', 'title'],
    answer: 1
  },
  {
    id: 3,
    title: '哪个 CSS 属性用于改变文字颜色？',
    options: ['font-style', 'text-decoration', 'color', 'background'],
    answer: 2
  },
  {
    id: 4,
    title: '使用 Flexbox 时，哪个属性可以控制主轴方向？',
    options: ['align-items', 'flex-direction', 'justify-content', 'flex-wrap'],
    answer: 1
  },
  {
    id: 5,
    title: '哪个单位相对于根元素的字体大小？',
    options: ['px', 'em', 'rem', '%'],
    answer: 2
  },
  {
    id: 6,
    title: '使用哪个关键字可以声明一个不会重新赋值的变量？',
    options: ['var', 'let', 'const', 'static'],
    answer: 2
  },
  {
    id: 7,
    title: '哪个方法可以把字符串转换成整数？',
    options: ['parseInt()', 'toString()', 'parseFloat()', 'Number.isInteger()'],
    answer: 0
  },
  {
    id: 8,
    title: '哪个 DOM 方法可以根据 id 获取元素？',
    options: ['querySelectorAll()', 'getElementById()', 'getElementsByClassName()', 'createElement()'],
    answer: 1
  }
]

function emptyForm() {
  return {
    id: null,
    title: '',
    options: ['', '', '', ''],
    answer: 0
  }
}

export default {
  name: 'QuestionView',
  data() {
    return {
      labels: ['A', 'B', 'C', 'D'],
      list: initList,
      query: {
        keyword: ''
      },
      page: 1,
      size: 5,
      dialogVisible: false,
      dialogTitle: '添加题目',
      form: emptyForm(),
      rules: {
        title: [{ required: true, message: '请输入问题', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 按问题关键词过滤
    filteredList() {
      const keyword = this.query.keyword.trim().toLowerCase()

      if (!keyword) {
        return this.list
      }

      return this.list.filter(item => item.title.toLowerCase().indexOf(keyword) !== -1)
    },
    // 当前页要显示的题目
    pagedList() {
      const start = (this.page - 1) * this.size
      return this.filteredList.slice(start, start + this.size)
    }
  },
  methods: {
    handleQuery() {
      this.page = 1
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
      this.$refs.questionForm.validate(valid => {
        if (!valid) {
          return
        }

        if (this.form.id) {
          const index = this.list.findIndex(item => item.id === this.form.id)
          this.list.splice(index, 1, JSON.parse(JSON.stringify(this.form)))
          this.$message.success('修改成功')
        } else {
          const id = this.list.length ? this.list[this.list.length - 1].id + 1 : 1
          this.list.push(Object.assign({}, this.form, { id }))
          this.$message.success('添加成功')
        }

        this.dialogVisible = false
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除这道题目吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.list = this.list.filter(item => item.id !== row.id)
        this.$message.success('删除成功')
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
</style>
