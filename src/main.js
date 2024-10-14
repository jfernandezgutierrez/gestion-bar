// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { createRouter, createWebHistory } from 'vue-router';
import routes from './router'; // Define las rutas
import { auth } from './firebase'; // Importa Firebase

const app = createApp(App);

app.use(vuetify);
app.use(createRouter({
  history: createWebHistory(),
  routes,
}));

app.mount('#app');

// Controlar el estado de autenticación en Firebase
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('Usuario autenticado:', user.email);
  } else {
    console.log('Ningún usuario autenticado');
  }
});
