import { onBeforeUnmount } from "vue";
import { props as popperProps, setup as popperSetup } from "./popper";

export const props = {
  ...popperProps,
};

export const setup = (props, mapRef, context, lMethods) => {
  const { options, methods } = popperSetup(props, mapRef);

  onBeforeUnmount(() => {
    lMethods.unbindTooltip();
  });

  return { options, methods };
};
