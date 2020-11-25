<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as circleSetup } from "../functions/circle";
import { render } from "../functions/layer";

/**
 * Circle component, lets you add and personalize circles on the map
 */
export default {
  name: "LCircle",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const addLayer = inject("addLayer");

    const { options, methods } = circleSetup(props, leafletRef, context);

    onMounted(async () => {
      const { circle, DomEvent } = await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = circle(props.latLng, options);

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
