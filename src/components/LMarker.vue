<script>
import { onMounted, ref, h, inject } from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  provideLeafletWrapper,
  updateLeafletWrapper,
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

    const addLayer = inject("addLayer");

    const latLng = provideLeafletWrapper("latLng");
    const { options, methods } = markerSetup(props, leafletRef, context);

    onMounted(async () => {
      const {
        marker,
        DomEvent,
        latLng: leafletLatLng,
        setOptions,
      } = await import("leaflet/dist/leaflet-src.esm");
      updateLeafletWrapper(latLng, leafletLatLng);

      leafletRef.value = marker(props.latLng, options);

      schematics.canSetParentHtml = () => !!leafletRef.value.getElement();
      schematics.setParentHtml = (html) =>
        (leafletRef.value.getElement().innerHTML = html);

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
