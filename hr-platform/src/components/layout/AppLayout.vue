<template>
  <div class="app">
    <Header />
    <div class="main">
      <Sidebar />
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
</script>
