import Schedule from 'node-schedule'

export default {
  create() {
    Schedule.scheduleJob({
      second: 10
    }, function () {
      console.log(new Date())
    })
  }
}
