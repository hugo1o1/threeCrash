<template>
  <div id="scanner">
    <div class="model">
      <div class="scanner-view">
        <div class="scanner-view-arrow arrow1"></div>
        <div class="scanner-view-arrow arrow2"></div>
        <div class="scanner-view-arrow arrow3"></div>
        <div class="scanner-view-arrow arrow4"></div>
        <div class="scanner-line"></div>
      </div>
    </div>
    <video
      class="video-view"
      ref="video"
      autoplay
      playsinline="true"
      webkit-playsinline="true"
    ></video>
  </div>
</template>
<script>
import { isPC } from "@/utils.js";
export default {
  name: "UseCamera",
  data() {
    return {
      ws: "",
      url: "ws://localhost:8088"
    };
  },
  methods: {
    initWebsocket() {
      let _this = this;
      if (this.ws) {
        // 已经建立连接
      } else {
        this.createWebsocket();
        this.ws.onopen = function() {
          //设置发信息送类型为：ArrayBuffer
          _this.ws.binaryType = "arraybuffer";
        };
        this.ws.onmessage = function(e) {
          console.log(e);
        };
        this.ws.onclose = function(e) {
          console.log("onclose: closed", e);
          _this.ws = "";
          _this.createWebsocket();
        };
        this.ws.onerror = function(e) {
          console.log("onerror: error", e);
          _this.ws = "";
          _this.createWebsocket();
        };
      }
    },
    createWebsocket() {
      if ("WebSocket" in window) {
        this.ws = new WebSocket(this.url);
      } else {
        console.log("浏览器版本太低，请更换浏览器");
      }
    },
    initVideo(constrains) {
      let _this = this;
      if (navigator.mediaDevices.getUserMedia) {
        //最新标准API
        console.log("here");

        navigator.mediaDevices
          .getUserMedia(constrains)
          .then(_this.videoSuccess)
          .catch(_this.videoError);
      } else if (navigator.webkitGetUserMedia) {
        //webkit内核浏览器
        navigator
          .webkitGetUserMedia(constrains)
          .then(_this.videoSuccess)
          .catch(_this.videoError);
      } else if (navigator.mozGetUserMedia) {
        //Firefox浏览器
        navigator
          .mozGetUserMedia(constrains)
          .then(_this.videoSuccess)
          .catch(_this.videoError);
      } else if (navigator.getUserMedia) {
        //旧版API
        navigator
          .getUserMedia(constrains)
          .then(_this.videoSuccess)
          .catch(_this.videoError);
      }
    },
    videoSuccess(stream) {
      let video = this.$refs.video,
        _this = this,
        chunks = [];
      //将视频流设置为video元素的源
      video.srcObject = stream;
      //播放视频
      video.play();

      // 发送视频流
      // 建立视频录制 MediaRecorder目前不支持ios
      let mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      // 每..秒调用一次，这个参数必须写
      mediaRecorder.start(3000);
      mediaRecorder.onstart = function() {
        console.log("mediaRecorder 开始录制");
      };
      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
        console.log(e.data.type);
        let reader = new FileReader();
        reader.addEventListener("loadend", function() {
          //reader.result是一个含有视频数据流的Blob对象,这里把blob转成ByteBuffer
          var videoBlob = new Uint8Array(reader.result);

          console.log("视频数据流");
          if (reader.result.byteLength > 0) {
            // websocket发送数据
            _this.ws.send(videoBlob);
          }
        });
        reader.readAsArrayBuffer(e.data);
      };
    },
    videoError(error) {
      console.log("访问用户媒体设备失败：", error.name, error.message);
    }
  },
  mounted() {
    // 建立websocket连接
    this.initWebsocket();
    if (
      navigator.mediaDevices.getUserMedia ||
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    ) {
      //调用用户媒体设备，访问摄像头

      let constraint = isPC()
        ? {
            video: {
              height: 800,
              facingMode: "user"
            }
          }
        : {
            video: {
              height: 800,
              facingMode: {
                // 强制后置摄像头
                exact: "environment"
              }
            }
          };
      this.initVideo(constraint);
    } else {
      alert("你的浏览器不支持访问用户媒体设备");
    }
  }
};
</script>
<style scoped>
#scanner {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
}
.model {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  position: relative;
  z-index: 88;
  border-top: calc((100vh - 60vw) / 2) solid rgba(0, 0, 0, 0.2);
  border-bottom: calc((100vh - 60vw) / 2) solid rgba(0, 0, 0, 0.2);
  border-right: 20vw solid rgba(0, 0, 0, 0.2);
  border-left: 20vw solid rgba(0, 0, 0, 0.2);
}
.scanner-view {
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 89;
}
.scanner-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background: #49ff46;
  border-radius: 20px;
  z-index: 90;
  animation: myScan 1s infinite alternate;
}
@keyframes myScan {
  from {
    top: 0;
  }
  to {
    top: 34vh;
  }
}
.scanner-view-arrow {
  position: absolute;
  width: 5vw;
  height: 5vw;
  border: 2px solid #09bb07;
}
.scanner-view-arrow.arrow1 {
  top: -1px;
  left: 0px;
  z-index: 99;
  border-right: none;
  border-bottom: none;
}
.scanner-view-arrow.arrow2 {
  top: -1px;
  right: 0px;
  z-index: 99;
  border-left: none;
  border-bottom: none;
}
.scanner-view-arrow.arrow3 {
  bottom: -1px;
  left: 0px;
  z-index: 99;
  border-right: none;
  border-top: none;
}
.scanner-view-arrow.arrow4 {
  bottom: -1px;
  right: 0px;
  z-index: 99;
  border-left: none;
  border-top: none;
}
.video-view {
  position: absolute;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  top: 0px;
  left: 0px;
  z-index: 80;
}
</style>
