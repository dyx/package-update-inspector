<template>
  <div v-loading.fullscreen.lock="loading" element-loading-background="rgba(250, 250, 250, 0.6)">
    <el-button v-if="isDevelopment" type="primary" @click="reload">刷新页面</el-button>
    <el-button circle
               type="primary"
               icon="el-icon-setting"
               @click="settingVisible=true">
    </el-button>
    <el-button circle
               type="primary"
               icon="el-icon-refresh"
               @click="checkWithMsgBox">
    </el-button>
    <div class="mask" v-show="getPercentage>0">
      <el-progress class="progress" type="circle" :percentage="getPercentage" :color="customProgressColor"></el-progress>
    </div>
    <Package ref="package"></Package>
    <Setting :visible="settingVisible"
             @on-close="closeSetting"></Setting>
  </div>
</template>

<script>

import Package from '@/views/package/Package'
import { checkPackage } from '@/api'
import Setting from '@/views/setting/Setting'
import { mapGetters } from 'vuex'

export default {
  name: 'Main',
  components: {
    Setting,
    Package
  },
  data () {
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      loading: false,
      settingVisible: false
    }
  },
  computed: {
    ...mapGetters(['getPercentage'])
  },
  methods: {
    reload() {
      window.location.reload()
    },
    checkWithMsgBox() {
      this.$msgbox.confirm('确定同步最新版本数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.check()
      }).catch(() => {})
    },
    check () {
      this.loading = true
      checkPackage().then(res => {
        this.$refs.package.searchCategory()
        this.loading = false
        if (res && res.count > 0) {
          // eslint-disable-next-line no-new
          new Notification('', {
            body: `发现${res.count}个包有新版本，点击查看。`
          })
        }
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    customProgressColor(percentage) {
      if (percentage < 30) {
        return '#909399'
      } else if (percentage < 70) {
        return '#e6a23c'
      } else {
        return '#67c23a'
      }
    },
    closeSetting(val) {
      this.settingVisible = false
      const codeList = []
      this.$refs.package.categoryData.forEach(item => codeList.push(item.code))
      // 分类的配置与页面的分类对比，不同则刷新页面，重新获取页面分类
      if (new Set([...codeList].filter(x => new Set(val).has(x))).size > 0) {
        this.$refs.package.searchCategory(true)
      }
    }
  }
}
</script>
<style scoped>
  .progress {
    top: calc(50% - 75px);
    left: calc(50% - 75px);
    position: absolute;
    z-index: 2999;
  }
  .mask {
    z-index: 3000;
    position: fixed;
    margin: 0;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(250, 250, 250, 0.8);
  }
</style>
