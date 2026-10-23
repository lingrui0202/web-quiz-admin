<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <span class="brand">Quiz 答题后台</span>
      <span class="brand-sub">用户与题库管理</span>
    </el-header>

    <el-container>
      <el-aside width="200px" class="layout-aside">
        <el-menu
          :default-active="$route.path"
          router
          class="menu"
          background-color="#ffffff"
          text-color="#5a5f66"
          active-text-color="#409eff">
          <el-menu-item index="/user">
            <i class="el-icon-user"></i>
            <span slot="title">用户管理</span>
          </el-menu-item>
          <el-menu-item index="/question">
            <i class="el-icon-edit-outline"></i>
            <span slot="title">题目管理</span>
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
  display: flex;
  align-items: baseline;
  padding: 0 24px;
}

.brand {
  font-size: 22px;
  font-weight: bold;
  line-height: 60px;
}

.brand-sub {
  margin-left: 12px;
  font-size: 13px;
  color: #7a828c;
}

.layout-aside {
  background-color: #fff;
}

/* 去掉 el-menu 自带的右边框，用 aside 自己的分割线 */
.layout-aside .el-menu {
  border-right: none;
  padding-top: 12px;
}

.layout-aside .el-menu-item {
  height: 52px;
  line-height: 52px;
  font-size: 15px;
  margin: 4px 10px;
  border-radius: 6px;
}

/* 选中项：浅蓝底 + 左侧蓝色竖条 */
.layout-aside .el-menu-item.is-active {
  background-color: #ecf5ff;
  font-weight: bold;
}

.layout-aside .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 2px;
  background-color: #409eff;
}

.layout-main {
  background-color: #f7f8fa;
}
</style>
