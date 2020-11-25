import { props as componentProps, setup as componentSetup } from "./component";

export const props = {
  ...componentProps,
  interactive: {
    type: Boolean,
    default: true,
  },
  bubblingMouseEvents: {
    type: Boolean,
    default: true,
  },
};

export const setup = (props) => {
  const { options: componentOptions, methods } = componentSetup(props);
  const options = {
    ...componentOptions,
    interactive: props.interactive,
    bubblingMouseEvents: props.bubblingMouseEvents,
  };

  return { options, methods };
};
