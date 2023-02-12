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

      if (shouldBlankIcon(options, context)) {
        options.icon = divIcon({ className: "" });
      }
      leafletRef.value = markRaw(marker(props.latLng, options));

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
