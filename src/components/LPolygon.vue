<script lang="ts">
import type L from "leaflet";
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  assertInject,
} from "@src/utils.js";
import { polygonProps, setupPolygon } from "@src/functions/polygon";
import { render } from "@src/functions/layer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

/**
 * Polygon component, lets you add and customize polygon regions on the map
 */
export default {
  name: "LPolygon",
  props: polygonProps,
  setup(props, context) {
    const leafletObject = ref<L.Polygon>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupPolygon(props, leafletObject, context);

    onMounted(async () => {
      const { polygon, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Polygon>(polygon(props.latLngs, options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

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
};
</script>
