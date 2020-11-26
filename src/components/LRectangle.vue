<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as rectangleSetup } from "../functions/rectangle";
import { render } from "../functions/layer";

/**
 * Rectangle component, lets you add and customize rectangular regions on the map
 */
export default {
  name: "LRectangle",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);
    const addLayer = inject("addLayer");

    const { options, methods } = rectangleSetup(props, leafletRef, context);

    onMounted(async () => {
      const { rectangle, latLngBounds, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      const bounds =
        props.bounds && props.bounds.length
          ? latLngBounds(props.bounds)
          : latLngBounds(props.latLngs);
      leafletRef.value = rectangle(bounds, options);

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
