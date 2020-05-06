import Moment from 'moment'
export default {
  sleep (interval) {
    return new Promise(resolve => {
      setTimeout(resolve, interval)
    })
  },
  random (start, end) {
    if (start >= end) throw new Error('参数错误')
    return Math.floor(Math.random() * (end - start) + start + 1)
  },
  dateFormat(date, formatter = 'YYYY-MM-DD HH:mm:ss') {
    return Moment(date).format(formatter)
  },
  getRemindCron(timeStr) {
    if (timeStr) {
      const times = timeStr.split(':')
      return `0 ${times[1]} ${times[0]} * * *`
    }
    return ''
  },
  sqlWhereIn(list) {
    if (!list || list.length === 0) return ''
    const arr = []
    for (const item of list) {
      arr.push(`'${item}'`)
    }
    return `(${arr.join()})`
  }
}
