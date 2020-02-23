(function () {
  'use strict';

  var _window$Vue = window.Vue,
      createApp = _window$Vue.createApp,
      onMounted = _window$Vue.onMounted;
  var App = {
    setup: function setup() {
      onMounted(function () {
        console.log('main app mounted');
      });
    }
  };
  var app = createApp(App);
  app.component('foo', {
    setup: function setup() {
      onMounted(function () {
        console.log('foo mounted');
      });
    },
    template: '<div>I am foo</div>'
  });
  app.mount('#app');

}());
//# sourceMappingURL=app.js.map
