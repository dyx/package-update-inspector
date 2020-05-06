import sqlite3 from 'sqlite3'
import { remote } from 'electron'
import path from 'path'
const sqlite = sqlite3.verbose()

const DB_FULL_PATH = path.join(remote.app.getPath('userData'), 'pui.db')

const db = {
  conn: null,
  connection() {
    if (this.conn) {
      return this.conn
    }
    this.conn = new sqlite.Database(DB_FULL_PATH)
    return this.conn
  },
  async init() {
    console.log('db-init-start')
    await this.run(`create table t_setting
                    (
                      key text not null constraint t_setting_pk primary key,
                      value text
                    );`).catch(() => {})
    await this.run(`INSERT INTO t_setting
                    (key, value)
                    VALUES
                    ('remind_period', '10:00'),
                    ('remind_enabled', '1');`).catch(() => {})
    await this.run(`create table t_category
                    (
                      code text not null constraint t_category_pk primary key,
                      name text,
                      base_url text,
                      version_difference_count integer default 0 not null,
                      order_no int,
                      is_hide int default 0 not null
                    );`).catch(() => {})
    await this.run(`INSERT INTO t_category
                    (code, name, base_url, version_difference_count, order_no, is_hide)
                    VALUES
                    ('cocoa_pods', 'CocoaPods', 'https://cocoapods.org', 0, 1, 0),
                    ('composer', 'Composer', 'https://packagist.org', 0, 2, 0),
                    ('git_hub', 'GitHub', 'https://github.com', 0, 3, 0),
                    ('maven', 'Maven', 'https://search.maven.org', 0, 4, 0),
                    ('npm', 'NPM', 'https://www.npmjs.com', 0, 5, 0),
                    ('nu_get', 'NuGet', 'https://www.nuget.org', 0, 6, 0),
                    ('py_pi', 'PyPI', 'https://pypi.org', 0, 7, 0),
                    ('ruby_gems', 'RubyGems', 'https://rubygems.org', 0, 8, 0);`).catch(() => {})
    await this.run(`create table t_package
                    (
                      category_code text default '' not null,
                      group_name text default '' not null,
                      name text default '' not null,
                      current_version text,
                      latest_version text,
                      publish_time text,
                      create_time text,
                      constraint t_package_pk
                      primary key (category_code, group_name, name)
                    );`).catch(() => {})
    console.log('db-init-end')
    return Promise.resolve()
  },
  run(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection().run(sql, params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },
  get(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection().get(sql, params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },
  all(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection().all(sql, params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },
  close() {
    if (this.conn) {
      this.conn.close()
      this.conn = null
    }
  }
}

export default db
