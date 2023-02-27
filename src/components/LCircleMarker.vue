<script lang="ts">
import type L from "leaflet";
import {
  onMounted,
  ref,
  inject,
  nextTick,
  markRaw,
  defineComponent,
} from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  assertInject,
} from "@src/utils.js";
import {
  circleMarkerProps,
  setupCircleMarker,
} from "@src/functions/circleMarker";
import { render } from "@src/functions/layer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

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
      const { circleMarker, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.CircleMarker>(
        circleMarker(props.latLng, options)
      );

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
});
</script>
