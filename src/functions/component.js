export const props = {
  options: {
    type: Object,
    default: () => ({}),
    custom: true,
  },
};

export const setup = (props) => {
  return { options: props.options, methods: {} };
};
