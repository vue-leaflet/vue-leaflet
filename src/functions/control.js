import { onUnmounted } from "vue";

export const props = {
  position: {
    type: String,
    default: "topright",
  },
};
export const setup = (leafletRef) => {
  onUnmounted(() => {
    if (leafletRef.value) {
      leafletRef.value.remove();
    }
  });
};
