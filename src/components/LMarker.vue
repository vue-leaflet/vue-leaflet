<script>
import { onMounted, ref, provide, inject, nextTick } from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
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

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
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
      const { marker, DomEvent, divIcon } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      // If an icon is not specified in the options, then either the content of the LMarker's
      // slot should be displayed if present, or the default Leaflet icon should be used if not.
      // Either way, the `undefined` property needs to be modified.
      if (options.icon === undefined) {
        if (context.slots.default) {
          // If there is slot content to be displayed, then the initial state of the icon should be
          // invisible until it is replaced by any calls to `setIcon` or `setParentHtml` from within
          // the default slot.
          // Creating an empty div with no classes accomplishes this, avoiding the issue discussed in
          // https://github.com/vue-leaflet/vue-leaflet/issues/170.
          options.icon = divIcon({ className: "" });
        } else {
          // If the options object has a property named 'icon' when passed to `marker`, then Leaflet
          // will overwrite the default icon with that value for the marker, _even if it is undefined_.
          // This leads to the issue discussed in https://github.com/vue-leaflet/vue-leaflet/issues/130,
          // and is avoided by simply removing that property.
          delete options.icon;
        }
      }
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
