<template>
  <v-container>
    <!-- Detalles de la habitación -->
    <v-card>
      <v-card-title><h2>Detalles de Reserva</h2></v-card-title>
      <v-card-subtitle><h1>{{ habitacion.nombre }}</h1></v-card-subtitle>
      <v-card-subtitle><h1>Planta: {{ habitacion.planta }} </h1></v-card-subtitle>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <v-card-text>
            <h1>
            <p>Estado: {{ habitacion.estado ? 'Ocupada' : 'Libre' }}</p><v-switch v-model="habitacion.estado" label="Ocupada"  @change="updateHabitacion" />
            
            <p>Limpieza: {{ habitacion.limpieza ? 'Limpia' : 'Sucia' }}</p></h1><v-switch v-model="habitacion.limpieza" label="Limpia"  @change="updateHabitacion"/>

          </v-card-text>
        </v-col>
      </v-row>
      <!-- Estructura con fila de dos columnas: Calendario a la izquierda, Formulario a la derecha -->
      <v-row>
        <!-- Columna para el calendario -->
        <v-col cols="1" sm="1" md="3">
          <v-card-text>
            <!-- Calendario -->
            <v-date-picker 
              v-model="date" 
              :allowed-dates="allowedDates" 
              max="2030-10-15" 
              min="2016-06-15">
            </v-date-picker>
          </v-card-text>
        </v-col>

        <!-- Columna para el formulario -->
        <v-col cols="12" sm="6" md="9">
          <v-card-text>
            <v-form v-model="formValid">
              <v-text-field v-model="newReserva.nombreCliente" label="Nombre del Cliente" required />

              <!-- Fechas de entrada y salida con columnas responsivas -->
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="newReserva.fechaEntrada" label="Fecha de Entrada" type="date" required @change="resetFechaValida" />
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="newReserva.fechaSalida" label="Fecha de Salida" type="date" required @change="resetFechaValida" />
                </v-col>
              </v-row>

              <!-- Botón para agregar o guardar reserva -->
              <v-btn 
                @click="isEditing ? updateReserva() : addReserva()" 
                color="primary" 
                :disabled="!formValid || !isFechaValida">
                {{ isEditing ? 'Modificar Reserva' : 'Agregar Reserva' }}
              </v-btn>
            </v-form>

            <!-- Mostrar mensaje de error si las fechas son invalidas -->
            <v-alert v-if="!isFechaValida" type="error">
              Las fechas seleccionadas se solapan con una reserva existente.
            </v-alert>
          </v-card-text>
        </v-col>
      </v-row>

      <!-- Mostrar las reservas existentes -->
      <v-row>
        <v-col cols="12">
          <v-card-text>
            <v-list>
              <v-list-item-group>
                <v-list-item v-for="reserva in reservas" :key="reserva.id">
                  <v-list-item-content>
                    
                    <v-list-item-title><h1>{{ reserva.nombreCliente }} </h1></v-list-item-title>
                    <h2>{{ reserva.fechaEntrada }} - {{ reserva.fechaSalida }} </h2>
                  </v-list-item-content>
                  <v-list-item-action>
                    <!-- Botones de edición y eliminación -->
                    <v-btn @click="deleteReserva(reserva.id)" icon>
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>
        </v-col>
        
        
      </v-row>

    </v-card>
  </v-container>
</template>



<script>
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

