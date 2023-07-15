<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import { render } from "@src/functions/layer";
import { layerGroupProps, setupLayerGroup } from "@src/functions/layerGroup";
import { AddLayerInjection } from "@src/types/injectionKeys";
import {
  assertInject,
  getLeaflet,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

export default defineComponent({
  props: layerGroupProps,
  setup(props, context) {
    const leafletObject = ref<L.LayerGroup>();
    const ready = ref(false);

    const addLayer = assertInject(AddLayerInjection);

    const { methods } = setupLayerGroup(props, leafletObject, context);

    onMounted(async () => {
      const { layerGroup }: typeof L = await getLeaflet();
      leafletObject.value = markRaw<L.LayerGroup>(
        layerGroup(undefined, props.options)
      );

      const { listeners } = remapEvents(context.attrs);
      leafletObject.value.on(listeners);

      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });
    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
});
</script>
