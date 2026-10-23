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
      <el-form-item label="用户名">
        <el-input v-model="query.keyword" placeholder="输入用户名关键词" clearable @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAdd">新增用户</el-button>
        <el-button icon="el-icon-refresh" @click="load">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="pagedList" border stripe empty-text="还没有用户，点「新增用户」加一个">
      <el-table-column prop="date" label="注册日期" width="150"></el-table-column>
      <el-table-column prop="name" label="用户名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
      <el-table-column label="密码" width="110">
        <template>
          <el-tag size="mini" type="success">已加密</el-tag>
        </template>
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
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[5, 10, 20]"
      :page-size="size"
      layout="total, sizes, prev, pager, next"
      :total="filteredList.length">
    </el-pagination>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="460px"
      top="8vh"
      :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="userForm" label-width="90px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" placeholder="登录用的用户名" maxlength="32"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="form.id ? '留空表示不修改密码' : '至少 6 位'"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            :placeholder="form.id ? '修改密码时再输一遍' : '再输入一次密码'"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="选填"></el-input>
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
import { listUsers, createUser, updateUser, removeUser, isOffline } from '@/api/user'

function emptyForm() {
  return {
    id: null,
    name: '',
    password: '',
    confirmPassword: '',
    email: ''
  }
}

export default {
  name: 'UserView',
  data() {
    // 新增时密码必填；编辑时留空表示不改
    const checkPassword = (rule, value, callback) => {
      if (!this.form.id && !value) {
        callback(new Error('请输入密码'))
        return
      }
      if (value && (value.length < 6 || value.length > 32)) {
        callback(new Error('密码长度 6 到 32 位'))
        return
      }
      // 密码变了要连带校验确认框
      if (this.form.confirmPassword) {
        this.$refs.userForm.validateField('confirmPassword')
      }
      callback()
    }

    const checkConfirm = (rule, value, callback) => {
      if (!this.form.id && !this.form.password && !value) {
        callback(new Error('请再输入一次密码'))
        return
      }
      if (this.form.password && value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    }

    return {
      list: [],
      offline: false,
      loading: false,
      submitting: false,
      query: {
        keyword: ''
      },
      page: 1,
      size: 5,
      dialogVisible: false,
      dialogTitle: '新增用户',
      form: emptyForm(),
      rules: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 32, message: '用户名 2 到 32 位', trigger: 'blur' }
        ],
        password: [{ validator: checkPassword, trigger: 'blur' }],
        confirmPassword: [{ validator: checkConfirm, trigger: 'blur' }],
        email: [{ type: 'email', message: '邮箱格式不对', trigger: 'blur' }]
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
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        this.list = await listUsers()
      } catch (e) {
        this.$message.error(e.message)
        this.list = []
      } finally {
        this.offline = isOffline()
        this.loading = false
      }
    },
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
      this.dialogTitle = '新增用户'
      this.form = emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    openEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = { id: row.id, name: row.name, password: '', confirmPassword: '', email: row.email }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    submitForm() {
      this.$refs.userForm.validate(async valid => {
        if (!valid) {
          return
        }

        this.submitting = true
        try {
          if (this.form.id) {
            await updateUser(this.form.id, this.form)
            this.$message.success('修改成功')
          } else {
            await createUser(this.form)
            this.$message.success('新增成功')
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
      this.$confirm('确定删除用户「' + row.name + '」吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await removeUser(row.id)
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
