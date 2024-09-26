<template>
  <div class="app">
    <CreateOur3DWorld v-if="false"> </CreateOur3DWorld>
    <InteractIn3DWorld v-else-if="false"></InteractIn3DWorld>
    <OtrhoPerspectiveCamera v-else-if="false"></OtrhoPerspectiveCamera>
    <ClippingPlanes v-else-if="false"></ClippingPlanes>
    <ClippingIfc v-else-if="true"></ClippingIfc>
    <Cullers v-else-if="false"></Cullers>
    <LoadIfc v-else-if="false"></LoadIfc>
    <Classfier v-else-if="false"></Classfier>
    <Hider v-else-if="false"></Hider>
    <ElementProperties v-else-if="true"></ElementProperties>

    <PostProduction v-else></PostProduction>
    <!-- <Dexie></Dexie> -->
  </div>
</template>

<script setup lang="ts" name="App">
import CreateOur3DWorld from "./components/CreateOur3DWorld.vue";
import InteractIn3DWorld from "./components/InteractIn3DWorld.vue";
import OtrhoPerspectiveCamera from "./components/core/OtrhoPerspectiveCamera.vue";
import ClippingPlanes from "./components/ClippingPlanes.vue";
import ClippingIfc from "./components/ClippingIfc.vue";
import Cullers from "./components/core/Cullers.vue";
import Classfier from "./components/core/Classfier.vue";
import Hider from "./components/core/Hider.vue";

import LoadIfc from "./components/core/LoadIfc.vue";

import PostProduction from "./components/front/PostProduction.vue";

import ElementProperties from "./components/element-properties/ElementProperties.vue";

// import Dexie from "dexie";
</script>

<style lang="less" scoped></style>
