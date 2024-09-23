<template>
  <div class="case element-properties">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="ElementProperties">
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as WEBIFC from "web-ifc";
import Stats from "stats.js";
import { onMounted } from "vue";
console.log(CUI);
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
    // 处理获取实体间关系
    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);

    const [propertiesTable, updatePropertiesTable] =
      CUI.tables.elementProperties({
        components,
        fragmentIdMap: {},
      });

    propertiesTable.preserveStructureOnFilter = true;
    propertiesTable.indentationInText = false;
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
  margin: 0 auto;
  border: 1px solid red;
  border-radius: 5px;
  .container {
    width: 100%;
    height: 100%;
  }
}
</style>
