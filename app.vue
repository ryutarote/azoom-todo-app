<template>
  <div
    :class="{ 'bg-gray-100': !darkMode, 'bg-gray-900': darkMode }"
    class="min-h-screen flex items-center justify-center transition-colors duration-200"
  >
    <div class="container mx-auto p-4 max-w-lg">
      <h1
        :class="{ 'text-indigo-700': !darkMode, 'text-indigo-400': darkMode }"
        class="text-3xl font-bold mb-6 text-center"
      >
        TODO App
      </h1>
      <TodoForm />
      <TodoList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTodos } from './composables/useTodos';
import { useStoreTodos } from './stores/useStoreTodos'; // Add this import
import TodoForm from './components/TodoForm.vue';
import TodoList from './components/TodoList.vue';

const { darkMode } = useTodos();

onMounted(() => {
  const todoStore = useStoreTodos();
  todoStore.loadTodos();
});
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
