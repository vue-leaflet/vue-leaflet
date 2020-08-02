<script>
/* eslint-disable */
import { onMounted, ref, computed, inject } from "vue";
import { props as layerProps, setup as layerSetup } from "../functions/layer";
import { remapEvents, propsBinder } from "../utils.js";
import {
  props as gridLayerProps,
  setup as gridLayerSetup,
} from "../functions/gridLayer";
import {
  props as tileLayerProps,
  setup as tileLayerSetup,
} from "../functions/tileLayer";

export default {
  props: {
    ...layerProps,
    ...gridLayerProps,
    ...tileLayerProps,
    url: {
      type: String,
      default: null,
    },
  },
  setup(props, context) {
    const mapRef = ref({});
    const addLayer = inject("addLayer");

    const { options: layerOptions, methods: layerMethods } = layerSetup(
      props,
      mapRef
    );

    const {
      options: gridLayerOptions,
      methods: gridLayerMethods,
    } = gridLayerSetup(props);

    const {
      options: tileLayerOptions,
      methods: tileLayerMethods,
    } = tileLayerSetup(props);

    const options = {
      ...layerOptions,
      ...gridLayerOptions,
      ...tileLayerOptions,
    };

    const methods = {
      ...layerMethods,
      ...gridLayerMethods,
      ...tileLayerMethods,
    };

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
