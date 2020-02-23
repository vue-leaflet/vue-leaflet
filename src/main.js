import { createApp, onMounted } from 'vue';

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
  // using the render function produces the same results
  // render() {
  //   return 'I am foo';
  // }
});
app.mount('#app');
