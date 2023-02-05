<script>
import {
  onMounted,
  ref,
  provide,
  inject,
  nextTick,
  onBeforeUnmount,
} from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
  cancelDebounces,
} from "../utils.js";
import { markerProps, setupMarker } from "../functions/marker";
import { render } from "../functions/layer";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default {
  name: "LMarker",
  props: markerProps,
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
    const { options, methods } = setupMarker(props, leafletRef, context);

    const eventHandlers = {
      moveHandler: debounce(methods.latLngSync),
    };

    onMounted(async () => {
      const { marker, DomEvent, divIcon } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      // If an icon is not specified in the options but there is content in the LMarker's slot, then
      // set the initial icon to an empty div that will be invisible until it's replaced by any calls
      // to `setIcon` or `setParentHtml` from within the default slot. This avoids the icon flickering
      // discussed in https://github.com/vue-leaflet/vue-leaflet/issues/170.
      if (!options.icon && context.slots.default) {
        options.icon = divIcon({ className: "" });
      }
      leafletRef.value = marker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      leafletRef.value.on("move", eventHandlers.moveHandler);
      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    onBeforeUnmount(() => cancelDebounces(eventHandlers));

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render(this.ready, this.$slots);
  },
};
</script>
