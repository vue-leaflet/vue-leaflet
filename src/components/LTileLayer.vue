<script>
import { onMounted, ref, computed, inject } from 'vue';
import { props as layerProps, setup as layerSetup } from '../functions/layer';
import {
  props as gridLayerProps,
  setup as gridLayerSetup
} from '../functions/gridLayer';
import {
  props as tileLayerProps,
  setup as tileLayerSetup
} from '../functions/tileLayer';

export default {
  props: {
    ...layerProps,
    ...gridLayerProps,
    ...tileLayerProps,
    url: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const mapRef = ref({});
    const addLayer = inject('addLayer');
    const options = {
      ...layerSetup(props),
      ...gridLayerSetup(props),
      ...tileLayerSetup(props)
    };
    onMounted(async () => {
      const { tileLayer } = await import('leaflet/dist/leaflet-src.esm');
      mapRef.value = tileLayer(props.url, options);
      addLayer(mapRef.value);
    });
    const mapObject = computed(() => mapRef.value);
    return { mapObject };
  },
  render() {
    return null;
  }
};
</script>
