import db from '@/db'
import util from '@/utils/util'

const categoryDao = {
  getAll() {
    return new Promise((resolve, reject) => {
      const sql = `select code, name, base_url baseUrl,
                   version_difference_count versionDifferenceCount,
                   is_hide isHide
                   from t_category
                   order by order_no`
      db.all(sql).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getShow() {
    return new Promise((resolve, reject) => {
      const sql = `select code, name, base_url baseUrl,
                   version_difference_count versionDifferenceCount
                   from t_category
                   where is_hide = 0
                   order by order_no`
      db.all(sql).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getOne(code) {
    return new Promise((resolve, reject) => {
      const sql = `select code, name, base_url baseUrl,
                   version_difference_count versionDifferenceCount
                   from t_category
                   where code = ?`
      db.get(sql, code).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  updateIncreaseVdc(code) {
    return new Promise((resolve, reject) => {
      const sql = `update t_category set version_difference_count = version_difference_count + 1
                   where code = ?`
      db.run(sql, code).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  updateDecreaseVdc(code) {
    return new Promise((resolve, reject) => {
      const sql = `update t_category set version_difference_count = version_difference_count - 1
                   where code = ?`
      db.run(sql, code).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  resetVdc(code) {
    return new Promise((resolve, reject) => {
      const sql = `update t_category set version_difference_count = 0
                   where code = ?`
      db.run(sql, code).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getTotalVdc() {
    return new Promise((resolve, reject) => {
      const sql = 'select sum(version_difference_count) count from t_category'
      db.get(sql).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  updateHide(isHide, codeList) {
    if (!codeList || codeList.length === 0) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const sql = `update t_category set is_hide = ?
                   where code in ${util.sqlWhereIn(codeList)}`
      db.run(sql, isHide).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

export default categoryDao
