<template>
  <form class="mb-6" @submit.prevent="handleSubmit">
    <div class="space-y-3">
      <!-- タスク入力フィールド -->
      <div class="flex">
        <input
          v-model="newTodo"
          type="text"
          placeholder="新しいタスクを入力..."
          :class="[
            'flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500',
            { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
          ]"
        >
        <button
          type="button"
          :class="[
            'px-3 flex items-center justify-center border-t border-b',
            { 'bg-white border-gray-300 text-gray-600': !darkMode, 'bg-gray-700 border-gray-600 text-gray-200': darkMode }
          ]"
          @click="showAdvanced = !showAdvanced"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="showAdvanced" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          type="submit"
          :class="[
            'bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700 transition duration-200',
            { 'bg-indigo-700 hover:bg-indigo-800': darkMode }
          ]"
        >
          追加
        </button>
      </div>

      <!-- 詳細設定 -->
      <div v-if="showAdvanced" class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- カテゴリ選択 -->
        <div class="flex flex-col">
          <label :class="{ 'text-gray-700': !darkMode, 'text-gray-200': darkMode }" class="text-xs mb-1">カテゴリ</label>
          <div class="flex">
            <select
              v-model="selectedCategory"
              :class="[
                'flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500',
                { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
              ]"
            >
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              <option value="新規カテゴリ">+ 新規カテゴリ</option>
            </select>
          </div>
          <input
            v-if="selectedCategory === '新規カテゴリ'"
            v-model="newCategory"
            type="text"
            placeholder="新しいカテゴリ名"
            :class="[
              'mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
              { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
            ]"
          >
        </div>

        <!-- 優先度選択 -->
        <div class="flex flex-col">
          <label :class="{ 'text-gray-700': !darkMode, 'text-gray-200': darkMode }" class="text-xs mb-1">優先度</label>
          <select
            v-model="selectedPriority"
            :class="[
              'p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
              { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
            ]"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>

        <!-- 期限日設定 -->
        <div class="flex flex-col">
          <label :class="{ 'text-gray-700': !darkMode, 'text-gray-200': darkMode }" class="text-xs mb-1">期限日 (任意)</label>
          <input
            v-model="dueDate"
            type="date"
            :class="[
              'p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
              { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
            ]"
          >
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTodos } from '../composables/useTodos';

const { addTodo, categories, darkMode } = useTodos();

const newTodo = ref('');
const showAdvanced = ref(false);
const selectedCategory = ref('その他');
const selectedPriority = ref<'low' | 'medium' | 'high'>('medium');
const dueDate = ref('');
const newCategory = ref('');

const handleSubmit = () => {
  if (newTodo.value.trim()) {
    // カテゴリの処理
    const finalCategory = selectedCategory.value === '新規カテゴリ' && newCategory.value.trim()
      ? newCategory.value.trim()
      : selectedCategory.value;

    // 日付の処理
    let finalDueDate: Date | null = null;
    if (dueDate.value) {
      finalDueDate = new Date(dueDate.value);
    }

    addTodo(newTodo.value.trim(), finalCategory, selectedPriority.value, finalDueDate);

    // フォームをリセット
    newTodo.value = '';
    // 詳細項目はリセットしない（ユーザーの入力を尊重）
    if (selectedCategory.value === '新規カテゴリ') {
      newCategory.value = '';
      selectedCategory.value = '仕事';
    }
  }
};
</script>
