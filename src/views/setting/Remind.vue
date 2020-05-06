<template>
  <el-form>
    <el-alert
      title="设置每天定时检查包的最新版本"
      type="info" show-icon :closable="false">
    </el-alert>
    <el-form-item label="是否启用提醒">
      <el-switch
        v-model="isEnabled"
        active-color="#13ce66"
        @change="handleEnabledChange">
      </el-switch>
    </el-form-item>
    <el-form-item v-show="isEnabled" label="每天几点提醒">
      <el-time-select style="width: 100px;"
                      size="small"
                      :clearable="false"
                      :editable="false"
                      v-model="remindTime"
                      :picker-options="timeOptions"
                      @change="handleTimeChange">
      </el-time-select>
    </el-form-item>
  </el-form>
</template>
<script>
import settingDao from '@/dao/setting'
import consts from '@/utils/consts'
import { CronTime } from 'cron'
import util from '@/utils/util'
import { mapGetters } from 'vuex'

export default {
  name: 'Remind',
  data() {
    return {
      isEnabled: false,
      remindTime: '',
      timeOptions: {
        start: '00:00',
        step: '00:30',
        end: '23:30'
      }
    }
  },
  computed: {
    ...mapGetters(['getJob'])
  },
  methods: {
    handleEnabledChange(val) {
      if (val) {
        this.getJob.start()
      } else {
        this.getJob.stop()
      }
      settingDao.update(consts.DB_SETTING_KEY_REMIND_ENABLED, val)
    },
    handleTimeChange(val) {
      if (val) {
        this.getJob.setTime(new CronTime(util.getRemindCron(val)))
        this.getJob.start()
        settingDao.update(consts.DB_SETTING_KEY_REMIND_PERIOD, val)
      }
    }
  },
  async mounted() {
    await settingDao.getOne(consts.DB_SETTING_KEY_REMIND_PERIOD).then(res => {
      this.remindTime = res.value
    }).catch(err => {
      console.log(err)
    })
    await settingDao.getOne(consts.DB_SETTING_KEY_REMIND_ENABLED).then(res => {
      this.isEnabled = res.value === '1'
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>
