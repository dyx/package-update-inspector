<template>
  <el-form>
    <el-form-item label="导入数据">
      <div id="upload"
           class="el-upload"
           @click="showSelectFile">
        <div id="uploadDragger" class="el-upload-dragger">
          <i class="el-icon-upload"></i>
          <div class="el-upload-text">将文件拖到此处，或点击上传</div>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>
<script>
import packageDao from '@/dao/package'
import util from '@/utils/util'
import fs from 'fs'
import consts from '@/utils/consts'
import { mapMutations } from 'vuex'

export default {
  name: 'Recovery',
  data() {
    return {
    }
  },
  methods: {
    ...mapMutations(['setPercentage', 'setRefreshPackageFlag']),
    showSelectFile() {
      this.$electron.ipcRenderer.send(consts.IMPORT_CHANNEL)
      this.$electron.ipcRenderer.once(consts.IMPORT_SELECTED_CHANNEL, (event, file) => {
        if (file.canceled) return
        this.importData(file.filePaths[0])
      })
    },
    async importData(file) {
      const data = fs.readFileSync(file)
      const rows = data.toString().split('\n')

      if (!rows || rows.length === 0) await Promise.resolve()

      const packages = []
      for (const item of rows) {
        const columns = item.split(',')
        packages.push({
          categoryCode: columns[0],
          name: columns[1],
          groupName: columns[2],
          currentVersion: columns[3],
          latestVersion: columns[4],
          publishTime: columns[5] ? util.dateFormat(columns[5]) : ''
        })
      }

      if (!packages || packages.length === 0) await Promise.resolve()

      const errs = []
      let successCount = 0
      for (const [index, item] of packages.entries()) {
        if (!item.categoryCode || !item.name) {
          errs.push(index + 1)
          continue
        }
        if (item.categoryCode === consts.CATEGORY_CODE_MAVEN && !item.groupName) {
          errs.push(index + 1)
          continue
        }
        try {
          this.setPercentage(Math.floor((index + 1) / packages.length * 100))
          await packageDao.add(item)
          successCount += 1
        } catch (e) {
          errs.push(index + 1)
          console.log(e)
        }
      }

      this.$msgbox({
        type: 'info',
        roundButton: true,
        center: true,
        showConfirmButton: false,
        dangerouslyUseHTMLString: true,
        title: '提示',
        message: `共读取到 <span style="color: #409EFF;">${packages.length}</span> 条数据，成功导入 <span style="color: #67C23A;">${successCount}</span> 条数据` +
          (errs && errs.length > 0 ? `<br/>第【<span style="color: #F56C6C;">${errs.join()}</span>】行数据导入失败` : '')
      })

      this.setPercentage(0)
      // eslint-disable-next-line no-new
      new Notification('', {
        body: '导入数据完成'
      })

      this.setRefreshPackageFlag(true)
    }
  },
  mounted() {
    const upload = document.getElementById('upload')
    const uploadDragger = document.getElementById('uploadDragger')

    upload.addEventListener('dragenter', (e) => {
      if (e.target.className === 'el-upload-dragger') {
        uploadDragger.setAttribute('class', 'el-upload-dragger is-dragover')
      }
    })

    upload.addEventListener('drop', (e) => {
      uploadDragger.setAttribute('class', 'el-upload-dragger')
      e.preventDefault()
      const files = e.dataTransfer.files
      if (files) {
        const file = files[0].path
        if (file && file.endsWith('.csv')) {
          this.importData(file)
        } else {
          this.$message({
            message: '文件格式错误，应为csv文件',
            type: 'error'
          })
        }
      }
    })

    upload.addEventListener('dragover', function (event) {
      event.preventDefault()
    })
  }
}
</script>
<style scoped>
  .el-upload {
    display: inline-block;
    text-align: center;
    cursor: pointer;
    outline: none;
  }
  .el-upload-dragger {
    background-color: #fff;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    box-sizing: border-box;
    width: 300px;
    height: 150px;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .el-upload-dragger.is-dragover {
    background-color: rgba(32,159,255,.06);
    border: 2px dashed #409eff;
  }
  .el-upload-dragger:hover, .el-upload-dragger:focus {
    border-color: #409eff;
    color: #409eff;
  }
  .el-upload-dragger .el-icon-upload {
    font-size: 67px;
    color: #c0c4cc;
    margin: 40px 0 16px;
    line-height: 50px;
  }
  .el-upload-dragger .el-upload-text {
    color: #606266;
    font-size: 14px;
    text-align: center;
  }
</style>
