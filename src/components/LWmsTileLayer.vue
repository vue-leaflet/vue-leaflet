<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import {
  setupWMSTileLayer,
  wmsTileLayerProps,
} from "@src/functions/wmsTileLayer";
import { AddLayerInjection } from "@src/types/injectionKeys";
import {
  assertInject,
  getLeaflet,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

export default defineComponent({
  props: wmsTileLayerProps,
  setup(props, context) {
    const leafletObject = ref<L.TileLayer.WMS>();

    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupWMSTileLayer(
      props,
      leafletObject,
      context
    );

    onMounted(async () => {
      const { tileLayer }: typeof L = await getLeaflet();

      leafletObject.value = markRaw<L.TileLayer.WMS>(
        tileLayer.wms(props.url, options)
      );

      const { listeners } = remapEvents(context.attrs);
      leafletObject.value.on(listeners);

      propsBinder(methods, leafletObject.value, props);
      addLayer({
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
