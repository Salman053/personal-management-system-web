import { Draggable } from "@hello-pangea/dnd"
import { Task } from "./task-board"
import TaskCard from "./task-card"

type Props = {
  status: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
  review: "Review",
}

export default function TaskColumn({ status, tasks, onEdit, onDelete }: Props) {
  
  return (
    <div>
      <h3 className="font-medium mb-2">{STATUS_LABELS[status]}</h3>
      <div className="space-y-2">
        {tasks.length<=0 && <h4 className="text-foreground/70 text-xs text-center py-4">No Task</h4>}
        {tasks.map((task, index) => (
          <Draggable draggableId={task.id} index={index} key={task.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
              </div>
            )}
          </Draggable>
        ))}
      </div>
    </div>
  )
}
