<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import {
  imageOverlayProps,
  setupImageOverlay,
} from "../functions/imageOverlay";
import { render } from "../functions/layer";

/**
 * ImageOverlay component, render a plain image instead of a geospatial map.
 */
export default {
  name: "LImageOverlay",
  props: imageOverlayProps,
  setup(props, context) {
    const leafletObject = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setupImageOverlay(
      props,
      leafletObject,
      context
    );

    onMounted(async () => {
      const { imageOverlay, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");
      leafletObject.value = markRaw(
        imageOverlay(props.url, props.bounds, options)
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
};
</script>
