import { onBeforeUnmount } from "vue";
import { props as popperProps, setup as popperSetup } from "./popper";

export const props = {
  ...popperProps,
};

export const setup = (props, leafletRef, context, lMethods) => {
  const { options, methods } = popperSetup(props, leafletRef);

  onBeforeUnmount(() => {
    lMethods.unbindTooltip();
  });

  return { options, methods };
};
