<template>
  <div class="case">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="CreateOur3DWorld">
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";
import { onMounted } from "vue";

import { HelloWorldComponent } from "../packages/HelloWrold";

onMounted(() => {
  const container = document.getElementById("container")!;
  const components = new OBC.Components();
  // 引入自定义组件
  // const helloWorldComponent = new HelloWorldComponent(components);
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
  world.scene.three.background = null;

  // 添加网格
  const grids = components.get(OBC.Grids);
  grids.create(world);

  const material = new THREE.MeshLambertMaterial({ color: "#6528D7" });
  const geometry = new THREE.BoxGeometry();
  const cube = new THREE.Mesh(geometry, material);
  world.scene.three.add(cube);

  world.scene.setup();

  world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);

  const stats = new Stats();
  stats.showPanel(0);
  document.body.append(stats.dom);
  stats.dom.className = "stats";
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "3";
  stats.dom.style.width = "80px";
  stats.dom.style.height = "48px";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());

  BUI.Manager.init();

  const panel = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
    <bim-panel label="引导" class="options-menu">
      <bim-panel-section collapsed label="控制器">
        <bim-color-input 
          label="背景颜色" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            world.scene.three.background = new THREE.Color(target.color);
          }}">
        </bim-color-input>
        
        <bim-number-input 
          slider step="0.1" label="直射光强度" value="1.5" min="0.1" max="10"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            for (const child of world.scene.three.children) {
              if (child instanceof THREE.DirectionalLight) {
                child.intensity = target.value;
              }
            }
          }}">
        </bim-number-input>
        
        <bim-number-input 
          slider step="0.1" label="环境光强度" value="1" min="0.1" max="5"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            for (const child of world.scene.three.children) {
              if (child instanceof THREE.AmbientLight) {
                child.intensity = target.value;
              }
            }
          }}">
        </bim-number-input>
        
      </bim-panel-section>
    </bim-panel>
    `;
  });

  document.body.append(panel);

  const button = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
        @click="${() => {
          if (panel.classList.contains("options-menu-visible")) {
            panel.classList.remove("options-menu-visible");
          } else {
            panel.classList.add("options-menu-visible");
          }
        }}">
      </bim-button>
    `;
  });

  document.body.append(button);
});
</script>

<style lang="less" scoped>
.case {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  border: 1px solid red;
  border-radius: 5px;
  .container {
    width: 100%;
    height: 100%;
  }
}
</style>
