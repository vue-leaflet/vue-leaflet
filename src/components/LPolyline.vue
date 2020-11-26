<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as polylineSetup } from "../functions/polyline";
import { render } from "../functions/layer";

/**
 * Polyline component, lets you add and personalize polylines on the map
 */
export default {
  name: "LPolyline",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const addLayer = inject("addLayer");

    const { options, methods } = polylineSetup(props, leafletRef, context);

    onMounted(async () => {
      const { polyline, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = polyline(props.latLngs, options);

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
