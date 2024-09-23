<template>
  <div class="case camera">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="OtrhoPerspectiveCamera">
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
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  >();
  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBC.SimpleRenderer(components, container);
  world.camera = new OBC.OrthoPerspectiveCamera(components);
  components.init();
  world.scene.three.background = null;

  // 添加网格
  let grids = components.get(OBC.Grids);
  let grid = grids.create(world);

  world.camera.controls.setLookAt(15, 50, 80, 0, 0, 0);
  world.scene.setup();

  let cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
  let greenMaterial = new THREE.MeshStandardMaterial({ color: "#BCF124" });

  let cubeGeometry = new THREE.BoxGeometry(10, 10, 10);

  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0, 0.5, 0);

  world.scene.three.add(cube);
  world.meshes.add(cube);
  let cubes = [cube];

  let oneDegree = Math.PI / 180;

  function rotateCubes() {
    cube.rotation.x += oneDegree;
    cube.rotation.y += oneDegree;
  }

  world.renderer.onBeforeUpdate.add(rotateCubes);

  let casters = components.get(OBC.Raycasters);
  let caster = casters.get(world);

  let previousSelection: THREE.Mesh | null = null;
  window.onclick = () => {
    let result = caster.castRay(cubes);
    if (previousSelection) {
      previousSelection.material = cubeMaterial;
    }
    if (!result || !(result.object instanceof THREE.Mesh)) {
      return;
    }
    result.object.material = greenMaterial;
    previousSelection = result.object;
  };

  world.camera.projection.onChanged.add(() => {
    let projection = world.camera.projection.current;
    grid.fade = projection === "Perspective";
  });

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

  let panel = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
    <bim-panel active label="Orthoperspective Camera Tutorial" class="options-menu">
      <bim-panel-section collapsed label="Controls">
         
          <bim-dropdown required label="Navigation mode" 
            @change="${({ target }: { target: BUI.Dropdown }) => {
              let selected = target.value[0] as OBC.NavModeID;

              let { current } = world.camera.projection;
              let isOrtho = current === "Orthographic";
              let isFirstPerson = selected === "FirstPerson";
              if (isOrtho && isFirstPerson) {
                alert("First person is not compatible with ortho!");
                target.value[0] = world.camera.mode.id;
                return;
              }
              world.camera.set(selected);
            }}">

          <bim-option checked label="Orbit"></bim-option>
          <bim-option label="FirstPerson"></bim-option>
          <bim-option label="Plan"></bim-option>
        </bim-dropdown>
         
      
        <bim-dropdown required label="Camera projection" 
            @change="${({ target }: { target: BUI.Dropdown }) => {
              let selected = target.value[0] as OBC.CameraProjection;
              let isOrtho = selected === "Orthographic";
              let isFirstPerson = world.camera.mode.id === "FirstPerson";
              if (isOrtho && isFirstPerson) {
                alert("First person is not compatible with ortho!");
                target.value[0] = world.camera.projection.current;
                return;
              }
              world.camera.projection.set(selected);
            }}">
          <bim-option checked label="Perspective"></bim-option>
          <bim-option label="Orthographic"></bim-option>
        </bim-dropdown>

        <bim-checkbox 
          label="Allow user input" checked 
          @change="${({ target }: { target: BUI.Checkbox }) => {
            world.camera.setUserInput(target.checked);
          }}">  
        </bim-checkbox>  
        
        <bim-button 
          label="Fit cube" 
          @click="${() => {
            world.camera.fit([cube]);
          }}">  
        </bim-button>
        
        <bim-button 
          label="Reset scene" 
          @click="${async () => {
            components.dispose();

            components = new OBC.Components();
            worlds = components.get(OBC.Worlds);

            world = worlds.create<
              OBC.SimpleScene,
              OBC.OrthoPerspectiveCamera,
              OBC.SimpleRenderer
            >();

            world.scene = new OBC.SimpleScene(components);
            world.renderer = new OBC.SimpleRenderer(components, container);
            world.camera = new OBC.OrthoPerspectiveCamera(components);

            world.scene.setup();

            await world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);

            components.init();

            world.scene.three.background = null;

            cubeGeometry = new THREE.BoxGeometry();
            cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
            cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(0, 0.5, 0);

            world.scene.three.add(cube);
            world.meshes.add(cube);

            grids = components.get(OBC.Grids);
            grid = grids.create(world);

            world.camera.projection.onChanged.add(() => {
              let projection = world.camera.projection.current;
              grid.fade = projection === "Perspective";
            });
          }}">  
        </bim-button>  

      </bim-panel-section>
    </bim-panel>
    `;
  });

  document.body.append(panel);

  let button = BUI.Component.create<BUI.PanelSection>(() => {
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
