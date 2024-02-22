const express = require('express')
const fs = require('fs')
const he = require('he')
const path = require('path')
const config = require('../config')

const axios = require('axios')
const ejs = require('ejs')
const router = express.Router()
const isDev = process.env.MODE_ENV === 'development'
const pages = fs.readdirSync(path.join(__dirname, '../src/entry'), 'utf-8').map(v => v.replace(/.js/g, ''))
const distDir = path.join(__dirname, '../dist/')

const getSource = async (key) => {
  const filename = `../src/register_data.js`
  if (!fs.existsSync(filename)) return {}
  const sources = require(filename).default
  let data = {}
  if (typeof sources[key] === 'function') {
    data = await sources[key]()
  } else if (typeof sources[key] === 'object') {
    data = sources[key]
  }
  return data
}

const resolvePath = async (req, res) => {
  let { url, path } = req
  const key = pages.find(v => v === path.replace(/\//i, ''))
  if (isDev) {
    let server_url = `http://localhost:8080${url}`
    try {
      if (key || path === '/') {
        if (path !== '/') server_url = server_url + '.html'
        const result = await axios.get(server_url)
        const template = result.data.replace(/{{/g, '<%=').replace(/}}/g, '%>').replace(/\[\[/g, '<%').replace(/\]\]/g, '%>')

        const source = await getSource(key || 'index')
        const data = ejs.render(he.decode(template), source)
        res.send(data)
      } else {
        if (url.match(/\.js|.json$/)) {
          const result = await axios.get(server_url)
          res.send(result.data)
          return
        }
        // 对静态文件进行转发
        res.redirect(server_url)
      }
    } catch (err) {
      res.send(err)
    }
  } else {
    const source = await getSource(key || 'index')
    // const template = fs.readFileSync(distDir + (key || 'index') + config.build_ext, 'utf8')
    // const data = ejs.render(he.decode(template), source)
    // res.send(data)
    res.render(key || 'index', source)
  }
}

router.use('/', async (req, res) => {
  resolvePath(req, res)
})

module.exports = router
