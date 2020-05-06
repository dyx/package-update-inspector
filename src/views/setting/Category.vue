<template>
  <div v-loading="loading">
    <el-alert
      title="选择要显示的页签"
      type="info" show-icon :closable="false">
    </el-alert>
    <el-checkbox-group style="padding: 10px 0px;"
                       v-model="checkedCodeList"
                       :min="1"
                       @change="handleChange">
      <el-checkbox v-for="(item, index) in data"
                   :key="index"
                   :label="item.code"
                   :checked="!item.isHide">
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>
<script>
import { mapMutations } from 'vuex'
import categoryDao from '@/dao/category'

export default {
  name: 'Category',
  data() {
    return {
      data: [],
      checkedCodeList: [],
      allCodeList: [],
      loading: false
    }
  },
  methods: {
    ...mapMutations(['setRefreshPackageFlag']),
    async handleChange() {
      this.loading = true
      await categoryDao.updateHide(1, [...this.allCodeList].filter(x => !new Set(this.checkedCodeList).has(x)))
      await categoryDao.updateHide(0, this.checkedCodeList)
      this.$emit('on-change', this.checkedCodeList)
      this.loading = false
    }
  },
  mounted() {
    categoryDao.getAll().then(res => {
      this.data = res
      this.data.forEach(item => {
        this.allCodeList.push(item.code)
      })
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>
