<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { rectangleProps, setupRectangle } from "../functions/rectangle";
import { render } from "../functions/layer";

/**
 * Rectangle component, lets you add and customize rectangular regions on the map
 */
export default {
  name: "LRectangle",
  props: rectangleProps,
  setup(props, context) {
    const leafletObject = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setupRectangle(props, leafletObject, context);

    onMounted(async () => {
      const { rectangle, latLngBounds, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      const bounds =
        props.bounds && props.bounds.length
          ? latLngBounds(props.bounds)
          : latLngBounds(props.latLngs);
      leafletObject.value = markRaw(rectangle(bounds, options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

      propsBinder(methods, leafletObject.value, props);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
};
</script>
