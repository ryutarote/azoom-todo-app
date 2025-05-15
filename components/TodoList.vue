<template>
  <div v-if="filteredTodos.length > 0 || todos.length > 0">
    <!-- フィルターコントロール -->
    <div class="mb-4 space-y-3">
      <!-- ステータスフィルター -->
      <div class="flex justify-between items-center">
        <div :class="{ 'text-gray-800': !darkMode, 'text-white': darkMode }" class="flex space-x-4">
          <button
            :class="[
              'text-sm py-1',
              {
                'text-indigo-600 font-medium border-b-2 border-indigo-600': filter === 'all' && !darkMode,
                'text-indigo-400 font-medium border-b-2 border-indigo-400': filter === 'all' && darkMode,
                'text-gray-500 hover:text-gray-700': filter !== 'all' && !darkMode,
                'text-gray-400 hover:text-gray-200': filter !== 'all' && darkMode
              }
            ]"
            @click="setFilter('all')"
          >
            すべて
          </button>
          <button
            :class="[
              'text-sm py-1',
              {
                'text-indigo-600 font-medium border-b-2 border-indigo-600': filter === 'active' && !darkMode,
                'text-indigo-400 font-medium border-b-2 border-indigo-400': filter === 'active' && darkMode,
                'text-gray-500 hover:text-gray-700': filter !== 'active' && !darkMode,
                'text-gray-400 hover:text-gray-200': filter !== 'active' && darkMode
              }
            ]"
            @click="setFilter('active')"
          >
            未完了
          </button>
          <button
            :class="[
              'text-sm py-1',
              {
                'text-indigo-600 font-medium border-b-2 border-indigo-600': filter === 'completed' && !darkMode,
                'text-indigo-400 font-medium border-b-2 border-indigo-400': filter === 'completed' && darkMode,
                'text-gray-500 hover:text-gray-700': filter !== 'completed' && !darkMode,
                'text-gray-400 hover:text-gray-200': filter !== 'completed' && darkMode
              }
            ]"
            @click="setFilter('completed')"
          >
            完了済み
          </button>
        </div>

        <!-- ダークモード切替 -->
        <button
          :class="[
            'p-2 rounded-full',
            { 'bg-gray-200 text-gray-700 hover:bg-gray-300': !darkMode, 'bg-gray-700 text-yellow-300 hover:bg-gray-600': darkMode }
          ]"
          @click="toggleDarkMode"
        >
          <svg v-if="darkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>

      <!-- 詳細フィルター -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- カテゴリフィルター -->
        <div class="flex items-center space-x-2">
          <label :class="{ 'text-gray-700': !darkMode, 'text-gray-200': darkMode }" class="text-sm">カテゴリ:</label>
          <select
            v-model="selectedCategoryFilter"
            :class="[
              'flex-grow p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
              { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
            ]"
          >
            <option :value="null">すべて</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>

        <!-- 優先度フィルター -->
        <div class="flex items-center space-x-2">
          <label :class="{ 'text-gray-700': !darkMode, 'text-gray-200': darkMode }" class="text-sm">優先度:</label>
          <select
            v-model="selectedPriorityFilter"
            :class="[
              'flex-grow p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
              { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
            ]"
          >
            <option :value="null">すべて</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
      </div>
    </div>

    <!-- タスク統計 -->
    <div class="mb-4 flex justify-between items-center">
      <div :class="{ 'text-gray-600': !darkMode, 'text-gray-300': darkMode }" class="text-sm">
        残タスク: {{ activeCount }} / 完了: {{ completedCount }}
      </div>
      <button
        v-if="completedCount > 0"
        :class="[
          'text-sm text-red-500 hover:text-red-700',
          { 'text-red-400 hover:text-red-200': darkMode }
        ]"
        @click="clearCompleted"
      >
        完了済みを削除
      </button>
    </div>

    <!-- 期限切れアラート -->
    <div v-if="overdueTodos.length > 0" class="mb-4 p-3 rounded" :class="{ 'bg-red-50 text-red-800': !darkMode, 'bg-red-900 bg-opacity-30 text-red-200': darkMode }">
      <p class="font-medium">{{ overdueTodos.length }}件のタスクの期限が切れています！</p>
    </div>

    <!-- 期限が近いタスクの通知 -->
    <div v-if="upcomingTodos.length > 0" class="mb-4 p-3 rounded" :class="{ 'bg-yellow-50 text-yellow-800': !darkMode, 'bg-yellow-900 bg-opacity-30 text-yellow-200': darkMode }">
      <p class="font-medium">{{ upcomingTodos.length }}件のタスクの期限が近づいています（3日以内）</p>
    </div>

    <!-- タスクリスト -->
    <div :class="{ 'bg-white': !darkMode, 'bg-gray-800': darkMode }" class="rounded shadow">
      <ul class="divide-y" :class="{ 'divide-gray-200': !darkMode, 'divide-gray-700': darkMode }">
        <TodoItem
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
        />
      </ul>
    </div>
  </div>

  <!-- タスクなしの表示 -->
  <div
    v-else
    class="text-center p-8 rounded shadow-sm"
    :class="{ 'bg-gray-50 text-gray-500': !darkMode, 'bg-gray-800 text-gray-300': darkMode }"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p>タスクがありません。新しいタスクを追加してください。</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTodos } from '../composables/useTodos';
import TodoItem from './TodoItem.vue';

const {
  todos,
  filteredTodos,
  completedCount,
  activeCount,
  upcomingTodos,
  overdueTodos,
  filter,
  categories,
  darkMode,
  clearCompleted,
  setFilter,
  setCategoryFilter,
  setPriorityFilter,
  toggleDarkMode
} = useTodos();

const selectedCategoryFilter = ref<string | null>(null);
const selectedPriorityFilter = ref<'low' | 'medium' | 'high' | null>(null);

// フィルター変更を監視して適用
watch(selectedCategoryFilter, (newValue) => {
  setCategoryFilter(newValue);
});

watch(selectedPriorityFilter, (newValue) => {
  setPriorityFilter(newValue);
});
</script>
