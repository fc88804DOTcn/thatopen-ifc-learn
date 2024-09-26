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
import axios from "axios";
import Stats from "stats.js";
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
    const ifcax = await axios.get(
      "http://10.25.68.97:12013/zhidajlsynergy/2024/09/20/84f7701c132d4c35bfad0e068727eeb4.ifc",
      {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.progress) {
            if (progressEvent.progress == 1) {
              console.log("下载完成");
            } else {
              if (progressEvent.total) {
                console.log(
                  `文件大小${progressEvent.total / 1024}kb 已下载${
                    progressEvent.loaded / 1024
                  }kb ，百分比${(progressEvent.progress * 100).toFixed(2)}%`
                );
              }
            }
          }
        },
      }
    );
    const file = await fetch(
      // "https://thatopen.github.io/engine_ui-components/resources/small.ifc"
      "http://10.25.68.97:12013/zhidajlsynergy/2024/09/20/84f7701c132d4c35bfad0e068727eeb4.ifc "
    );
    const data = await ifcax.data.arrayBuffer();
    const buffer = new Uint8Array(data);
    const model = await fragmentIfcLoader.load(buffer);
    model.name = "example";
    world.scene.three.add(model);

    BUI.Manager.init();

    // 处理获取实体间关系
    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);

    const [propertiesTable, updatePropertiesTable] =
      CUI.tables.elementProperties({
        components,
        fragmentIdMap: {},
        emptySelectionWarning: false,
      });
    propertiesTable.preserveStructureOnFilter = true;
    propertiesTable.indentationInText = false;
    propertiesTable.expanded = true;

    const highlighter = components.get(OBF.Highlighter);
    highlighter.setup({ world });

    highlighter.events.select.onHighlight.add((fragmentIdMap) => {
      updatePropertiesTable({ fragmentIdMap });
    });

    highlighter.events.select.onClear.add(() =>
      updatePropertiesTable({ fragmentIdMap: {} })
    );

    const propertiesPanel = BUI.Component.create(() => {
      const expandTable = (e: Event) => {
        const button = e.target as BUI.Button;
        propertiesTable.expanded = !propertiesTable.expanded;
        button.label = propertiesTable.expanded ? "展开" : "折叠";
      };

      return BUI.html`
    <bim-panel label="图纸详情">
      <bim-panel-section label="构件数据">
        <div style="display: flex; gap: 0.5rem;">
          <bim-button @click=${expandTable} label=${
        propertiesTable.expanded ? "折叠" : "展开"
      }></bim-button> 
        </div> 
        ${propertiesTable}
      </bim-panel-section>
    </bim-panel>
  `;
    });

    const app = document.createElement("bim-grid");
    app.layouts = {
      main: {
        template: `
    "propertiesPanel viewport"
    /25rem 1fr
    `,
        elements: { propertiesPanel, container },
      },
    };

    app.layout = "main";
    container.append(app);
  }
  fragments.onFragmentsLoaded.add(async (model) => {});
  await loadIfc();

  const stats = new Stats();
  stats.showPanel(0);
  document.body.append(stats.dom);
  stats.dom.style.left = "10px";
  stats.dom.style.top = "10px";
  stats.dom.style.borderRadius = "5px";
  stats.dom.style.overflow = "hidden";
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
    position: relative;
    > :deep(bim-grid) {
      position: absolute;
      background: transparent;
      width: unset;
      bottom: 10px;
      left: 10px;
      height: calc(100% - 80px);
      // 这一块儿生效
      > bim-panel {
        background: #bebebe;
        border-radius: 5px;
        border: 1px solid #8c7b38;
      }
    }
  }
}
</style>
