<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import {
  imageOverlayProps,
  setupImageOverlay,
} from "@src/functions/imageOverlay";
import { render } from "@src/functions/layer";
import { AddLayerInjection } from "@src/types/injectionKeys";
import {
  assertInject,
  getLeaflet,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * ImageOverlay component, render a plain image instead of a geospatial map.
 */
export default defineComponent({
  name: "LImageOverlay",
  props: imageOverlayProps,
  setup(props, context) {
    const leafletObject = ref<L.ImageOverlay>();
    const ready = ref(false);

    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupImageOverlay(
      props,
      leafletObject,
      context
    );

    onMounted(async () => {
      const { imageOverlay }: typeof L = await getLeaflet();
      leafletObject.value = markRaw<L.ImageOverlay>(
        imageOverlay(props.url, props.bounds, options)
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
