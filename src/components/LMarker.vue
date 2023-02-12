<script>
import {
  onMounted,
  ref,
  provide,
  inject,
  nextTick,
  onBeforeUnmount,
  markRaw,
} from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
  cancelDebounces,
} from "../utils.js";
import { markerProps, setupMarker, shouldBlankIcon } from "../functions/marker";
import { render } from "../functions/layer";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default {
  name: "LMarker",
  props: markerProps,
  setup(props, context) {
    const leafletObject = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    provide("canSetParentHtml", () => !!leafletObject.value.getElement());
    provide(
      "setParentHtml",
      (html) => (leafletObject.value.getElement().innerHTML = html)
    );
    provide(
      "setIcon",
      (newIcon) =>
        leafletObject.value.setIcon && leafletObject.value.setIcon(newIcon)
    );
    const { options, methods } = setupMarker(props, leafletObject, context);

    const eventHandlers = {
      moveHandler: debounce(methods.latLngSync),
    };

    onMounted(async () => {
      const { marker, DomEvent, divIcon } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      if (shouldBlankIcon(options, context)) {
        options.icon = divIcon({ className: "" });
      }
      leafletObject.value = markRaw(marker(props.latLng, options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

      leafletObject.value.on("move", eventHandlers.moveHandler);
      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    onBeforeUnmount(() => cancelDebounces(eventHandlers));

    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
};
</script>
