<template>
  <div class="container"></div>
</template>

<script>
import Snow from "./com/snow.js";

export default {
  name: "SnowFlake",
  data() {
    return {
      total: 100,
      list: [],
    };
  },
  methods: {
    randomSnow() {
      const containerDom = document.getElementsByClassName("container")[0];
      const options = {
        maxSpeed: 2,
        minSpeed: 0.1,
        windowWidth: containerDom.offsetWidth,
        windowHeight: containerDom.offsetHeight,
      };
      for (let i = 0; i < this.total; i++) {
        const snow = new Snow(options);

        snow.render(containerDom);
        this.list.push(snow);
      }
    },
    moveSnow() {
      window.requestAnimationFrame(() => {
        this.list.forEach((item) => {
          item.move();
        });
        this.moveSnow();
      });
    },
  },
  mounted() {
    // 初始化雪花
    this.randomSnow();
    // 飘起雪花
    this.moveSnow()
  },
};
</script>

<style scoped>
.container {
  position: relative;
  background-color: #bdecff;
  height: 300px;
  margin-top: 10px;
  perspective: 500;
  -webkit-perspective: 500;
}
</style>
