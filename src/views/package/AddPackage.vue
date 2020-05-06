<template>
  <el-dialog title="新增" width="450px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :visible.sync="dialogVisible"
             :before-close="handleClose" >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px"
             v-loading="dialogLoading"
             :element-loading-text="dialogLoadingText"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="分类">
        <el-input v-model="categoryData.name" disabled class="form-item"></el-input>
      </el-form-item>
      <template v-if="hasGroup">
        <el-form-item label="组织" prop="groupName">
          <el-input v-model="form.groupName" class="form-item"></el-input>
        </el-form-item>
        <el-form-item label="包名" prop="name">
          <el-input ref="packageName" v-model="form.name" class="form-item" :disabled="!form.groupName" @blur="getPackageInfo"></el-input>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item label="包名" prop="name">
          <el-input ref="packageName" v-model="form.name" class="form-item" @blur="getPackageInfo"></el-input>
        </el-form-item>
      </template>
      <el-form-item label="最新版本" prop="latestVersion">
        <el-input v-model="form.latestVersion" disabled class="form-item"></el-input>
      </el-form-item>
      <el-form-item label="发布日期" prop="publishTime">
        <el-input v-model="form.publishTime" disabled class="form-item"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import packageDao from '@/dao/package'
import categoryDao from '@/dao/category'
import consts from '@/utils/consts'
import { getPackage } from '@/api'
export default {
  name: 'AddPackage',
  props: {
    visible: {
      type: Boolean
    },
    categoryCode: {
      type: String
    }
  },
  data() {
    return {
      hasGroup: false,
      dialogVisible: false,
      dialogLoading: false,
      dialogLoadingText: '',
      form: {},
      rules: {
        categoryCode: [
          {
            required: true,
            message: '种类不能为空',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: '包名不能为空',
            trigger: 'blur'
          }
        ],
        latestVersion: [
          {
            required: true,
            message: '最新版本不能为空',
            trigger: 'blur'
          }
        ]
      },
      categoryData: {}
    }
  },
  methods: {
    handleClose(done) {
      this.reset()
      this.$emit('on-close')
      done()
    },
    close() {
      this.reset()
      this.$emit('on-close')
      this.dialogVisible = false
    },
    reset() {
      this.$refs.form.resetFields()
      this.form = {}
      this.categoryData = {}
      this.dialogLoading = false
      this.dialogLoadingText = ''
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.dialogLoadingText = ''
          this.dialogLoading = true
          this.form.categoryCode = this.categoryData.code
          packageDao.add(this.form).then(() => {
            this.$refs.form.resetFields()
            this.$emit('on-success')
            this.dialogVisible = false
            this.dialogLoading = false
          }).catch(err => {
            this.dialogLoading = false
            if (err && err.errno === 19) {
              this.$message({
                message: '包已存在',
                type: 'error'
              })
            }
          })
        }
      })
    },
    getPackageInfo() {
      if (!this.form.name) return
      this.dialogLoadingText = '匹配数据中。。。'
      this.dialogLoading = true
      getPackage(this.categoryData.code, this.categoryData.baseUrl, this.form.groupName, this.form.name).then(res => {
        if (res && Object.keys(res).length > 0) {
          this.$set(this.form, 'currentVersion', res.latestVersion)
          this.$set(this.form, 'latestVersion', res.latestVersion)
          this.$set(this.form, 'publishTime', res.publishTime)
        } else {
          this.matchPackageFail()
        }
        this.dialogLoading = false
      }).catch(err => {
        console.log(err)
        this.$set(this.form, 'currentVersion', '')
        this.$set(this.form, 'latestVersion', '')
        this.$set(this.form, 'publishTime', '')
        if (err.code === 'ECONNABORTED') {
          this.$message({
            message: '请求超时',
            type: 'error'
          })
        } else {
          this.matchPackageFail()
        }
        this.dialogLoading = false
      })
    },
    matchPackageFail() {
      this.$message({
        message: '匹配数据失败，请核对包信息，重新匹配。',
        type: 'error'
      })
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.hasGroup = [consts.CATEGORY_CODE_COMPOSER, consts.CATEGORY_CODE_MAVEN, consts.CATEGORY_CODE_GIT_HUB].indexOf(this.categoryCode) >= 0
        categoryDao.getOne(this.categoryCode).then(res => {
          this.categoryData = res
          this.dialogVisible = val
          this.$nextTick(() => {
            this.$refs.packageName.$el.querySelector('input').focus()
          })
        }).catch(err => {
          console.log(err)
          this.$message({
            message: '获取分类信息出错',
            type: 'error'
          })
        })
      }
    }
  }
}
</script>

<style scoped>
  .form-item {
    width: 250px;
  }
</style>
