module.exports = {
  base: "/vuepress-githubpages/", // 目录根地址，应与Github仓库名字相同
  title: "清大视光项目文档说明",
  description: "让你快速熟悉项目内容",
  head: [
    [
      "link",
      { rel: "icon", href: "/logo.png" }, //浏览器的标签栏的网页图标,基地址/docs/.vuepress/public
    ],
  ],
  markdown: {
    lineNumbers: true, //是否在每个代码块的左侧显示行号
  },
  themeConfig: {
    nav: [
      // 导航栏配置
      { text: "组件库", link: "/pages/comlibrary/index.md" },
      { text: "微前端", link: "/pages/micro/index.md" },
      { text: "移动端", link: "/pages/mobile/index.md" },
      { text: "前端框架", link: "/pages/frame/index.md" },
      { text: "项目说明", link: "/pages/project/index.md" },
    ],
    repo: "dongpobaicai/vuepress-githubpages",
    repoLabel: "Github",
    smoothScroll: true,
    lastUpdated: '最后更新'
  },
  plugins: [
    "@vuepress/medium-zoom", //zooming images like Medium（页面弹框居中显示）
    "@vuepress/nprogress", //网页加载进度条
    "@vuepress/plugin-back-to-top", //返回页面顶部按钮
  ]
};
