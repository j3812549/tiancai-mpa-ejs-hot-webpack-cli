1. # tiancai-mpa-ejs-hot-webpack-cli

   #### 概述：带热更新的多页面可模块化的脚手架工具、请求同时支持SEO和AJax、支持SCSS编写

   #### 仓库

   * [GITHUB](https://github.com/j3812549/tiancai-mpa-ejs-hot-webpack-cli.git)

   #### 安装：

   ```
   git clone https://github.com/j3812549/tiancai-mpa-ejs-hot-webpack-cli.git
   ```

   #### 快速开始：

   ```
   git clone https://github.com/j3812549/tiancai-mpa-ejs-hot-webpack-cli.git
   cd ./tiancai-mpa-ejs-hot-webpack-cli
   npm install
   npm run dev
   ```

   #### 命令和选项：

   1.  **npm run dev** 开发环境运行
   2.  **npm run prod** 生产环境运行

   #### 目录树

   ```
   
   │  app.js // node server
   ├─config
   │      index.js
   │      webpack.base.config.js // webpack共用文件
   │      webpack.dev.config.js // dev环境webpack配置文件
   │      webpack.prod.config.js // prod环境webpack配置文件
   │
   ├─dist // webpack打包文件
   ├─loader
   │      autoLoadFiles.js // 处理多页面自动引入生产的loader
   ├─plugins
   │      resolveEjsPlugin.js // 处理正式环境打包ejs的plugin
   ├─routes // 服务端路由
   └─src // 主要开发的目录
       ├─api
       ├─assets
       ├─entry // 入口文件，在此目录下编写JS文件会在sass、view目录下自动生产对应的scss、ejs文件
       ├─sass
       └─view // 存放ejs的地方
   │ register_data.js // 处理SEO渲染的JS文件
   ```

   #### 使用限制

   ​	为实现热更新并与其他插件不进行冲突的情况下、自定义了一部分语法，以下为各文件编写时的注意事项

   * EJS
     ```
     使用公共的组件模块的语法
     <%= require('./header.ejs')() %>
     <%= require('./header.ejs')({ name: '欢迎来到xxx' }) %> // 传递值时
     
     使用代码逻辑块
         错误示范
         <% if (user) { %>
           <h2><%= user.name %></h2>
         <% } %>
         正确示范
         [[ if (user) { ]]
           <h2>{{ user.name }}></h2>
         [[ } ]]
     
     输出值
     <div>{{ name }}</div>
     
     不支持EJS使用本地资源引入
     <img src="@/static/1.png"/>
     
     正确的引入方式
     .icon-image { background-image: url('@/static/1.png') }
     <div class="icon-image"></div>
     
     ```

#### 使用

1. 在src/entry目录下创建[key].js，会在sass、view目录下自动生产对应的scss、ejs文件
2. 在sass下编写css
3. 在view下编写ejs

#### SEO

​	使用配置文件/src/register_data.js搭配ejs可支持SEO。

```javascript
// src/register_data.js

// 本文件禁用'@'
import { test } from './api/index'

export default {
  // index对应的为src/view/index[key].ejs的文件
  index: async () => {
     const data = await test() // 支持远程请求
     return { title: data }
  },
  // index: {
  //  title: 'xxx'
  // },
}

```

````
// src/view/index.ejs
...
<body>
	<div>{{ title }}</div>
</body>
...
````

#### 自定义模板

在根目录创建ejs-template.ejs，在src/entry创建js,会根据此模板生成ejs

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>tiancai-mpa-ejs-hot-webpack-cli</title>
</head>

<body>
  <div>自定义生产模板</div>
</html>
```

