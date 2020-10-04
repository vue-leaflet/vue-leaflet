<script>
import { onMounted, ref, inject } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as tileLayerSetup } from "../functions/tileLayer";

export default {
  props,
  setup(props, context) {
    const mapRef = ref({});
    const addMapLayer = inject("addMapLayer");

    const { options, methods } = tileLayerSetup(props, mapRef);

    onMounted(async () => {
      const { tileLayer, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      mapRef.value = tileLayer(props.url, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(mapRef.value, listeners);

      propsBinder(methods, mapRef.value, props, setOptions);
      addMapLayer({ ...props, ...methods, mapObject: mapRef.value });
    });
  },
  render() {
    return null;
  },
};
</script>
