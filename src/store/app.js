const app = {
  state: {
    appInitFinished: false,
    job: null,
    percentage: 0,
    refreshPackageFlag: false
  },
  getters: {
    getAppInitFinished: state => {
      return state.appInitFinished
    },
    getJob: state => {
      return state.job
    },
    getPercentage: state => {
      return state.percentage
    },
    getRefreshPackageFlag: state => {
      return state.refreshPackageFlag
    }
  },
  mutations: {
    setAppInitFinished (state, appInitFinished) {
      state.appInitFinished = appInitFinished
    },
    setJob (state, job) {
      state.job = job
    },
    setPercentage (state, percentage) {
      state.percentage = percentage
    },
    setRefreshPackageFlag (state, refreshPackageFlag) {
      state.refreshPackageFlag = refreshPackageFlag
    }
  },
  actions: {
  }
}

export default app
