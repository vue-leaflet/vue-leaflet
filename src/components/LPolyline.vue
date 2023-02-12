<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { polylineProps, setupPolyline } from "../functions/polyline";
import { render } from "../functions/layer";

/**
 * Polyline component, lets you add and personalize polylines on the map
 */
export default {
  name: "LPolyline",
  props: polylineProps,
  setup(props, context) {
    const leafletObject = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setupPolyline(props, leafletObject, context);

    onMounted(async () => {
      const { polyline, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw(polyline(props.latLngs, options));

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
