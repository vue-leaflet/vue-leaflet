const { createApp, onMounted } = window.Vue;
const App = {
  setup() {
    onMounted(() => {
      console.log('main app mounted');
    });
  }
};
const app = createApp(App);

app.component('foo', {
  setup() {
    onMounted(() => {
      console.log('foo mounted');
    });
  },
  template: '<div>I am foo</div>'
});
app.mount('#app');
