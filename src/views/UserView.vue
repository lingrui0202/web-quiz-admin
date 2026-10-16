<template>
  <div>
    <el-form :inline="true" :model="query" class="query-form">
      <el-form-item label="用户名">
        <el-input v-model="query.keyword" placeholder="输入用户名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item class="add-btn">
        <el-button type="success" icon="el-icon-plus" @click="openAdd">新增用户</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pagedList" border stripe>
      <el-table-column prop="id" label="编号" width="70"></el-table-column>
      <el-table-column prop="name" label="用户名" width="140"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
      <el-table-column prop="role" label="角色" width="120"></el-table-column>
      <el-table-column prop="date" label="注册时间" width="140"></el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="mini" class="danger-text" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px">
      <el-form :model="form" :rules="rules" ref="userForm" label-width="80px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role">
            <el-option v-for="item in roles" :key="item" :label="item" :value="item"></el-option>
          </el-select>
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
  { id: 1, name: 'lingrui0202', email: '3433246675@qq.com', role: '管理员', date: '2026-09-20' },
  { id: 2, name: 'zhangsan', email: 'zhangsan@example.com', role: '普通用户', date: '2026-09-25' },
  { id: 3, name: 'lisi', email: 'lisi@example.com', role: '普通用户', date: '2026-10-02' },
  { id: 4, name: 'wangwu', email: 'wangwu@example.com', role: '普通用户', date: '2026-10-08' },
  { id: 5, name: 'zhaoliu', email: 'zhaoliu@example.com', role: '普通用户', date: '2026-10-12' },
  { id: 6, name: 'sunqi', email: 'sunqi@example.com', role: '普通用户', date: '2026-10-15' }
]

function emptyForm() {
  return {
    id: null,
    name: '',
    email: '',
    role: '普通用户'
  }
}

export default {
  name: 'UserView',
  data() {
    return {
      roles: ['管理员', '普通用户'],
      list: initList,
      query: {
        keyword: ''
      },
      page: 1,
      size: 5,
      dialogVisible: false,
      dialogTitle: '新增用户',
      form: emptyForm(),
      rules: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不对', trigger: 'blur' }
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
    resetQuery() {
      this.query.keyword = ''
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
      this.dialogTitle = '新增用户'
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
          this.$message.success('新增成功')
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

.add-btn {
  float: right;
}

.pager {
  margin-top: 16px;
  text-align: right;
}

.danger-text {
  color: #f56c6c;
}
</style>
