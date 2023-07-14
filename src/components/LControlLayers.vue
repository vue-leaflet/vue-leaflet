<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import {
  controlLayersProps,
  setupControlLayers,
} from "@src/functions/controlLayers";
import { RegisterLayerControlInjection } from "@src/types/injectionKeys";
import { assertInject, getLeaflet, propsBinder } from "@src/utils.js";

export default defineComponent({
  name: "LControlLayers",
  props: controlLayersProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Layers>();

    const registerLayerControl = assertInject(RegisterLayerControlInjection);

    const { options, methods } = setupControlLayers(props, leafletObject);

    onMounted(async () => {
      const { control }: typeof L = await getLeaflet();
      leafletObject.value = markRaw<L.Control.Layers>(
        control.layers(undefined, undefined, options)
      );

      propsBinder(methods, leafletObject.value, props);

      registerLayerControl({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { leafletObject };
  },
  render() {
    return null;
  },
});
</script>