export default {
  props: ['id'],  // Recibe el ID de la habitación desde la URL
  data() {
    return {
      habitacion: {},
      reservas: [],  // Reservas existentes para esta habitación
      newReserva: {
        nombreCliente: '',
        fechaEntrada: '',
        fechaSalida: '',
      },
      formValid: false,
      isFechaValida: true,  // Variable que indica si la fecha es válida
      isEditing: false,  // Para saber si estamos editando una reserva
      editingReserva: null,  // Reserva que se está editando
      date: null,  // Variable para el calendario visual
    };
  },
  async mounted() {
    // Obtener los detalles de la habitación
    const habitacionRef = doc(db, 'habitaciones', this.id);
    const habitacionSnapshot = await getDoc(habitacionRef);

    if (habitacionSnapshot.exists()) {
      this.habitacion = habitacionSnapshot.data();
    } else {
      console.log('Habitación no encontrada');
    }

    // Obtener las reservas existentes para esta habitación
    await this.fetchReservas();
  },
  methods: {
     // Función para actualizar el estado de la habitación en Firestore
     async updateHabitacion() {
      try {
        const habitacionRef = doc(db, 'habitaciones', this.id);
        await updateDoc(habitacionRef, {
          estado: this.habitacion.estado,
          limpieza: this.habitacion.limpieza,
        });
        console.log('Habitación actualizada correctamente');
      } catch (error) {
        console.error("Error al actualizar la habitación:", error);
      }
    },
    // Obtener las reservas de esta habitación desde Firestore
    async fetchReservas() {
      const reservasQuery = query(
        collection(db, 'reservas'),
        where('habitacionId', '==', this.id)
      );
      const querySnapshot = await getDocs(reservasQuery);
      this.reservas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },

    // Validar si la fecha de entrada y salida se solapan con alguna reserva existente
    isFechaDisponible(fechaEntrada, fechaSalida) {
      // Convertir las fechas a objetos Date
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);

      return !this.reservas.some(reserva => {
        const reservaEntrada = new Date(reserva.fechaEntrada);
        const reservaSalida = new Date(reserva.fechaSalida);

        // Si estamos editando, no comparar con la reserva que estamos modificando
        if (this.isEditing && reserva.id === this.editingReserva.id) {
          return false;
        }

        // Verifica si las fechas se solapan
        return (
          (entrada >= reservaEntrada && entrada <= reservaSalida) ||
          (salida >= reservaEntrada && salida <= reservaSalida)
        );
      });
    },

    // Agregar nueva reserva
    async addReserva() {
      if (this.isFechaDisponible(this.newReserva.fechaEntrada, this.newReserva.fechaSalida)) {
        try {
          await addDoc(collection(db, 'reservas'), {
            habitacionId: this.id,
            nombreCliente: this.newReserva.nombreCliente,
            fechaEntrada: this.newReserva.fechaEntrada,
            fechaSalida: this.newReserva.fechaSalida,
          });
          this.newReserva = { nombreCliente: '', fechaEntrada: '', fechaSalida: '' };
          this.fetchReservas();  // Actualiza la lista de reservas
          this.isFechaValida = true; // Resetear validación de fecha
        } catch (error) {
          console.error("Error al agregar la reserva:", error);
        }
      } else {
        this.isFechaValida = false;
      }
    },

    // Editar una reserva
    editReserva(reserva) {
      this.isEditing = true;  // Cambiar el estado de edición
      this.editingReserva = { ...reserva };  // Copiar los datos de la reserva a editar
      this.newReserva.nombreCliente = this.editingReserva.nombreCliente;
      this.newReserva.fechaEntrada = this.editingReserva.fechaEntrada;
      this.newReserva.fechaSalida = this.editingReserva.fechaSalida;
    },

    // Guardar la reserva editada
    async updateReserva() {
      if (this.isFechaDisponible(this.newReserva.fechaEntrada, this.newReserva.fechaSalida)) {
        try {
          const reservaRef = doc(db, 'reservas', this.editingReserva.id);
          await updateDoc(reservaRef, {
            nombreCliente: this.newReserva.nombreCliente,
            fechaEntrada: this.newReserva.fechaEntrada,
            fechaSalida: this.newReserva.fechaSalida,
          });
          this.isEditing = false;  // Cambiar el estado de edición
          this.editingReserva = null;
          this.newReserva = { nombreCliente: '', fechaEntrada: '', fechaSalida: '' };
          this.fetchReservas();  // Actualiza la lista de reservas
          this.isFechaValida = true; // Resetear validación de fecha
        } catch (error) {
          console.error("Error al actualizar la reserva:", error);
        }
      } else {
        this.isFechaValida = false;
      }
    },

    // Eliminar una reserva
    async deleteReserva(id) {
      try {
        await deleteDoc(doc(db, 'reservas', id));
        this.fetchReservas();  // Actualiza la lista de reservas
      } catch (error) {
        console.error("Error al eliminar la reserva:", error);
      }
    },

    // Restablecer la validación de fechas
    resetFechaValida() {
      this.isFechaValida = true;
    },

    // Función para mostrar las fechas bloqueadas en el calendario
    allowedDates(val) {
  // Convertir la fecha seleccionada a objeto Date (sin hora)
  const dateToCheck = new Date(val);
  dateToCheck.setHours(0, 0, 0, 0);  // Asegúrate de que solo se comparen las fechas, no las horas

  // Compara si la fecha seleccionada cae dentro de las reservas existentes
  return this.reservas.every(reserva => {
    const reservaEntrada = new Date(reserva.fechaEntrada);
    const reservaSalida = new Date(reserva.fechaSalida);

    reservaEntrada.setHours(0, 0, 0, 0);  // Asegúrate de comparar solo las fechas
    reservaSalida.setHours(0, 0, 0, 0);  // Asegúrate de comparar solo las fechas

    // Si la fecha seleccionada está en el rango de alguna reserva, la bloquea
    return !(dateToCheck >= reservaEntrada && dateToCheck <= reservaSalida);
  });
}
  },
};
</script>
