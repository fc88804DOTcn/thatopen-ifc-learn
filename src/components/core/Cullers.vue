<template>
  <div class="case camera">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="Cullers">
import * as THREE from "three";
import Stats from "stats.js";
import * as OBC from "@thatopen/components";

import { onMounted } from "vue";
onMounted(() => {
  const container = document.getElementById("container")!;
  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();

  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBC.SimpleRenderer(components, container);
  world.camera = new OBC.SimpleCamera(components);
  components.init();

  world.camera.controls.setLookAt(13, 13, 13, 0, 0, 0);
  world.scene.setup();

  const grids = components.get(OBC.Grids);
  grids.create(world);

  world.scene.three.background = null;

  const cullers = components.get(OBC.Cullers);
  const culler = cullers.create(world);
  culler.threshold = 200;

  culler.renderDebugFrame = true;
  const debugFrame = culler.renderer.domElement;
  document.body.appendChild(debugFrame);
  debugFrame.style.position = "fixed";
  debugFrame.style.left = "0";
  debugFrame.style.bottom = "0";
  debugFrame.style.visibility = "collapse";

  const cubes: THREE.Mesh[] = [];
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshLambertMaterial({ color: "#6528D7" });

  function getRandomNumber(limit: number) {
    return Math.random() * limit;
  }

  function regenerateCubes() {
    for (let i = 0; i < 300; i++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = getRandomNumber(10);
      cube.position.y = getRandomNumber(10);
      cube.position.z = getRandomNumber(10);
      cube.updateMatrix();
      world.scene.three.add(cube);
      culler.add(cube);
      cubes.push(cube);
    }
  }

  regenerateCubes();

  culler.needsUpdate = true;
  world.camera.controls.addEventListener("controlend", () => {
    culler.needsUpdate = true;
  });

  const stats = new Stats();
  stats.showPanel(2);
  document.body.append(stats.dom);
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());
});
</script>

<style lang="less" scoped>
.case {
  width: 100%;
  height: 100%;
  position: relative;
  margin: 0 auto;
  border: 1px solid red;
  border-radius: 5px;
  .container {
    width: 100%;
    height: 100%;
  }
}
</style>
