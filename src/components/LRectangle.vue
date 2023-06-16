<script lang="ts">
import type L from "leaflet";
import {
  defineComponent,
  inject,
  markRaw,
  nextTick,
  onMounted,
  ref,
} from "vue";

import { render } from "@src/functions/layer";
import { rectangleProps, setupRectangle } from "@src/functions/rectangle";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * Rectangle component, lets you add and customize rectangular regions on the map
 */
export default defineComponent({
  name: "LRectangle",
  props: rectangleProps,
  setup(props, context) {
    const leafletObject = ref<L.Rectangle>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupRectangle(props, leafletObject, context);

    onMounted(async () => {
      const { rectangle, latLngBounds }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      const bounds = props.bounds
        ? latLngBounds(props.bounds)
        : latLngBounds(props.latLngs || []);
      leafletObject.value = markRaw<L.Rectangle>(rectangle(bounds, options));

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
