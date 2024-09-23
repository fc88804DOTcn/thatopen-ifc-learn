<template>
  <div class="case camera">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="Hider">
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
      // "http://10.25.68.97:12013/zhidajlsynergy/2024/09/20/84f7701c132d4c35bfad0e068727eeb4.ifc "
    );
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    const model = await fragmentIfcLoader.load(buffer);
    model.name = "example";
    world.scene.three.add(model);
  }
  fragments.onFragmentsLoaded.add(async (model) => {
    const hider = components.get(OBC.Hider);
    const classifier = components.get(OBC.Classifier);

    // 处理获取实体间关系
    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);
    const psets = indexer.getEntityRelations(model, 6518, "IsDefinedBy");
    if (psets) {
      for (const expressID of psets) {
        // You can get the pset attributes like this
        const pset = await model.getProperties(expressID);
        console.log(pset);
        // You can get the pset props like this or iterate over pset.HasProperties yourself
        await OBC.IfcPropertiesUtils.getPsetProps(
          model,
          expressID,
          async (propExpressID) => {
            const prop = await model.getProperties(propExpressID);
            console.log(prop);
          }
        );
      }
    }
    indexer.serializeModelRelations(model);

    classifier.byEntity(model);
    await classifier.bySpatialStructure(model, {
      isolate: new Set([WEBIFC.IFCBUILDINGSTOREY]),
    });
    BUI.Manager.init();
    const spatialStructures: Record<string, any> = {};
    const structureNames = Object.keys(classifier.list.spatialStructures);
    for (const name of structureNames) {
      spatialStructures[name] = true;
    }

    const classes: Record<string, any> = {};
    const classNames = Object.keys(classifier.list.entities);
    for (const name of classNames) {
      classes[name] = true;
    }
    const panel = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
    <bim-panel active label="操作面板" class="options-menu">
      <bim-panel-section collapsed label="控制器">
      
      <bim-panel-section collapsed label="空间结构" name="Floors"">
      </bim-panel-section>
      
      <bim-panel-section collapsed label="类别" name="Categories"">
      </bim-panel-section>
      
    </bim-panel>
  `;
    });

    document.body.append(panel);

    const floorSection = panel.querySelector(
      "bim-panel-section[name='Floors']"
    ) as BUI.PanelSection;

    const categorySection = panel.querySelector(
      "bim-panel-section[name='Categories']"
    ) as BUI.PanelSection;

    for (const name in spatialStructures) {
      const panel = BUI.Component.create<BUI.Checkbox>(() => {
        return BUI.html`
      <bim-checkbox checked label="${name == "Undefined" ? "未识别名称" : name}"
        @change="${({ target }: { target: BUI.Checkbox }) => {
          const found = classifier.list.spatialStructures[name];
          if (found && found.id !== null) {
            for (const [_id, model] of fragments.groups) {
              const foundIDs = indexer.getEntityChildren(model, found.id);
              const fragMap = model.getFragmentMap(foundIDs);
              hider.set(target.value, fragMap);
            }
          }
        }}">
      </bim-checkbox>
    `;
      });
      floorSection.append(panel);
    }

    for (const name in classes) {
      const checkbox = BUI.Component.create<BUI.Checkbox>(() => {
        return BUI.html`
      <bim-checkbox checked label="${
        name == "IFCBEAM"
          ? "梁"
          : name == "IFCCOLUMN"
          ? "柱"
          : name == "IFCMEMBER"
          ? "构件"
          : name == "IFCPLATE"
          ? "面板"
          : name
      }"
        @change="${({ target }: { target: BUI.Checkbox }) => {
          const found = classifier.find({ entities: [name] });
          hider.set(target.value, found);
        }}">
      </bim-checkbox>
    `;
      });
      categorySection.append(checkbox);
    }
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
