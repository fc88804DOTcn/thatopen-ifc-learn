<template>
  <div class="case camera">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="Classfier">
import Stats from "stats.js";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

import { onMounted } from "vue";
onMounted(async () => {
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

  world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

  world.scene.setup();

  const fragments = components.get(OBC.FragmentsManager);
  const fragmentIfcLoader = components.get(OBC.IfcLoader);
  await fragmentIfcLoader.setup();
  async function loadIfc() {
    const file = await fetch(
      "https://thatopen.github.io/engine_ui-components/resources/small.ifc"
    );
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    const model = await fragmentIfcLoader.load(buffer);
    model.name = "example";
    world.scene.three.add(model);
  }
  fragments.onFragmentsLoaded.add((model) => {
    const classifier = components.get(OBC.Classifier);
    classifier.byEntity(model);
    classifier.byIfcRel(
      model,
      WEBIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
      "storeys"
    );
    classifier.byModel(model.uuid, model);
    const walls = classifier.find({
      entities: ["IFCWALLSTANDARDCASE"],
    });
    const slabs = classifier.find({
      entities: ["IFCSLAB"],
    });

    const curtainWalls = classifier.find({
      entities: ["IFCMEMBER", "IFCPLATE"],
    });

    const furniture = classifier.find({
      entities: ["IFCFURNISHINGELEMENT"],
    });

    const doors = classifier.find({
      entities: ["IFCDOOR"],
    });

    const all = classifier.find({
      models: [model.uuid],
    });
    BUI.Manager.init();
    const color = new THREE.Color();
    const panel = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
    <bim-panel active label="Classifier Tutorial" class="options-menu">
      <bim-panel-section collapsed label="Controls">
      
        <bim-color-input 
          label="Walls Color" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            color.set(target.color);
            classifier.setColor(walls, color);
          }}">
        </bim-color-input>
      
        <bim-color-input 
          label="Slabs Color" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            color.set(target.color);
            classifier.setColor(slabs, color);
          }}">
        </bim-color-input>
      
        <bim-color-input 
          label="Curtain walls Color" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            color.set(target.color);
            classifier.setColor(curtainWalls, color);
          }}">
        </bim-color-input>
      
        <bim-color-input 
          label="Furniture Color" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            color.set(target.color);
            classifier.setColor(furniture, color);
          }}">
        </bim-color-input>
      
        <bim-color-input 
          label="Doors Color" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            color.set(target.color);
            classifier.setColor(doors, color);
          }}">
        </bim-color-input>

        <bim-color-input 
          label="整体" color="#202932" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            color.set(target.color);
            classifier.setColor(all, color);
          }}">
        </bim-color-input>
                  
        <bim-button 
          label="Reset walls color" 
          @click="${() => {
            classifier.resetColor(all);
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
  await loadIfc();

  const stats = new Stats();
  stats.showPanel(0);
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
