class Snow {
  constructor(opt = {}) {
    // 元素
    this.el = null;
    // 直径
    this.width = 0;
    // 最大直径
    this.maxWidth = opt.maxWidth || 50;
    // 最小直径
    this.minWidth = opt.minWidth || 10;
    // 透明度
    this.opacity = 0;
    // 水平位置
    this.x = 0;
    // 重置位置
    this.y = 0;
    // 速度
    this.sx = 0;
    this.sy = 0;
    // 最大速度
    this.maxSpeed = opt.maxSpeed || 4;
    // 最小速度
    this.minSpeed = opt.minSpeed || 1;

    // 是否左右摇摆
    this.isSwing = false
    // 左右摇摆的正弦函数x变量
    this.swingRadian = 0
    // 左右摇摆的正弦x步长
    this.swingStep = 0.01

    // 窗口尺寸
    this.windowWidth = opt.windowWidth;
    this.windowHeight = opt.windowHeight;

    this.init();
  }

  // 初始化各种属性
  init(reset) {
    let opacity = Math.random() + 0.4

    this.width = Math.floor(Math.random() * this.maxWidth + this.minWidth);
    this.opacity = opacity > 1 ? 1 :  opacity;
    this.x = Math.floor(Math.random() * (this.windowWidth - this.width));
    this.y = reset ? -this.width : Math.floor(Math.random() * (this.windowHeight - this.width));
    this.sx = Math.random() * this.maxSpeed + this.minSpeed;
    this.sx = Math.random() > 0.5 ? this.sx : -this.sx
    this.sy = Math.random() * this.maxSpeed + this.minSpeed;

    this.isSwing = Math.random() > 0.8
    this.swingStep = 0.01 * Math.random()
    this.swingRadian = Math.random() * (1.1 - 0.9) + 0.9// 也让它随机一下
    if (reset) {
      this.setStyle()
    }
  }

  // 设置样式
  setStyle() {
    this.el.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(${this.x}px, ${this.y}px);
      display: block;
      width: ${this.width}px;
      height: ${this.width}px;
      opacity: ${this.opacity};
      background-image: radial-gradient(#fff 0%, rgba(255, 255, 255, 0) 60%);
      border-radius: 50%;
      z-index: 9999999999999;
      pointer-events: none;
    `;
  }

  // 渲染
  render(parent) {
    this.el = document.createElement("div");
    this.setStyle();
    parent.appendChild(this.el);
  }
  // 一帧动画
  move() {
    if (this.x < -this.width || this.x > this.windowWidth || this.y > this.windowHeight) {
      this.init(true)
      return false
    }
    if (this.isSwing) {
      if (this.swingRadian > 1.1 || this.swingRadian < 0.9) {
        this.swingStep = -this.swingStep
      }
      this.swingRadian += this.swingStep
      this.x += this.sx * Math.sin(this.swingRadian * Math.PI)
      this.y -= this.sy * Math.cos(this.swingRadian * Math.PI)// 因为速度都是负的，所以改成-
    } else {
      this.x += this.sx
      this.y += this.sy
    }
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`
  }
}

export default Snow;
