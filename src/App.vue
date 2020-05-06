<template>
  <div id="app">
    <Main ref="main"></Main>
  </div>
</template>

<script>
import Main from '@/views/Main'
import { CronJob } from 'cron'
import { mapGetters, mapMutations } from 'vuex'
import settingDao from '@/dao/setting'
import consts from '@/utils/consts'
import util from '@/utils/util'
import db from '@/db'
export default {
  name: 'app',
  components: {
    Main
  },
  data() {
    return {
    }
  },
  async beforeCreate() {
    await db.init().catch(() => {})
    await settingDao.getOne(consts.DB_SETTING_KEY_REMIND_PERIOD).then(res => {
      if (res && res.value) {
        // 创建任务
        const vm = this
        const job = new CronJob(util.getRemindCron(res.value), function() {
          vm.$refs.main.check()
        }, null, false)
        this.setJob(job)
      }
      console.log('create-job')
    }).catch(err => {
      console.log(err)
    })
    await settingDao.getOne(consts.DB_SETTING_KEY_REMIND_ENABLED).then(res => {
      // 启用提醒
      if (res && res.value && res.value === '1') {
        this.getJob.start()
      }
      console.log('start-job')
    }).catch(err => {
      console.log(err)
    })
    this.setAppInitFinished(true)
  },
  computed: {
    ...mapGetters(['getJob'])
  },
  methods: {
    ...mapMutations(['setJob', 'setAppInitFinished'])
  },
  watch: {
  }
}
</script>

<style>
</style>
