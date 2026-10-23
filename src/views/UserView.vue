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
      <el-form-item label="用户名">
        <el-input v-model="query.keyword" placeholder="用户名关键词" clearable @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询用户</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAdd">添加用户</el-button>
        <el-button icon="el-icon-refresh" @click="load">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="pagedList" border stripe>
      <el-table-column prop="date" label="注册日期" width="160"></el-table-column>
      <el-table-column prop="name" label="用户名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="220"></el-table-column>
      <el-table-column label="密码" width="120">
        <template slot-scope="scope">
          <el-tag size="mini" type="info">{{ scope.row.id ? '已加密' : '' }}</el-tag>
        </template>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="440px">
      <el-form :model="form" :rules="rules" ref="userForm" label-width="80px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            :placeholder="form.id ? '留空表示不修改密码' : '至少 6 位'"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
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
import { listUsers, createUser, updateUser, removeUser } from '@/api/user'

function emptyForm() {
  return {
    id: null,
    name: '',
    password: '',
    email: ''
  }
}

export default {
  name: 'UserView',
  data() {
    return {
      // 数据来自 quiz-java 的 /api/users；密码永远不会返回，所以没有密码列可显示
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
      dialogTitle: '添加用户',
      form: emptyForm(),
      rules: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [
          {
            // 修改时可以不填（表示不改密码），新增时必填
            validator: (rule, value, callback) => {
              if (!this.form.id && !value) {
                callback(new Error('请输入密码'))
                return
              }
              if (value && (value.length < 6 || value.length > 32)) {
                callback(new Error('密码 6 到 32 位'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
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
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.loadError = ''
      try {
        this.list = await listUsers()
      } catch (e) {
        this.loadError = e.message
        this.list = []
      } finally {
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
      this.dialogTitle = '添加用户'
      this.form = emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    openEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = { id: row.id, name: row.name, password: '', email: row.email }
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
      this.$confirm('确定要删除这个用户吗？', '提示', {
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
