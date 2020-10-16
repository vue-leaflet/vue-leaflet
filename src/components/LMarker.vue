<script>
import { onMounted, ref, h } from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  generatePlaceholderMethods,
  injectLeafletMethod,
  updateLeafletMethod,
} from "../utils.js";
import { props, setup as markerSetup } from "../functions/marker";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default {
  name: "LMarker",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const schematics = generatePlaceholderMethods(["latLng"]);

    console.log("Injecting addLayer to LMarker");
    const addLayer = injectLeafletMethod("addLayer");
    const { options, methods } = markerSetup(
      props,
      leafletRef,
      context,
      schematics
    );

    onMounted(async () => {
      const { marker, DomEvent, latLng, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      updateLeafletMethod(schematics.latLng, latLng);

      leafletRef.value = marker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      leafletRef.value.on("move", debounce(methods.latLngSync, 100));
      propsBinder(methods, leafletRef.value, props, setOptions);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
    });
    return { ready };
  },
  render() {
    if (this.ready && this.$slots.default) {
      return h("div", { style: { display: "none" } }, this.$slots.default());
    }
    return null;
  },
};
</script>
