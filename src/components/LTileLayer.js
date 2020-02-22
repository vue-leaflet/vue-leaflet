import { tileLayer } from 'leaflet/dist/leaflet-src.esm';
import { props as layerProps, setup as layerSetup } from '../functions/layer';
import {
  props as gridLayerProps,
  setup as gridLayerSetup
} from '../functions/gridLayer';
import {
  props as tileLayerProps,
  setup as tileLayerSetup
} from '../functions/tileLayer';

const { onMounted, ref, computed, inject } = window.Vue;

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
      ...layerSetup(props).options,
      ...gridLayerSetup(props).options,
      ...tileLayerSetup(props).options
    };
    onMounted(() => {
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
