<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { propsBinder, remapEvents } from "../utils.js";
import { props, setup as popupSetup } from "../functions/popup";
import { render } from "../functions/popper";

/**
 * Display a popup on the map
 */
export default {
  name: "LPopup",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const root = ref(null);

    const bindPopup = inject("bindPopup");
    const { options, methods } = popupSetup(props, leafletRef, context);

    onMounted(async () => {
      const { popup, DomEvent } = await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = popup(options);

      if (props.latLng !== undefined) {
        leafletRef.value.setLatLng(props.latLng);
      }

      propsBinder(methods, leafletRef.value, props);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      leafletRef.value.setContent(props.content || root.value);
      bindPopup({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { root, leafletObject: leafletRef };
  },
  render() {
    return render(this.$slots);
  },
};
</script>
