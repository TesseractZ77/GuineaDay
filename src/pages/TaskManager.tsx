import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Check, Trash, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface Task {
    id: number;
    title: string;
    due_date: string;
    is_recurring: boolean;
    assignee_id: string | null;
    priority: string;
    category: string;
    is_completed: boolean;
    completed_at: string | null;
    notes: string | null;
}

import { API_URL } from '@/config';

const guineaPigs = [
    { id: 'hachi', name: 'Hachi', color: 'bg-orange-100 text-orange-800' },
    { id: 'kui', name: 'Kui', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'nova', name: 'Nova', color: 'bg-gray-100 text-gray-800' },
    { id: 'elmo', name: 'Elmo', color: 'bg-red-100 text-red-800' },
    { id: 'mel', name: 'Mel', color: 'bg-amber-100 text-amber-800' },
    { id: 'haru', name: 'Haru', color: 'bg-stone-100 text-stone-800' },
    { id: 'seven', name: 'Seven', color: 'bg-lime-100 text-lime-800' },
];

const categories = [
    { id: 'general', name: 'General', emoji: '📋' },
    { id: 'feeding', name: 'Feeding', emoji: '🥦' },
    { id: 'cleaning', name: 'Cleaning', emoji: '🧹' },
    { id: 'grooming', name: 'Grooming', emoji: '✂️' },
    { id: 'health', name: 'Health', emoji: '🏥' },
];

const TaskManager = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profiles, setProfiles] = useState<{ id: number; name: string }[]>([]); // New state for profiles
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedPig, setSelectedPig] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
        fetchProfiles(); // Fetch profiles on mount
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await fetch(`${API_URL}/guineapigs/`);
            if (res.ok) {
                const data = await res.json();
                setProfiles(data);
            }
        } catch (error) {
            console.error("Failed to fetch profiles:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks/`);
            const data = await response.json();
            // Sort tasks: Incomplete first, then by id (newest last)
            const sorted = data.sort((a: Task, b: Task) => {
                if (a.is_completed === b.is_completed) return b.id - a.id;
                return a.is_completed ? 1 : -1;
            });
            setTasks(sorted);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const response = await fetch(`${API_URL}/tasks/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskTitle,
                    assignee_id: selectedPig, // This will now use the selected profile ID (as string)
                    category: selectedCategory,
                    priority: 'medium',
                }),
            });
            const newTask = await response.json();
            setTasks([newTask, ...tasks]);
            setNewTaskTitle('');
            setSelectedPig(null); // Reset selection
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const toggleTaskComplete = async (task: Task) => {
        try {
            // Optimistic update
            setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t));

            const endpoint = task.is_completed
                ? `${API_URL}/tasks/${task.id}`
                : `${API_URL}/tasks/${task.id}/complete`;

            if (task.is_completed) {
                await fetch(`${API_URL}/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...task, is_completed: false }),
                });
            } else {
                await fetch(endpoint, { method: 'PUT' });
            }

            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            fetchTasks();
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            setTasks(tasks.filter(t => t.id !== taskId));
            await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting task:', error);
            fetchTasks();
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/', { state: { fromTasks: true } })}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                            Daily Tasks
                        </h1>
                        <p className="text-muted-foreground">Manage care routines for your furry friends</p>
                    </div>
                </div>

                {/* Add Task Form */}
                <Card className="mb-8 shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <Button type="submit">
                                    <Plus className="h-4 w-4 mr-2" /> Add
                                </Button>
                            </div>


                            <div className="flex flex-col gap-4">
                                {/* Assignee Selection */}
                                <div className="flex gap-2 items-center overflow-x-auto pb-2">
                                    <span className="text-sm font-medium mr-2 text-muted-foreground">For:</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPig(null)}
                                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedPig === null
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background hover:bg-muted'
                                            }`}
                                    >
                                        Anyone
                                    </button>
                                    {profiles.map(pig => (
                                        <button
                                            key={pig.id}
                                            type="button"
                                            onClick={() => setSelectedPig(pig.id.toString())}
                                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedPig === pig.id.toString()
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-background hover:bg-muted'
                                                }`}
                                        >
                                            🐹 {pig.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Category Selection */}
                                <div className="flex gap-2 items-center overflow-x-auto pb-2">
                                    <span className="text-sm font-medium mr-2 text-muted-foreground">Category:</span>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedCategory === cat.id
                                                ? 'bg-secondary text-secondary-foreground border-secondary'
                                                : 'bg-background hover:bg-muted'
                                                }`}
                                        >
                                            <span className="mr-1">{cat.emoji}</span> {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Task List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> Today's Tasks
                    </h2>
                    <AnimatePresence>
                        {tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                layout
                            >
                                <Card className={`group transition-all hover:shadow-md ${task.is_completed ? 'opacity-60 bg-muted/30' : 'bg-card'}`}>
                                    <div className="p-4 flex items-center gap-4">
                                        <button
                                            onClick={() => toggleTaskComplete(task)}
                                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.is_completed
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-muted-foreground/30 hover:border-primary'
                                                }`}
                                        >
                                            {task.is_completed && <Check className="h-3 w-3" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium truncate ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.title}
                                            </h3>
                                            <div className="flex gap-2 mt-1 flex-wrap items-center">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                    {categories.find(c => c.id === task.category)?.emoji} {categories.find(c => c.id === task.category)?.name}
                                                </span>
                                                {task.assignee_id && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                                                        <span>🐹</span>
                                                        {profiles.find(p => p.id.toString() === task.assignee_id)?.name || 'Unknown Piggy'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                        {tasks.length === 0 && !loading && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No tasks yet. Add one to get started!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TaskManager;
