const fs = require('fs')
const path = require('path')
const config = require('../config/index')

class ResolveEjsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('ResolveEjsPlugin', (compilation, callback) => {
      const rootDir = compilation.options.context
      const distDir = compilation.options.output.path
      const jsFiles = []
      const cssFiles = []

      for (const filename in compilation.assets) {
        if (filename.endsWith('.js')) {
          jsFiles.push(filename)
        } else if (filename.endsWith('.css')) {
          cssFiles.push(filename)
        }
      }

      const pages = fs.readdirSync(path.join(rootDir, './src/entry'), 'utf-8').map(v => v.replace(/.js/, ''))
      const ejs = fs.readdirSync(path.join(rootDir, './src/view'), 'utf-8').map(v => v.replace(/.ejs/, ''))

      ejs.forEach(v => {
        const filename = path.join(rootDir, `./src/view/`) + v + '.ejs'
        let template = fs.readFileSync(filename, 'utf-8')
        template = template.replace(/<%=\s*require\(['"](.+)['"]\).*%>/g, (o, v) => {
          const filename = path.join(rootDir, `./src/view/`, v)
          let temp = fs.readFileSync(filename, 'utf-8')

          const key = v.replace(/(\.|ejs)/g, '')
          const cssPath = './' + cssFiles.find(f => f.indexOf(key) > -1)
          const jsPath = './' + jsFiles.find(f => f.indexOf(key) > -1)
          const cssTemp = `<link href="${cssPath}" rel="stylesheet" />`
          const jsTemp = `<script src="${jsPath}"></script>`
          temp += cssTemp
          temp += jsTemp
          temp = temp.replace(o, temp)
          return temp
        })

        template = template.replace(/{{/g, '<%=').replace(/}}/g, '%>').replace(/\[\[/g, '<%').replace(/\]\]/g, '%>')
        if (pages.indexOf(v) > -1) {
          const cssPath = './' + cssFiles.find(f => f.indexOf(v) > -1)
          const jsPath = './' + jsFiles.find(f => f.indexOf(v) > -1)
          const cssTemp = `<link href="${cssPath}" rel="stylesheet" />`
          const jsTemp = `<script src="${jsPath}"></script>`
          if (template.match(/<\/head>/)) {
            template = template.replace(/<\/head>/, `${cssTemp}</head>`)
          } else {
            template = template + cssTemp
          }
          if (template.match(/<\/html>/)) {
            template = template.replace(/<\/html>/, `${jsTemp}</html>`)
          } else {
            template = template + jsTemp
          }
        }
        // template = template.replace(/[\r\n]/g, '')
        fs.writeFileSync(path.join(distDir, '/') + v + config.build_ext, template, 'utf-8')
      })


      callback()
    })
  }
}

module.exports = ResolveEjsPlugin
