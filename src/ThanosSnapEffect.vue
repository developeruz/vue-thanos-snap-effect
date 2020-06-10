<template>
  <div style="position: relative;">
    <transition :name="mainTransition">
      <div ref="main" v-if="showMain">
        <slot></slot>
      </div>
    </transition>
    <div class="dust-container"  v-show="showDust" style="position: absolute; top:0" >
      <transition-group :name="dustTransition">
        <canvas style="position: absolute"
                v-if="hiddenFrames < frame"
                v-for="frame in framesLength"
                :ref="'container' + frame"
                :key="frame"></canvas>
      </transition-group>
    </div>
  </div>
</template>

<script>
  import html2canvas from "html2canvas";
  import {createBlankImageData, weightedRandomDistrib} from "./utils";

  export default {
    name: "ThanosSnapEffect",
    props: {
      startAnimation: {
        type: Boolean,
        default: false
      },
      mainTransition: {
        type: String,
        default: "fade"
      },
      dustTransition: {
        type: String,
        default: "dust"
      },
      pageReady: {
        type: Boolean,
        default: false
      },
      debug: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        showMain: true,
        hiddenFrames: 0,
        framesLength: 32,
        showDust: false
      }
    },
    watch: {
      startAnimation(newValue) {
        if (newValue) {
          this.showDust = true;
          // hiding to trigger transition
          this.showMain = false;
          let interval = setInterval(() => {
            this.hiddenFrames++;
            if (this.hiddenFrames >= this.framesLength) {
              clearInterval(interval);
            }
          }, 100);
        }
      },
      pageReady(newValue) {
        if (newValue) {
          const doc = this.$refs['main'];
          this.drawCanvas(doc);
        }
      }
    },
    methods: {
      generateFrames(canvas) {
        const {width, height} = canvas;
        const ctx = canvas.getContext("2d");
        const originalData = ctx.getImageData(0, 0, width, height);

        const imageDatas = createBlankImageData(originalData, this.framesLength);
        const pixelArr = originalData.data;
        for (let i = 0; i <= pixelArr.length; i += 4) {
          //Find the highest probability canvas the pixel should be in
          let p = Math.floor((i / pixelArr.length) * this.framesLength);
          let a = imageDatas[weightedRandomDistrib(p, this.framesLength)];
          a[i] = pixelArr[i];
          a[i + 1] = pixelArr[i + 1];
          a[i + 2] = pixelArr[i + 2];
          a[i + 3] = pixelArr[i + 3];
        }
        imageDatas.map((data, index) => {
          const c = this.$refs['container' + (index + 1)][0];
          c.width = width;
          c.height = height;
          c.getContext("2d").putImageData(new ImageData(data, width, height), 0, 0);
        });
      },
      async drawCanvas(elm) {
        try {
          const canvas = await html2canvas(elm, {
            allowTaint: true,
            scale: 1,
            useCORS: true,
            backgroundColor: null,
          });
          if(this.debug) {
            window.location.href = canvas.toDataURL("image/png").replace("image/png","image/octet-stream");
          } else {
            this.generateFrames(canvas);
          }
          this.$emit("ready");
        } catch (error) {
          this.$emit("error", error.message);
        }
      },
    },
    mounted() {
      if (this.pageReady) {
        const doc = this.$refs['main'];
        this.drawCanvas(doc);
      }
    }
  }
</script>

<style lang='scss' scoped>

  .fade-leave-to {
    opacity: 0;
  }

  .fade-leave-active {
    transition: 3.2s;
  }

  .dust-leave-to {
    animation: blur-dots .2s;
  }

  @keyframes blur-dots {
    @for $i from 0 through 100 {
      #{$i * 1%} {
        filter: blur(#{$i + "px"});
        transform: translate(#{$i + "px"}, -#{$i + "px"});
        transition: all .4s cubic-bezier(0.55, 0.085, 0.68, 0.53);
      }
    }
  }

  .dust-leave-active {
    transition: .2s;
  }
</style>