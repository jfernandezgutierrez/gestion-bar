<template>
  <v-container>
    <!-- Botón para añadir una nueva habitación -->
    <v-btn @click="addHabitacion" color="primary" dark>Agregar Habitación</v-btn>

    <!-- Mostrar las habitaciones -->
    <v-row>
      <v-col v-for="habitacion in habitaciones" :key="habitacion.id" cols="12" md="4">
        <!-- Se aplica el color usando estilo en línea -->
        <v-card :style="{ backgroundColor: getCardColor(habitacion) }" dark @click="openDetails(habitacion)">
          <v-card-title>{{ habitacion.nombre }}</v-card-title>
          <v-card-subtitle>Planta: {{ habitacion.planta }}</v-card-subtitle>
          <v-card-text>
            <div>Estado: {{ habitacion.estado ? 'Ocupada' : 'Libre' }}</div>
            <div>Limpieza: {{ habitacion.limpieza ? 'Limpia' : 'Sucia' }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para editar detalles de la habitación -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Editar Habitación</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="selectedHabitacion.nombre" label="Nombre de la habitación" />
          <v-text-field v-model="selectedHabitacion.planta" label="Planta" type="number" />
          <v-switch v-model="selectedHabitacion.estado" label="Ocupada" />
          <v-switch v-model="selectedHabitacion.limpieza" label="Limpia" />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="editDialog = false" text>Cerrar</v-btn>
          <v-btn @click="updateHabitacion" color="primary">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

export default {
  name: 'GestionarHabitaciones',
  data() {
    return {
      habitaciones: [],  // Lista de habitaciones desde Firestore
      editDialog: false, // Modal para editar habitación
      selectedHabitacion: {},  // Habitación seleccionada para editar
    };
  },
  methods: {
    // Fetch habitaciones desde Firestore
    async fetchHabitaciones() {
      const querySnapshot = await getDocs(collection(db, "habitaciones"));
      this.habitaciones = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },

    // Asigna color a las tarjetas dependiendo del estado de la habitación
    getCardColor(habitacion) {
      if (!habitacion.limpieza && habitacion.estado) return '#FF5722'; // Ocupada y sucia (Rojo)
      if (!habitacion.limpieza && !habitacion.estado) return '#FFEB3B'; // Libre y sucia (Amarillo)
      if (habitacion.estado) return '#FF5722'; // Ocupada y limpia (Verde)
      return '#8BC34A'; // Libre y limpia (Verde claro)
    },

    // Añadir nueva habitación a Firestore
    async addHabitacion() {
      try {
        await addDoc(collection(db, "habitaciones"), {
          nombre: "Nueva Habitación",
          planta: 1,
          estado: false,  // Libre
          limpieza: true, // Limpia
        });
        this.fetchHabitaciones(); // Actualiza la lista de habitaciones
      } catch (error) {
        console.error("Error añadiendo habitación:", error);
      }
    },

    // Abre el modal para editar habitación
    openDetails(habitacion) {
      this.selectedHabitacion = { ...habitacion }; // Crea una copia para editar
      this.editDialog = true;
    },

    // Actualiza los detalles de la habitación en Firestore
    async updateHabitacion() {
      try {
        const habitacionRef = doc(db, "habitaciones", this.selectedHabitacion.id);
        await updateDoc(habitacionRef, {
          nombre: this.selectedHabitacion.nombre,
          planta: this.selectedHabitacion.planta,
          estado: this.selectedHabitacion.estado,
          limpieza: this.selectedHabitacion.limpieza,
        });
        this.editDialog = false;
        this.fetchHabitaciones(); // Actualiza la lista de habitaciones
      } catch (error) {
        console.error("Error actualizando habitación:", error);
      }
    },
  },
  mounted() {
    this.fetchHabitaciones(); // Carga las habitaciones al montar el componente
  },
};
</script>
