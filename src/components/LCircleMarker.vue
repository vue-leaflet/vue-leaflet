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

import {
  circleMarkerProps,
  setupCircleMarker,
} from "@src/functions/circleMarker";
import { render } from "@src/functions/layer";
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
 * Circle Marker component, lets you add and personalize circle markers on the map
 */
export default defineComponent({
  name: "LCircleMarker",
  props: circleMarkerProps,
  setup(props, context) {
    const leafletObject = ref<L.CircleMarker>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupCircleMarker(
      props,
      leafletObject,
      context
    );

    onMounted(async () => {
      const { circleMarker }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.CircleMarker>(
        circleMarker(props.latLng, options)
      );

      const listeners = remapEvents(context.attrs);
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
