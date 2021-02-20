export const props = {
  options: {
    type: Object,
    default: () => ({}),
  },
};

export const setup = (setupProps: { [key: string]: any }) => {
  return { options: setupProps.options, methods: {} };
};
