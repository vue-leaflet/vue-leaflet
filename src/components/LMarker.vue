<script>
import { onMounted, ref, provide, inject, nextTick } from "vue";
import { remapEvents, propsBinder, debounce } from "../utils.js";
import { props, setup as markerSetup } from "../functions/marker";
import { render } from "../functions/layer";

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

    provide("canSetParentHtml", () => !!leafletRef.value.getElement());
    provide(
      "setParentHtml",
      (html) => (leafletRef.value.getElement().innerHTML = html)
    );
    provide(
      "setIcon",
      (newIcon) => leafletRef.value.setIcon && leafletRef.value.setIcon(newIcon)
    );
    const { options, methods } = markerSetup(props, leafletRef, context);

    onMounted(async () => {
      const { marker, DomEvent } = await import("leaflet/dist/leaflet-src.esm");
      leafletRef.value = marker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      leafletRef.value.on("move", debounce(methods.latLngSync, 100));
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
