import { useState } from 'react';
import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS = [
  { id: 'todo',        label: '📋 To-do',      color: 'bg-gray-50',  header: 'bg-gray-100 text-gray-700' },
  { id: 'in-progress', label: '⚡ Đang làm',   color: 'bg-blue-50',  header: 'bg-blue-100 text-blue-700' },
  { id: 'done',        label: '✅ Hoàn thành', color: 'bg-green-50', header: 'bg-green-100 text-green-700' },
];

function SortableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragging ? 'opacity-40 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <p className="text-sm font-semibold text-gray-800 mb-1">{task.title}</p>
      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-1 mb-2">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {task.tags?.map(tag => (
          <span key={tag._id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tag.color }}>
            {tag.name}
          </span>
        ))}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
          task.priority === 'high'   ? 'bg-red-100 text-red-600' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                       'bg-green-100 text-green-600'
        }`}>
          {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
        </span>
      </div>
    </div>
  );
}

function DroppableColumn({ col, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-4 flex flex-col transition-all ${col.color} ${isOver ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
      style={{ minHeight: '400px' }}
    >
      <div className={`flex items-center justify-between mb-4 px-2 py-1.5 rounded-lg ${col.header}`}>
        <span className="font-semibold text-sm">{col.label}</span>
        <span className="text-xs font-bold px-2 py-0.5 bg-white rounded-full opacity-70">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {tasks.map(task => <SortableTaskCard key={task._id} task={task} />)}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm py-8">
              Kéo task vào đây
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const handleDragStart = ({ active }) => setActiveTask(tasks.find(t => t._id === active.id));

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const newStatus = COLUMNS.find(c => c.id === over.id)?.id;
    if (!newStatus) return;
    const task = tasks.find(t => t._id === active.id);
    if (task && task.status !== newStatus) {
      updateTask.mutate({ id: active.id, status: newStatus });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-sm text-gray-400">Kéo thả task để thay đổi trạng thái</p>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <DroppableColumn key={col.id} col={col} tasks={getTasksByStatus(col.id)} />
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="bg-white rounded-xl p-3 shadow-2xl border-2 border-primary-300 rotate-2">
              <p className="text-sm font-semibold text-gray-800">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}