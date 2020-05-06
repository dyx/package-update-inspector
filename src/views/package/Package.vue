<template>
  <div id="package">
    <el-tabs v-model="currentCategoryCode" @tab-click="handleTabClick">
      <el-tab-pane v-for="item in categoryData" :key="item.code" :name="item.code">
        <span slot="label">{{ item.name }}<el-badge v-show="item.versionDifferenceCount&&item.versionDifferenceCount>0" :value="item.versionDifferenceCount" /></span>
        <el-row>
          <el-col :span="12">
            <el-alert
              style="width: 300px;"
              type="info" show-icon :closable="false">
              <div slot="title" class="repository">
                <span class="repository-label">仓库地址：</span>
                <el-link type="info" @click="visitBaseUrl(item.baseUrl)">{{ item.baseUrl }}</el-link>
              </div>
            </el-alert>
          </el-col>
          <el-col :span="12">
            <el-button class="operate-btn ml10" type="primary" icon="el-icon-plus" @click="addPackageVisible=true"></el-button>
            <el-button class="operate-btn" type="primary" icon="el-icon-check" @click="updateAll"></el-button>
          </el-col>
        </el-row>
        <el-table :data="packageData">
          <el-table-column type="index" label="序号" width="60"> </el-table-column>
          <el-table-column prop="name" label="包名" min-width="250" width="auto">
            <template slot-scope="scope">
              <div class="column-name">{{ scope.row.name }}</div>
              <div class="column-group-name">{{ scope.row.groupName }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="latestVersion" label="版本" min-width="180" width="auto">
            <template slot-scope="scope">
              <el-tag :type="scope.row.currentVersion===scope.row.latestVersion ? 'success' : 'danger'" size="small">
                <el-link :type="scope.row.currentVersion===scope.row.latestVersion ? 'success' : 'danger'"
                         @click="visitPackage(scope.row.groupName, scope.row.name, scope.row.latestVersion)">
                  {{ scope.row.latestVersion }}
                </el-link>
              </el-tag>
              <br/>
              <el-tag v-if="scope.row.currentVersion!==scope.row.latestVersion" style="margin-top: 10px;" type="success" size="small">
                <el-link type="success" disabled :underline="false">
                  {{ scope.row.currentVersion }}
                </el-link>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="publishTime" label="发布日期" min-width="170" width="auto"></el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="150">
            <template slot-scope="scope">
              <el-button type="primary"
                         circle
                         icon="el-icon-check"
                         :disabled="scope.row.currentVersion===scope.row.latestVersion"
                         @click="update(scope.row.groupName, scope.row.name)"></el-button>
              <el-popconfirm title="确定要删除吗？" @onConfirm="remove(scope.row.groupName, scope.row.name)">
                <el-button slot="reference" type="danger" circle class="ml10" icon="el-icon-delete"></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <AddPackage :visible="addPackageVisible"
                :categoryCode="currentCategoryCode"
                @on-close="addPackageVisible=false"
                @on-success="addSuccess"></AddPackage>
  </div>
</template>

<script>
import packageDao from '@/dao/package'
import AddPackage from '@/views/package/AddPackage'
import categoryDao from '@/dao/category'
import consts from '@/utils/consts'
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'Package',
  components: {
    AddPackage
  },
  data() {
    return {
      currentCategoryCode: '',
      categoryData: [],
      packageData: [],
      addPackageVisible: false
    }
  },
  computed: {
    ...mapGetters(['getRefreshPackageFlag', 'getAppInitFinished'])
  },
  methods: {
    ...mapMutations(['setRefreshPackageFlag']),
    searchCategory(resetCurrentTab) {
      categoryDao.getShow().then(res => {
        if (resetCurrentTab) {
          this.currentCategoryCode = res[0].code
        } else {
          if (!this.currentCategoryCode || this.currentCategoryCode === '0') {
            this.currentCategoryCode = res[0].code
          }
        }
        this.categoryData = res
        this.searchPackage()
      }).catch(err => {
        console.log(err)
      })
    },
    searchPackage() {
      packageDao.getListByCategoryCode(this.currentCategoryCode).then(res => {
        this.packageData = res
      }).catch(err => {
        console.log(err)
      })
    },
    handleTabClick() {
      this.searchPackage()
    },
    addSuccess() {
      this.searchPackage()
      this.addPackageVisible = false
    },
    async updateAll() {
      await packageDao.updateSameVersionByCategoryCode(this.currentCategoryCode)
      await categoryDao.resetVdc(this.currentCategoryCode)
      this.searchCategory()
    },
    async update(groupName, name) {
      await packageDao.updateSameVersionById({ categoryCode: this.currentCategoryCode, groupName, name })
      await categoryDao.updateDecreaseVdc(this.currentCategoryCode)
      this.searchCategory()
    },
    remove(groupName, name) {
      packageDao.removeById({ categoryCode: this.currentCategoryCode, groupName, name }).then(() => {
        this.searchCategory()
      }).catch(err => {
        console.log(err)
      })
    },
    visitPackage(groupName, name, version) {
      const baseUrl = this.categoryData.filter(item => item.code === this.currentCategoryCode)[0].baseUrl
      let url = ''
      if (this.currentCategoryCode === consts.CATEGORY_CODE_NPM) {
        url = `${baseUrl}/package/${name}/v/${version}`
      } else if (this.currentCategoryCode === consts.CATEGORY_CODE_MAVEN) {
        url = `${baseUrl}/artifact/${groupName}/${name}/${version}/jar`
      } else if (this.currentCategoryCode === consts.CATEGORY_CODE_COMPOSER) {
        url = `${baseUrl}/packages/${groupName}/${name}#${version}`
      } else if (this.currentCategoryCode === consts.CATEGORY_CODE_RUBY_GEMS) {
        url = `${baseUrl}/gems/${name}/versions/${version}`
      } else if (this.currentCategoryCode === consts.CATEGORY_CODE_GIT_HUB) {
        url = `${baseUrl}/${groupName}/${name}/releases/tag/${version}`
      } else if (this.currentCategoryCode === consts.CATEGORY_CODE_NU_GET) {
        url = `${baseUrl}/packages/${name}/${version}`
      } else if (this.currentCategoryCode === consts.CATEGORY_CODE_COCOA_PODS) {
        url = `${baseUrl}/pods/${name}`
      } else if (this.currentCategoryCode === consts.CATEGORY_CODE_PY_PI) {
        url = `${baseUrl}/project/${name}/${version}`
      }

      if (url) {
        this.$electron.shell.openExternal(url)
      }
    },
    visitBaseUrl(url) {
      this.$electron.shell.openExternal(url)
    }
  },
  mounted() {
    if (this.getAppInitFinished) {
      this.searchCategory()
    }
  },
  watch: {
    getRefreshPackageFlag(val) {
      if (val) {
        this.searchCategory()
        this.setRefreshPackageFlag(false)
      }
    },
    getAppInitFinished(val) {
      if (val) {
        this.searchCategory()
      }
    }
  }
}
</script>

<style scoped>
  .repository-label {
    font-weight: 500;
  }
  #package .repository .el-link {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    vertical-align: baseline;
    position: relative;
    text-decoration: none;
    outline: 0;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    font-weight: 500;
  }
  .ml10 {
    margin-left: 10px;
  }
  .operate-btn {
    float: right;
  }
  .column-name {
    font-weight: bold;
  }
  .column-group-name {
    color:#909399;
  }
</style>
