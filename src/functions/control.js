import { onUnmounted } from "vue";

export const props = {
  position: {
    type: String,
    default: "topright",
  },
};
export const setup = (mapRef) => {
  onUnmounted(() => {
    if (mapRef.value) {
      mapRef.value.remove();
    }
  });
};
