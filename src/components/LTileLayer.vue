<script>
import { onMounted, ref, computed, inject } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import {
  props as tileLayerProps,
  setup as tileLayerSetup,
} from "../functions/tileLayer";

export default {
  props: {
    ...tileLayerProps,
    url: {
      type: String,
      default: null,
    },
  },
  setup(props, context) {
    const mapRef = ref({});
    const addLayer = inject("addLayer");

    const { options, methods } = tileLayerSetup(props, mapRef);

    onMounted(async () => {
      const { tileLayer, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      mapRef.value = tileLayer(props.url, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(mapRef.value, listeners);

      propsBinder(methods, mapRef.value, props);

      addLayer(mapRef.value);
    });

    const mapObject = computed(() => mapRef.value);
    return { mapObject };
  },
  render() {
    return null;
  },
};
</script>
