
---
title: vuepress实战
lang: en-ZH
---

### 使用vuepress快速搭建技术文档网站

#### 项目结构

```js
.
├── README.md     // Github项目展示文件
├── docs     //vuepress项目根目录
│   ├── .vuepress      //存放核心内容的文件夹
│   │   ├── public     //存放静态文件，如图片等
│   │   └── config.js     //设定顶部导航栏、侧边导航栏等项目配置的核心文件
│   ├── pages      //存放markdown页面的文件
│   ├── README.md     //vuepress首页展示用的markdown文件
├── deploy.sh     //用于编写TravisCI上传、发布的脚本文件
├── LISENSE     //许可证文件
├── package.json     //Node.js项目描述文件
└── .travis.yml //Travis CI 自动部署文件
```