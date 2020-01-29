<template>
  <div class="home">
    <UseCamera />
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'
import UseCamera from "@/components/UseCamera.vue";
export default {
  name: "home",
  components: {
    //HelloWorld
    UseCamera
  }
};
</script>
