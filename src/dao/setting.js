import db from '@/db'

const settingDao = {
  getOne(key) {
    return new Promise((resolve, reject) => {
      const sql = `select value
                   from t_setting
                   where key = ?`
      db.get(sql, key).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  update(key, value) {
    return new Promise((resolve, reject) => {
      const sql = 'update t_setting set value = ? where key = ?'
      db.run(sql, [value, key]).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

export default settingDao
