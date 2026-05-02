<template>
  <v-app>
    <v-main
      class="d-flex align-center justify-center"
      style="background-color: #F7F9FC; min-height: 100vh;"
    >
      <v-container fluid class="pa-4">
        <v-row align="center" justify="center" no-gutters>
          <v-col cols="12" class="d-flex justify-center">
            <slot></slot>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// AuthLayout provides consistent layout for login/register pages
</script>
