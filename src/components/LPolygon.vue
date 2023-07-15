<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import { render } from "@src/functions/layer";
import { polygonProps, setupPolygon } from "@src/functions/polygon";
import { AddLayerInjection } from "@src/types/injectionKeys";
import {
  assertInject,
  getLeaflet,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * Polygon component, lets you add and customize polygon regions on the map
 */
export default defineComponent({
  name: "LPolygon",
  props: polygonProps,
  setup(props, context) {
    const leafletObject = ref<L.Polygon>();
    const ready = ref(false);

    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupPolygon(props, leafletObject, context);

    onMounted(async () => {
      const { polygon }: typeof L = await getLeaflet();

      leafletObject.value = markRaw<L.Polygon>(polygon(props.latLngs, options));

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
