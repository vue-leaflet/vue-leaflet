<script lang="ts">
import type L from "leaflet";
import {
  defineComponent,
  inject,
  markRaw,
  nextTick,
  onMounted,
  ref,
} from "vue";

import { render } from "@src/functions/layer";
import {
  setupVideoOverlay,
  videoOverlayProps,
} from "@src/functions/videoOverlay";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * VideoOverlay component, used to load and display a video player over specific
 * bounds of the map
 */
export default defineComponent({
  name: "LVideoOverlay",
  props: videoOverlayProps,
  setup(props, context) {
    const leafletObject = ref<L.VideoOverlay>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupVideoOverlay(
      props,
      leafletObject,
      context
    );

    onMounted(async () => {
      const { videoOverlay }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");
      leafletObject.value = markRaw<L.VideoOverlay>(
        videoOverlay(props.url, props.bounds, options)
      );

      const { listeners } = remapEvents(context.attrs);
      leafletObject.value.on(listeners);
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
});
</script>
