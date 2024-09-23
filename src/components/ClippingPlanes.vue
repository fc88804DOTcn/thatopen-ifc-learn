<template>
  <div class="case camera">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="ClippingPlanes">
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";
import { onMounted } from "vue";

let components = new OBC.Components();
onMounted(() => {
  let container = document.getElementById("container")!;
  let worlds = components.get(OBC.Worlds);
  let world = worlds.create<
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
  let grids = components.get(OBC.Grids);
  grids.create(world);

  world.camera.controls.setLookAt(15, 50, 80, 0, 0, 0);
  world.scene.setup();

  let cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });

  let cubeGeometry = new THREE.BoxGeometry(10, 10, 10);

  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0, 5, 0);

  world.scene.three.add(cube);
  world.meshes.add(cube);

  const clipper = components.get(OBC.Clipper);
  clipper.enabled = true;

  container.ondblclick = () => {
    if (clipper.enabled) {
      clipper.create(world);
    }
  };

  window.onkeydown = (event) => {
    if (event.code === "Delete" || event.code === "Backspace") {
      if (clipper.enabled) {
        clipper.delete(world);
      }
    }
  };

  let stats = new Stats();
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
    <bim-panel label="Clipper Tutorial" class="options-menu">
          <bim-panel-section collapsed label="Commands">
      
        <bim-label>Double click: Create clipping plane</bim-label>
        <bim-label>Delete key: Delete clipping plane</bim-label>
       
        
      </bim-panel-section>
      <bim-panel-section collapsed label="Others"">
          
        <bim-checkbox label="Clipper enabled" checked 
          @change="${({ target }: { target: BUI.Checkbox }) => {
            clipper.enabled = target.value;
          }}">
        </bim-checkbox>
        
        <bim-checkbox label="Clipper visible" checked 
          @change="${({ target }: { target: BUI.Checkbox }) => {
            clipper.visible = target.value;
          }}">
        </bim-checkbox>
      
        <bim-color-input 
          label="Planes Color" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            clipper.material.color.set(target.color);
          }}">
        </bim-color-input>
        
        <bim-number-input 
          slider step="0.01" label="Planes opacity" value="0.2" min="0.1" max="1"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            clipper.material.opacity = target.value;
          }}">
        </bim-number-input>
        
        <bim-number-input 
          slider step="0.1" label="Planes size" value="5" min="2" max="10"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            clipper.size = target.value;
          }}">
        </bim-number-input>
        
        <bim-button 
          label="Delete all" 
          @click="${() => {
            clipper.deleteAll();
          }}">  
        </bim-button>        
        
        <bim-button 
          label="Rotate cube" 
          @click="${() => {
            cube.rotation.x = 2 * Math.PI * Math.random();
            cube.rotation.y = 2 * Math.PI * Math.random();
            cube.rotation.z = 2 * Math.PI * Math.random();
          }}">  
        </bim-button>
       
        
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
