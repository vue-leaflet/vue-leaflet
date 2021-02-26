<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import {
  props as imageOverlayProps,
  setup as imageOverlaySetup,
} from "../functions/imageOverlay";
import { render } from "../functions/layer";

/**
 * ImageOverlay component, render a plain image instead of a geospatial map.
 */
export default {
  name: "LImageOverlay",
  props: imageOverlayProps,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const addLayer = inject("addLayer");

    const { options, methods } = imageOverlaySetup(props, leafletRef, context);

    onMounted(async () => {
      const { imageOverlay, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      leafletRef.value = imageOverlay(props.url, props.bounds, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render(this.ready, this.$slots);
  },
};
</script>
