// src/router/index.js
import HomePage from '../views/HomePage.vue';
import GestionarHabitaciones from '../views/GestionarHabitaciones.vue';

import DetailReservas from '../components/DetailReservas.vue';
const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/gestionar-habitaciones',
    name: 'GestionarHabitaciones',
    component: GestionarHabitaciones,
  },
  {
    path: '/habitacion/:id',
    name: 'DetailReservas',
    component: DetailReservas,
    props: true,
  },
];

export default routes;
