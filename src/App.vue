<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Gestión de Habitaciones</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Inicio</v-btn>
      <v-btn text to="/gestionar-habitaciones">Gestionar Habitaciones</v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>  <!-- Renderiza la vista actual -->
    </v-main>

    <v-footer app>
      <v-col class="text-center" cols="12">
        © 2024 Gestión de Habitaciones
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>
