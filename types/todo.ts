export interface Todo {
	id: string;
	content: string;
	completed: boolean;
	createdAt: Date;
	priority: 'low' | 'medium' | 'high';
	dueDate: Date | null;
	category: string;
	isEditing?: boolean;
}

// シリアライズされたTodo（ローカルストレージ保存用）
export interface SerializedTodo {
	id: string;
	content: string;
	completed: boolean;
	createdAt: string;
	priority: 'low' | 'medium' | 'high';
	dueDate: string | null;
	category: string;
}

export interface TodoState {
	todos: Todo[];
	filter: 'all' | 'active' | 'completed';
	categoryFilter: string | null;
	priorityFilter: 'low' | 'medium' | 'high' | null;
	darkMode: boolean;
	categories: string[];
}
