<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import {
  props as layerGroupOptions,
  setup as layerGroupSetup,
} from "../functions/layerGroup";
import { render } from "../functions/layer";

export default {
  props: {
    ...layerGroupOptions,
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const addLayer = inject("addLayer");

    const { methods } = layerGroupSetup(props, leafletRef);

    onMounted(async () => {
      const { layerGroup, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      leafletRef.value = layerGroup();

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props, setOptions);
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
