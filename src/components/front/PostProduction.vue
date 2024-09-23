<template>
  <div class="case camera">
    <div class="container" id="container"></div>
  </div>
</template>

<script setup lang="ts" name="PostProduction">
import * as THREE from "three";
import Stats from "stats.js";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

import { onMounted } from "vue";
onMounted(async () => {
  const container = document.getElementById("container")!;
  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBCF.PostproductionRenderer
  >();

  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBCF.PostproductionRenderer(components, container);
  world.camera = new OBC.SimpleCamera(components);
  world.scene.three.background = null;

  components.init();

  world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
  world.scene.setup();
  const grids = components.get(OBC.Grids);
  grids.config.color.set(0x666666);
  const grid = grids.create(world);

  world.scene.three.background = null;

  const fragments = new OBC.FragmentsManager(components);
  const file = await fetch("http://192.168.159.131:5173/src/assets/small.frag");
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = fragments.load(buffer);
  world.scene.three.add(model);

  const { postproduction } = world.renderer;
  postproduction.enabled = true;
  postproduction.customEffects.excludedMeshes.push(grid.three);
  const ao = postproduction.n8ao.configuration;

  const stats = new Stats();
  stats.showPanel(2);
  document.body.append(stats.dom);
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());

  BUI.Manager.init();

  const panel = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
  <bim-panel active label="Postproduction Tutorial" class="options-menu">
      <bim-panel-section collapsed label="Gamma">
        <bim-checkbox checked label="Gamma Correction"
          @change="${({ target }: { target: BUI.Checkbox }) => {
            postproduction.setPasses({ gamma: target.value });
          }}">
        </bim-checkbox>
      </bim-panel-section>
      
      <bim-panel-section collapsed label="Custom effects" >
        <bim-checkbox checked label="Custom effects"
          @change="${({ target }: { target: BUI.Checkbox }) => {
            postproduction.setPasses({ custom: target.value });
          }}">
        </bim-checkbox>    
        
        <bim-checkbox checked label="Gamma Correction"
          @change="${({ target }: { target: BUI.Checkbox }) => {
            postproduction.customEffects.glossEnabled = target.value;
          }}">
        </bim-checkbox>   
      
        <bim-number-input 
          slider step="0.01" label="Opacity" 
          value="${postproduction.customEffects.opacity}" min="0" max="1"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            postproduction.customEffects.opacity = target.value;
          }}">
        </bim-number-input>  
            
        <bim-number-input 
          slider step="0.1" label="Tolerance" 
          value="${postproduction.customEffects.tolerance}" min="0" max="6"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            postproduction.customEffects.tolerance = target.value;
          }}">
        </bim-number-input> 
                      
        <bim-color-input label="Line color" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            const color = new THREE.Color(target.value.color);
            postproduction.customEffects.lineColor = color.getHex();
          }}">
        </bim-color-input>  
      
        <bim-number-input 
          slider label="Gloss exponent" step="0.1" 
          value="${postproduction.customEffects.glossExponent}" min="0" max="5"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            postproduction.customEffects.glossExponent = target.value;
          }}">
        </bim-number-input>    
           
        <bim-number-input 
          slider label="Max gloss" step="0.05" 
          value="${postproduction.customEffects.maxGloss}" min="-2" max="2"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            postproduction.customEffects.maxGloss = target.value;
          }}">
        </bim-number-input>  
                  
        <bim-number-input 
          slider label="Min gloss" step="0.05" 
          value="${postproduction.customEffects.minGloss}" min="-2" max="2"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            postproduction.customEffects.minGloss = target.value;
          }}">
        </bim-number-input> 
        
      </bim-panel-section>
      
      <bim-panel-section collapsed label="Ambient Oclussion">
      
        <bim-checkbox label="AO enabled"
          @change="${({ target }: { target: BUI.Checkbox }) => {
            postproduction.setPasses({ ao: target.value });
          }}">
        </bim-checkbox>  
                
        <bim-checkbox checked label="Half resolution"
          @change="${({ target }: { target: BUI.Checkbox }) => {
            ao.halfRes = target.value;
          }}">
        </bim-checkbox>  
                      
        <bim-checkbox label="Screen space radius"
          @change="${({ target }: { target: BUI.Checkbox }) => {
            ao.screenSpaceRadius = target.value;
          }}">
        </bim-checkbox>
        
                              
        <bim-color-input label="AO color" 
          @input="${({ target }: { target: BUI.ColorInput }) => {
            const color = new THREE.Color(target.value.color);
            ao.color.r = color.r;
            ao.color.g = color.g;
            ao.color.b = color.b;
          }}">
        </bim-color-input>     
        
        <bim-number-input 
          slider label="AO Samples" step="1" 
          value="${ao.aoSamples}" min="1" max="16"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            ao.aoSamples = target.value;
          }}">
        </bim-number-input>    
            
        <bim-number-input 
          slider label="Denoise Samples" step="1" 
          value="${ao.denoiseSamples}" min="1" max="16"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            ao.denoiseSamples = target.value;
          }}">
        </bim-number-input>   
                  
        <bim-number-input 
          slider label="Denoise Radius" step="1" 
          value="${ao.denoiseRadius}" min="0" max="100"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            ao.denoiseRadius = target.value;
          }}">
        </bim-number-input>   
                       
        <bim-number-input 
          slider label="AO Radius" step="1" 
          value="${ao.aoRadius}" min="0" max="16"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            ao.aoRadius = target.value;
          }}">
        </bim-number-input>  
                              
        <bim-number-input 
          slider label="Distance falloff" step="1" 
          value="${ao.distanceFalloff}" min="0" max="16"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            ao.distanceFalloff = target.value;
          }}">
        </bim-number-input> 
                                      
        <bim-number-input 
          slider label="Intensity" step="1" 
          value="${ao.intensity}" min="0" max="16"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            ao.intensity = target.value;
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
