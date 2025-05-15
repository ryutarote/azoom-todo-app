<template>
  <li :class="['p-3 transition-colors', { 'bg-gray-50': !todo.completed && !darkMode, 'bg-gray-700': !todo.completed && darkMode, 'bg-green-50': todo.completed && !darkMode, 'bg-green-900 bg-opacity-20': todo.completed && darkMode }]">
    <!-- 表示モード -->
    <div v-if="!isEditing" class="flex items-center justify-between">
      <div class="flex items-start space-x-3 flex-grow">
        <input
          type="checkbox"
          :checked="todo.completed"
          class="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500"
          @change="toggleTodo(todo.id)"
        >
        <div class="flex-grow">
          <!-- タスク内容 -->
          <div class="flex items-center">
            <span
              :class="['font-medium break-words', { 'line-through text-gray-500': todo.completed, 'text-gray-800': !todo.completed && !darkMode, 'text-white': !todo.completed && darkMode }]"
            >{{ todo.content }}</span>

            <!-- 優先度バッジ -->
            <span
              :class="[
                'ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                {
                  'bg-red-100 text-red-800': todo.priority === 'high' && !darkMode,
                  'bg-yellow-100 text-yellow-800': todo.priority === 'medium' && !darkMode,
                  'bg-blue-100 text-blue-800': todo.priority === 'low' && !darkMode,
                  'bg-red-900 text-red-100': todo.priority === 'high' && darkMode,
                  'bg-yellow-900 text-yellow-100': todo.priority === 'medium' && darkMode,
                  'bg-blue-900 text-blue-100': todo.priority === 'low' && darkMode
                }
              ]"
            >
              {{ displayPriority }}
            </span>
          </div>

          <!-- 詳細情報 -->
          <div class="mt-1 text-xs flex flex-wrap gap-2">
            <!-- カテゴリ -->
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded',
                { 'bg-purple-100 text-purple-800': !darkMode, 'bg-purple-900 text-purple-100': darkMode }
              ]"
            >
              {{ todo.category }}
            </span>

            <!-- 期限日 -->
            <span
              v-if="todo.dueDate"
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded',
                {
                  'bg-gray-100 text-gray-800': !isOverdue && !darkMode,
                  'bg-red-100 text-red-800': isOverdue && !darkMode,
                  'bg-gray-700 text-gray-200': !isOverdue && darkMode,
                  'bg-red-900 text-red-100': isOverdue && darkMode
                }
              ]"
            >
              期限: {{ formattedDueDate }}
            </span>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex items-center space-x-2 ml-2">
        <button
          :class="[
            'p-1 rounded-full hover:bg-gray-200 transition',
            { 'text-gray-600 hover:text-gray-800': !darkMode, 'text-gray-300 hover:text-white hover:bg-gray-600': darkMode }
          ]"
          @click="isEditing = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          :class="[
            'p-1 rounded-full hover:bg-red-100 transition',
            { 'text-red-600 hover:text-red-800': !darkMode, 'text-red-400 hover:text-red-200 hover:bg-red-900': darkMode }
          ]"
          @click="removeTodo(todo.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 編集モード -->
    <div v-else class="flex flex-col space-y-3">
      <input
        v-model="editedContent"
        type="text"
        :class="[
          'w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
          { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
        ]"
      >

      <div class="grid grid-cols-2 gap-2">
        <!-- カテゴリ選択 -->
        <div class="flex flex-col">
          <label :class="{ 'text-gray-700': !darkMode, 'text-gray-200': darkMode }" class="text-xs mb-1">カテゴリ</label>
          <select
            v-model="editedCategory"
            :class="[
              'p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
              { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
            ]"
          >
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            <option value="新規カテゴリ">+ 新規カテゴリ</option>
          </select>
          <input
            v-if="editedCategory === '新規カテゴリ'"
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
            v-model="editedPriority"
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
      </div>

      <!-- 期限設定 -->
      <div class="flex flex-col">
        <label :class="{ 'text-gray-700': !darkMode, 'text-gray-200': darkMode }" class="text-xs mb-1">期限日 (任意)</label>
        <input
          v-model="editedDueDate"
          type="date"
          :class="[
            'p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
            { 'bg-white border-gray-300': !darkMode, 'bg-gray-700 border-gray-600 text-white': darkMode }
          ]"
        >
      </div>

      <!-- 編集アクションボタン -->
      <div class="flex space-x-2">
        <button
          :class="[
            'px-4 py-2 rounded flex-grow',
            { 'bg-indigo-600 text-white hover:bg-indigo-700': !darkMode, 'bg-indigo-700 text-white hover:bg-indigo-800': darkMode }
          ]"
          @click="saveChanges"
        >
          保存
        </button>
        <button
          :class="[
            'px-4 py-2 rounded',
            { 'bg-gray-200 text-gray-800 hover:bg-gray-300': !darkMode, 'bg-gray-700 text-white hover:bg-gray-600': darkMode }
          ]"
          @click="isEditing = false"
        >
          キャンセル
        </button>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTodos } from '../composables/useTodos';
import type { Todo } from '~/types/todo';

const props = defineProps<{
  todo: Todo;
}>();

const { removeTodo, toggleTodo, updateTodo, categories, darkMode } = useTodos();

// 編集状態の管理
const isEditing = ref(false);
const editedContent = ref(props.todo.content);
const editedCategory = ref(props.todo.category);
const editedPriority = ref(props.todo.priority);
const newCategory = ref('');

// 期限日のフォーマット
const editedDueDate = ref(props.todo.dueDate ? formatDateForInput(props.todo.dueDate) : '');

// 表示用の優先度名
const displayPriority = computed(() => {
  switch (props.todo.priority) {
    case 'high': return '高';
    case 'medium': return '中';
    case 'low': return '低';
    default: return '中';
  }
});

// 表示用の期限日
const formattedDueDate = computed(() => {
  if (!props.todo.dueDate) return '';
  return new Date(props.todo.dueDate).toLocaleDateString('ja-JP');
});

// 期限切れかどうか
const isOverdue = computed(() => {
  if (!props.todo.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(props.todo.dueDate) < today;
});

// 変更を保存
const saveChanges = () => {
  // 新しいカテゴリの場合
  const finalCategory = editedCategory.value === '新規カテゴリ' && newCategory.value
    ? newCategory.value
    : editedCategory.value;

  // 日付の処理
  let dueDate: Date | null = null;
  if (editedDueDate.value) {
    dueDate = new Date(editedDueDate.value);
  }

  updateTodo(props.todo.id, {
    content: editedContent.value,
    category: finalCategory,
    priority: editedPriority.value,
    dueDate
  });

  isEditing.value = false;
};

// 入力用に日付をフォーマット
function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// propsが変わったら編集状態も更新
watch(() => props.todo, (newTodo) => {
  editedContent.value = newTodo.content;
  editedCategory.value = newTodo.category;
  editedPriority.value = newTodo.priority;
  editedDueDate.value = newTodo.dueDate ? formatDateForInput(newTodo.dueDate) : '';
}, { deep: true });
</script>
