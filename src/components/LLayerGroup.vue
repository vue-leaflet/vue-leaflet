<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as layerGroupSetup } from "../functions/layerGroup";
import { render } from "../functions/layer";

export default {
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const addLayer = inject("addLayer");

    const { methods } = layerGroupSetup(props, leafletRef, context);

    onMounted(async () => {
      const { layerGroup, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      leafletRef.value = layerGroup(props.options);

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
