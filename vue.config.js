const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: (config) => {
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.lhd.pui',
        productName: '包更新检查器',
        artifactName: '${name}-${version}.${ext}',
        win: {
          icon: './public/icon.ico',
          target: 'nsis'
        },
        nsis: {
          oneClick: false,
          allowElevation: true,
          perMachine: true,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true
        },
        mac: {
          icon: './public/icon.icns',
          target: 'dmg'
        }
      }
    }
  }
}
