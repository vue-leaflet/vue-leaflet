<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import {
  circleMarkerProps,
  setupCircleMarker,
} from "../functions/circleMarker";
import { render } from "../functions/layer";

/**
 * Circle Marker component, lets you add and personalize circle markers on the map
 */
export default {
  name: "LCircleMarker",
  props: circleMarkerProps,
  setup(props, context) {
    const leafletObject = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setupCircleMarker(
      props,
      leafletObject,
      context
    );

    onMounted(async () => {
      const { circleMarker, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw(circleMarker(props.latLng, options));

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
