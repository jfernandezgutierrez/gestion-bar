<template>
  <v-container>
    <!-- Mostrar las habitaciones -->
    <v-row>
      <v-col v-for="habitacion in habitaciones" :key="habitacion.id" cols="12" md="4">
        <v-card :style="{ backgroundColor: getCardColor(habitacion) }" dark @click="openDetailReservas(habitacion)">
          <v-card-title>{{ habitacion.nombre }}</v-card-title>
          <v-card-subtitle>Planta: {{ habitacion.planta }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default {
  data() {
    return {
      habitaciones: [],  // Lista de habitaciones
    };
  },
  methods: {
    // Asigna color a las tarjetas dependiendo del estado de la habitación
    getCardColor(habitacion) {
      if (!habitacion.limpieza && habitacion.estado) return 'red'; // Ocupada y sucia
      if (!habitacion.limpieza && !habitacion.estado) return 'yellow'; // Libre y sucia
      if (habitacion.estado) return 'red'; // Ocupada y limpia
      return 'lightgreen'; // Libre y limpia
    },

    // Obtener las habitaciones desde Firebase
    async fetchHabitaciones() {
      const querySnapshot = await getDocs(collection(db, 'habitaciones'));
      this.habitaciones = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },

    // Navegar al detalle de la reserva de la habitación
    openDetailReservas(habitacion) {
      this.$router.push({ name: 'DetailReservas', params: { id: habitacion.id } });
    },
  },
  mounted() {
    this.fetchHabitaciones();  // Cargar habitaciones al montar el componente
  },
};
</script>
