<template>
  <div>
    <el-form :inline="true" :model="query" class="query-form">
      <el-form-item label="用户名">
        <el-input v-model="query.keyword" placeholder="用户名关键词" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询用户</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAdd">添加用户</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pagedList" border stripe>
      <el-table-column prop="date" label="日期" width="160"></el-table-column>
      <el-table-column prop="name" label="用户名" width="160"></el-table-column>
      <el-table-column prop="password" label="密码" min-width="160"></el-table-column>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="440px">
      <el-form :model="form" :rules="rules" ref="userForm" label-width="80px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password"></el-input>
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
const initList = [
  { id: 1, date: '2016-05-02', name: '吴小诚', password: '123456' },
  { id: 2, date: '2016-05-04', name: '王小虎', password: '123456' },
  { id: 3, date: '2016-05-06', name: '李小明', password: '888888' },
  { id: 4, date: '2016-05-08', name: '赵小刚', password: '666666' },
  { id: 5, date: '2016-05-10', name: '孙小丽', password: '000000' },
  { id: 6, date: '2016-05-12', name: '周小强', password: '111111' }
]

function emptyForm() {
  return {
    id: null,
    name: '',
    password: ''
  }
}

export default {
  name: 'UserView',
  data() {
    return {
      list: initList,
      query: {
        keyword: ''
      },
      page: 1,
      size: 5,
      dialogVisible: false,
      dialogTitle: '添加用户',
      form: emptyForm(),
      rules: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '密码 6 到 12 位', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    filteredList() {
      const keyword = this.query.keyword.trim().toLowerCase()

      if (!keyword) {
        return this.list
      }

      return this.list.filter(item => item.name.toLowerCase().indexOf(keyword) !== -1)
    },
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
      this.dialogTitle = '添加用户'
      this.form = emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    openEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    submitForm() {
      this.$refs.userForm.validate(valid => {
        if (!valid) {
          return
        }

        if (this.form.id) {
          const index = this.list.findIndex(item => item.id === this.form.id)
          this.list.splice(index, 1, JSON.parse(JSON.stringify(this.form)))
          this.$message.success('修改成功')
        } else {
          const id = this.list.length ? this.list[this.list.length - 1].id + 1 : 1
          const date = new Date().toISOString().slice(0, 10)
          this.list.push(Object.assign({}, this.form, { id, date }))
          this.$message.success('添加成功')
        }

        this.dialogVisible = false
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除这个用户吗？', '提示', {
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
