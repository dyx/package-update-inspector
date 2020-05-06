import axios from 'axios'
import cheerio from 'cheerio'
import consts from '@/utils/consts'
import packageDao from '@/dao/package'
import util from '@/utils/util'
import categoryDao from '@/dao/category'

const http = axios.create({
  // ms
  timeout: 30000
})

const getNpmPackage = async (baseUrl, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/package/${packageName}`).then(res => {
      const $ = cheerio.load(res.data)
      const packageInfo = $('#top').children().last().children('div')
      const latestVersion = packageInfo.find('h3:contains(Version)').siblings().text()
      const publishTime = packageInfo.find('h3:contains(Last publish)').siblings().children().first().attr('datetime')
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime) })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getMavenPackage = (baseUrl, groupName, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/artifact/${groupName}/${packageName}`).then(res => {
      const $ = cheerio.load(res.data)
      console.log(res.data)
      const packageInfo = $('.artifacts table').children('tbody').first().children('tr').first()
      const latestVersion = packageInfo.find('.version-row .latest').first().text()
      const publishTime = packageInfo.children('td').last().text()
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime) })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getMavenPackageByJson = (baseUrl, groupName, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/solrsearch/select?q=g:${groupName}+AND+a:${packageName}&start=0&rows=20`).then(res => {
      if (res.data && res.data.response && res.data.response.docs && res.data.response.docs[0]) {
        const packageInfo = res.data.response.docs[0]
        const latestVersion = packageInfo.latestVersion
        const publishTime = packageInfo.timestamp
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime) })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getComposerPackage = (baseUrl, groupName, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/packages/${groupName}/${packageName}`).then(res => {
      const $ = cheerio.load(res.data)
      const packageInfo = $('.version-details').children('.title')
      const latestVersion = packageInfo.children('.version-number').text()
      const publishTime = packageInfo.children('.release-date').text()
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime) })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getRubyGemsPackage = (baseUrl, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/gems/${packageName}`).then(res => {
      const $ = cheerio.load(res.data)
      const packageInfo = $('.gem__versions').children().first()
      const latestVersion = packageInfo.children('a').first().text()
      const publishTime = packageInfo.children('small').first().text()
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime, 'YYYY-MM-DD') })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getGitHubPackage = (baseUrl, groupName, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/${groupName}/${packageName}/releases`).then(res => {
      const $ = cheerio.load(res.data)
      const packageInfo = $('.release-entry').children('.label-latest')
      console.log(packageInfo.find('.release-header').find('relative-time').html())
      const latestVersion = packageInfo.find('.muted-link').first().attr('title')
      const publishTime = packageInfo.find('.release-header').find('relative-time').first().attr('datetime')
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime) })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getNuGetPackage = (baseUrl, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/packages/${packageName}`).then(res => {
      const $ = cheerio.load(res.data)
      const latestVersion = $('.package-title').find('small').first().text()
      const publishTime = $('.package-details-info').children('ul').first().children().first().children('span').first().attr('data-datetime')
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime) })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getCocoaPodsPackage = (baseUrl, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/pods/${packageName}`).then(res => {
      console.log(res.data)
      const $ = cheerio.load(res.data)
      const latestVersion = $('section.container').find('h1 span').first().text()
      const publishTime = $('.pod_result .sideline')
        .find('table.header')
        .children().first()
        .children().last()
        .children().last().text()
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime, 'YYYY-MM') })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

const getPyPiPackage = (baseUrl, packageName) => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/project/${packageName}`).then(res => {
      console.log(res.data)
      const $ = cheerio.load(res.data)
      const packageInfo = $('#content .package-header')
      const latestVersionStr = packageInfo.find('.package-header__name').first().text()
      const latestVersion = latestVersionStr.toLowerCase().replace(packageName.toLowerCase(), '').trim()
      const publishTime = packageInfo.find('.package-header__date').children('time').first().attr('datetime')
      if (latestVersion) {
        resolve({ latestVersion, publishTime: util.dateFormat(publishTime) })
      } else {
        resolve({})
      }
    }).catch(err => {
      reject(err)
    })
  })
}

export const getPackage = async (categoryCode, baseUrl, groupName, packageName) => {
  const second = util.random(100, 300)
  console.log(`sleep：${second}ms`)
  await util.sleep(second)
  if (categoryCode === consts.CATEGORY_CODE_NPM) {
    return await getNpmPackage(baseUrl, packageName)
  } else if (categoryCode === consts.CATEGORY_CODE_MAVEN) {
    return await getMavenPackageByJson(baseUrl, groupName, packageName)
  } else if (categoryCode === consts.CATEGORY_CODE_COMPOSER) {
    return await getComposerPackage(baseUrl, groupName, packageName)
  } else if (categoryCode === consts.CATEGORY_CODE_RUBY_GEMS) {
    return await getRubyGemsPackage(baseUrl, packageName)
  } else if (categoryCode === consts.CATEGORY_CODE_GIT_HUB) {
    await util.sleep(1000)
    return await getGitHubPackage(baseUrl, groupName, packageName)
  } else if (categoryCode === consts.CATEGORY_CODE_NU_GET) {
    return await getNuGetPackage(baseUrl, packageName)
  } else if (categoryCode === consts.CATEGORY_CODE_COCOA_PODS) {
    return await getCocoaPodsPackage(baseUrl, packageName)
  } else if (categoryCode === consts.CATEGORY_CODE_PY_PI) {
    return await getPyPiPackage(baseUrl, packageName)
  }
  return null
}

export const checkPackage = async () => {
  const packageList = await packageDao.getAll()
  for (const item of packageList) {
    const start = new Date().getTime()
    const remotePackageInfo = await getPackage(item.categoryCode, item.baseUrl, item.groupName, item.name).catch(() => {})
    console.log(`${item.name} 耗时：${new Date().getTime() - start}ms`)
    if (remotePackageInfo && remotePackageInfo.latestVersion && remotePackageInfo.latestVersion !== item.latestVersion) {
      await packageDao.updateLatestVersion({
        categoryCode: item.categoryCode,
        groupName: item.groupName,
        name: item.name,
        latestVersion: remotePackageInfo.latestVersion,
        publishTime: remotePackageInfo.publishTime
      }).catch(() => {})
      await categoryDao.updateIncreaseVdc(item.categoryCode).catch(() => {})
    }
  }
  return await categoryDao.getTotalVdc()
}
