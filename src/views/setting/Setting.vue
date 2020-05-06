<template>
  <div id="setting">
    <el-dialog
      title="设置"
      width="475px"
      :visible.sync="currentVisible"
      :before-close="handleClose">
      <el-tabs v-model="currentTab">
        <el-tab-pane label="分类" name="category">
          <Category @on-change="categoryChange" ></Category>
        </el-tab-pane>
        <el-tab-pane label="提醒" name="remind">
          <Remind></Remind>
        </el-tab-pane>
        <el-tab-pane label="备份" name="backup">
          <Backup></Backup>
        </el-tab-pane>
        <el-tab-pane label="导入数据" name="recovery">
          <Recovery></Recovery>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import Remind from '@/views/setting/Remind'
import Backup from '@/views/setting/Backup'
import Recovery from '@/views/setting/Recovery'
import Category from '@/views/setting/Category'
export default {
  name: 'Setting',
  components: { Recovery, Backup, Remind, Category },
  props: {
    visible: {
      type: Boolean
    }
  },
  data() {
    return {
      currentVisible: false,
      currentTab: 'category',
      checkedCodeList: []
    }
  },
  methods: {
    handleClose(done) {
      this.$emit('on-close', this.checkedCodeList)
      done()
    },
    categoryChange(val) {
      this.checkedCodeList = val
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.currentVisible = val
      }
    }
  }
}
</script>
<style>
  #setting .el-dialog__body {
    padding: 10px 20px 10px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
  }
</style>
