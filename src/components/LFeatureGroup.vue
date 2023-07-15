<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import {
  featureGroupProps,
  setupFeatureGroup,
} from "@src/functions/featureGroup";
import { render } from "@src/functions/layer";
import { AddLayerInjection } from "@src/types/injectionKeys";
import {
  assertInject,
  getLeaflet,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

export default defineComponent({
  props: featureGroupProps,
  setup(props, context) {
    const leafletObject = ref<L.FeatureGroup>();
    const ready = ref(false);

    const addLayer = assertInject(AddLayerInjection);

    const { methods, options } = setupFeatureGroup(
      props,
      leafletObject,
      context
    );

    onMounted(async () => {
      const { featureGroup }: typeof L = await getLeaflet();

      leafletObject.value = markRaw<L.FeatureGroup>(
        featureGroup(undefined, options)
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
