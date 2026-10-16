<template>
  <el-container class="layout">
    <el-header class="layout-header">Quiz 后台管理</el-header>

    <el-container>
      <el-aside width="200px" class="layout-aside">
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/question">
            <i class="el-icon-edit-outline"></i>
            <span>题目管理</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  margin: 0;
}

.layout {
  height: 100vh;
}

.layout-header {
  background-color: #eef1e6;
  font-size: 22px;
  line-height: 60px;
  font-weight: bold;
}

.layout-aside {
  border-right: 1px solid #dcdfe6;
}

.layout-main {
  background-color: #fff;
}
</style>
