<template>
  <el-form>
    <el-form-item label="导出数据">
      <el-button type="primary" size="small" @click="exportData">导出所有数据</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import packageDao from '@/dao/package'
import util from '@/utils/util'
import path from 'path'
import os from 'os'
import fs from 'fs'
import consts from '@/utils/consts'
import { mapMutations } from 'vuex'

export default {
  name: 'Backup',
  data() {
    return {
    }
  },
  methods: {
    ...mapMutations(['setPercentage']),
    async exportData() {
      const packageList = await packageDao.getAll()
      if (!packageList) return

      const data = []
      let columnData = []
      for (const item of packageList) {
        columnData.push(item.categoryCode)
        columnData.push(item.name)
        columnData.push(item.groupName)
        columnData.push(item.currentVersion)
        columnData.push(item.latestVersion)
        columnData.push(item.publishTime)
        data.push(columnData.join())
        columnData = []
      }

      const filename = `pui-data-${util.dateFormat(new Date(), 'YYYYMMDDHHmmss')}.csv`
      const filePath = path.join(os.tmpdir(), filename)

      fs.writeFileSync(filePath, Buffer.from(data.join('\n')))

      this.$electron.ipcRenderer.send(consts.EXPORT_CHANNEL, filePath)

      this.$electron.ipcRenderer.on(consts.EXPORT_PROGRESS_CHANNEL, (event, percentage) => {
        if (percentage) {
          this.setPercentage(percentage)
        }
      })
      this.$electron.ipcRenderer.once(consts.EXPORT_STATE_CHANNEL, (event, state) => {
        if (state === consts.ELECTRON_DOWNLOAD_STATE_COMPLETED) {
          // eslint-disable-next-line no-new
          new Notification('', {
            body: '导出数据完成'
          })
        }
        fs.unlink(filePath, function () {})
        this.setPercentage(0)
      })
    }
  }
}
</script>
