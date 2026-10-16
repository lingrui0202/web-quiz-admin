<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <i class="el-icon-message"></i>
      系统信息管理
    </el-header>

    <el-container>
      <el-aside width="200px" class="layout-aside">
        <div class="menu">
          <router-link to="/user" class="menu-item" active-class="active">用户管理</router-link>
          <router-link to="/question" class="menu-item" active-class="active">题目管理</router-link>
        </div>
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

.menu {
  padding-top: 16px;
}

.menu-item {
  display: block;
  padding: 10px 20px;
  font-size: 15px;
}

.menu-item.active {
  color: #409eff;
  font-weight: bold;
}

.layout-main {
  background-color: #fff;
}
</style>
