import db from '@/db'
import util from '@/utils/util'
import categoryDao from '@/dao/category'
const packageDao = {
  getAll() {
    return new Promise((resolve, reject) => {
      const sql = `select package.category_code categoryCode, package.name,
                   package.group_name groupName,
                   package.current_version currentVersion,
                   package.latest_version latestVersion,
                   package.publish_time publishTime,
                   category.base_url baseUrl
                   from t_package package
                   left join t_category category on category.code = package.category_code
                   where category.is_hide = 0
                   order by package.category_code, package.name`
      db.all(sql).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getListByCategoryCode(categoryCode) {
    return new Promise((resolve, reject) => {
      const sql = `select category_code categoryCode, name, group_name groupName,
                   current_version currentVersion,
                   latest_version latestVersion,
                   publish_time publishTime
                   from t_package
                   where category_code = ?
                   order by name`
      db.all(sql, categoryCode).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  add ({ categoryCode, name, groupName, currentVersion, latestVersion, publishTime }) {
    return new Promise((resolve, reject) => {
      const sql = `insert into t_package
                   (category_code, name, group_name, current_version, latest_version, publish_time, create_time)
                   values
                   (?, ?, ?, ?, ?, ?, ?)`
      db.run(sql, [categoryCode, name, groupName || '', currentVersion, latestVersion, publishTime || '', util.dateFormat(new Date())]).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  updateLatestVersion({ categoryCode, groupName, name, latestVersion, publishTime }) {
    return new Promise((resolve, reject) => {
      const sql = 'update t_package set latest_version = ?, publish_time = ? where category_code = ? and group_name = ? and name = ?'
      db.run(sql, [latestVersion, publishTime, categoryCode, groupName, name]).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  updateSameVersionById({ categoryCode, groupName, name }) {
    return new Promise((resolve, reject) => {
      const sql = 'update t_package set current_version = latest_version where category_code = ? and group_name = ? and name = ?'
      db.run(sql, [categoryCode, groupName, name]).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  updateSameVersionByCategoryCode(categoryCode) {
    return new Promise((resolve, reject) => {
      const sql = 'update t_package set current_version = latest_version where category_code = ?'
      db.run(sql, [categoryCode]).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  removeById({ categoryCode, groupName, name }) {
    return new Promise((resolve, reject) => {
      const sql = 'select count(*) count from t_package where category_code = ? and group_name = ? and name = ? and latest_version != current_version'
      db.get(sql, [categoryCode, groupName, name]).then(res => {
        console.log(res)
        if (res && res.count && res.count > 0) {
          categoryDao.updateDecreaseVdc(categoryCode)
        }
      })
      const removeSql = 'delete from t_package where category_code = ? and group_name = ? and name = ?'
      db.run(removeSql, [categoryCode, groupName, name]).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

export default packageDao
