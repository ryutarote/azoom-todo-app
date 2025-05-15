import { storeToRefs } from 'pinia';
import { useStoreTodos } from '../stores/useStoreTodos';
import type { Todo } from '~/types/todo';

export const useTodos = () => {
	const todoStore = useStoreTodos();

	const {
		todos,
		completedCount,
		activeCount,
		filteredTodos,
		upcomingTodos,
		overdueTodos,
		filter,
		categoryFilter,
		priorityFilter,
		darkMode,
		categories,
	} = storeToRefs(todoStore);

	const addTodo = (
		content: string,
		category: string = 'その他',
		priority: 'low' | 'medium' | 'high' = 'medium',
		dueDate: Date | null = null
	) => {
		todoStore.addTodo(content, category, priority, dueDate);
	};

	const removeTodo = (id: string) => {
		todoStore.removeTodo(id);
	};

	const toggleTodo = (id: string) => {
		todoStore.toggleTodo(id);
	};

	const updateTodo = (id: string, updates: Partial<Todo>) => {
		todoStore.updateTodo(id, updates);
	};

	const clearCompleted = () => {
		todoStore.clearCompleted();
	};

	const setFilter = (newFilter: 'all' | 'active' | 'completed') => {
		todoStore.setFilter(newFilter);
	};

	const setCategoryFilter = (category: string | null) => {
		todoStore.setCategoryFilter(category);
	};

	const setPriorityFilter = (priority: 'low' | 'medium' | 'high' | null) => {
		todoStore.setPriorityFilter(priority);
	};

	const toggleDarkMode = () => {
		todoStore.toggleDarkMode();
	};

	return {
		todos,
		filteredTodos,
		completedCount,
		activeCount,
		upcomingTodos,
		overdueTodos,
		filter,
		categoryFilter,
		priorityFilter,
		darkMode,
		categories,
		addTodo,
		removeTodo,
		toggleTodo,
		updateTodo,
		clearCompleted,
		setFilter,
		setCategoryFilter,
		setPriorityFilter,
		toggleDarkMode,
	};
};
