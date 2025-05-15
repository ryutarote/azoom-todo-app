import { defineStore } from 'pinia';
import type { TodoState, Todo, SerializedTodo } from '~/types/todo';

export const useStoreTodos = defineStore('todos', {
	state: (): TodoState => ({
		todos: [],
		filter: 'all',
		categoryFilter: null,
		priorityFilter: null,
		darkMode: false,
		categories: ['仕事', '個人', '買い物', 'その他'],
	}),

	getters: {
		completedCount: (state) =>
			state.todos.filter((todo: Todo) => todo.completed).length,
		activeCount: (state) =>
			state.todos.filter((todo: Todo) => !todo.completed).length,

		// フィルタリングされたTodos
		filteredTodos: (state) => {
			return state.todos.filter((todo: Todo) => {
				// ステータスフィルター
				const statusMatch =
					state.filter === 'all' ||
					(state.filter === 'active' && !todo.completed) ||
					(state.filter === 'completed' && todo.completed);

				// カテゴリフィルター
				const categoryMatch =
					!state.categoryFilter || todo.category === state.categoryFilter;

				// 優先度フィルター
				const priorityMatch =
					!state.priorityFilter || todo.priority === state.priorityFilter;

				return statusMatch && categoryMatch && priorityMatch;
			});
		},

		// 期限が近いTodo（3日以内）
		upcomingTodos: (state) => {
			const threeDaysFromNow = new Date();
			threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

			return state.todos.filter((todo: Todo) => {
				return (
					!todo.completed &&
					todo.dueDate &&
					new Date(todo.dueDate) <= threeDaysFromNow &&
					new Date(todo.dueDate) >= new Date()
				);
			});
		},

		// 期限超過タスク
		overdueTodos: (state) => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			return state.todos.filter((todo: Todo) => {
				return (
					!todo.completed && todo.dueDate && new Date(todo.dueDate) < today
				);
			});
		},
	},

	actions: {
		// 新しいTODOを追加
		addTodo(
			content: string,
			category: string = 'その他',
			priority: 'low' | 'medium' | 'high' = 'medium',
			dueDate: Date | null = null
		) {
			const newTodo: Todo = {
				id: crypto.randomUUID(),
				content,
				completed: false,
				createdAt: new Date(),
				priority,
				dueDate,
				category,
			};
			this.todos.push(newTodo);
			this.saveTodos();

			// 新しいカテゴリがある場合は追加
			if (category && !this.categories.includes(category)) {
				this.categories.push(category);
			}
		},

		// TODOを削除
		removeTodo(id: string) {
			this.todos = this.todos.filter((todo: Todo) => todo.id !== id);
			this.saveTodos();
		},

		// TODOの完了状態を切り替え
		toggleTodo(id: string) {
			const todo = this.todos.find((todo: Todo) => todo.id === id);
			if (todo) {
				todo.completed = !todo.completed;
				this.saveTodos();
			}
		},

		// TODOの更新
		updateTodo(id: string, updates: Partial<Todo>) {
			const todoIndex = this.todos.findIndex((todo: Todo) => todo.id === id);
			if (todoIndex !== -1) {
				this.todos[todoIndex] = { ...this.todos[todoIndex], ...updates };

				// 新しいカテゴリがある場合は追加
				if (updates.category && !this.categories.includes(updates.category)) {
					this.categories.push(updates.category);
				}

				this.saveTodos();
			}
		},

		// 完了済みのTODOをすべて削除
		clearCompleted() {
			this.todos = this.todos.filter((todo: Todo) => !todo.completed);
			this.saveTodos();
		},

		// フィルターの設定
		setFilter(filter: 'all' | 'active' | 'completed') {
			this.filter = filter;
		},

		// カテゴリフィルターを設定
		setCategoryFilter(category: string | null) {
			this.categoryFilter = category;
		},

		// 優先度フィルターを設定
		setPriorityFilter(priority: 'low' | 'medium' | 'high' | null) {
			this.priorityFilter = priority;
		},

		// ダークモードの切り替え
		toggleDarkMode() {
			this.darkMode = !this.darkMode;
			localStorage.setItem('darkMode', String(this.darkMode));
		},

		// ローカルストレージに保存
		saveTodos() {
			// Date型をシリアライズしてJSON化
			const serializedTodos = this.todos.map(
				(todo: Todo): SerializedTodo => ({
					...todo,
					createdAt: todo.createdAt.toISOString(),
					dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
				})
			);
			localStorage.setItem('todos', JSON.stringify(serializedTodos));
		},

		// ローカルストレージから読み込み
		loadTodos() {
			const savedTodos = localStorage.getItem('todos');
			if (savedTodos) {
				try {
					// JSONから取得したデータに適切な型を指定
					const parsedTodos: SerializedTodo[] = JSON.parse(savedTodos);
					// 各TodoをパースしてDate型を復元
					this.todos = parsedTodos.map((todo: SerializedTodo) => ({
						...todo,
						createdAt: new Date(todo.createdAt),
						dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
					}));
				} catch (e) {
					this.todos = [];
					throw new Error(
						`Failed to load todos from storage: ${e instanceof Error ? e.message : String(e)}`
					);
				}
			}

			// ダークモード設定の読み込み
			const darkMode = localStorage.getItem('darkMode');
			if (darkMode !== null) {
				this.darkMode = darkMode === 'true';
			}
		},
	},
});
