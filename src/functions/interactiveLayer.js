export const props = {
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
  const options = {
    interactive: props.interactive,
    bubblingMouseEvents: props.bubblingMouseEvents,
  };

  const methods = {};

  return { options, methods };
};
