import { CreateItemForm, EditableSpan } from "@/common/components"
import { TaskStatus } from "@/common/enums/enums"
import { tasksApi } from "@/features/todolists/api/tasksApi"
import type { Task, UpdateTaskModel } from "@/features/todolists/api/tasksApi.types"
import { todolistsApi } from "@/features/todolists/api/todolistsApi"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types"
import { type ChangeEvent, type CSSProperties, useEffect, useState } from "react"
import Checkbox from "@mui/material/Checkbox"

export const AppHttpRequests = () => {
  const [todolists, setTodolists] = useState<Todolist[]>([])
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})

  useEffect(() => {
    todolistsApi.getTodolists().then((res) => {
      const todolists = res.data
      setTodolists(todolists)
      todolists.forEach((todolist) => {
        tasksApi.getTasks(todolist.id).then((res) => {
          setTasks({ ...tasks, [todolist.id]: res.data.items })
        })
      })
    })
  }, [])

  const createTodolist = (title: string) => {
    todolistsApi.createTodolist(title).then((res) => {
      const newTodolist = res.data.data.item
      setTodolists([newTodolist, ...todolists])
      setTasks({ ...tasks, [newTodolist.id]: [] })
    })
  }

  const deleteTodolist = (id: string) => {
    todolistsApi.deleteTodolist(id).then(() => setTodolists(todolists.filter((todolist) => todolist.id !== id)))
  }

  const changeTodolistTitle = (id: string, title: string) => {
    todolistsApi.changeTodolistTitle({ id, title }).then(() => {
      setTodolists(todolists.map((todolist) => (todolist.id === id ? { ...todolist, title } : todolist)))
    })
  }

  const createTask = (todolistId: string, title: string) => {
    tasksApi.createTask(todolistId, title).then((res) => {
      const newTask = res.data.data.item
      setTasks({ ...tasks, [todolistId]: [newTask, ...tasks[todolistId]] })
    })
  }

  const deleteTask = (todolistId: string, taskId: string) => {
    tasksApi.deleteTask(todolistId, taskId).then((res) => {
      setTasks({ ...tasks, [todolistId]: tasks[todolistId].filter((task) => task.id !== taskId) })
    })
  }

  const changeTaskStatus = (event: ChangeEvent<HTMLInputElement>, task: Task) => {
    const todolistId = task.todoListId

    const model: UpdateTaskModel = {
      title: task.title,
      startDate: task.startDate,
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      status: event.currentTarget.checked ? TaskStatus.Completed : TaskStatus.New,
    }

    tasksApi.updateTask(todolistId, task.id, model).then((res) => {
      const updatedTask = res.data.data.item

      setTasks({
        ...tasks,
        [todolistId]: tasks[todolistId].map((item) => (item.id === task.id ? updatedTask : item)),
      })
    })
  }

  const changeTaskTitle = (task: any, title: string) => {
    const todolistId = task.todoListId

    const model: UpdateTaskModel = {
      title: title,
      startDate: task.startDate,
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      status: task.status,
    }

    tasksApi.changeTaskTitle(todolistId, task.id, model).then((res) => {
      const updatedTask = res.data.data.item
      setTasks({
        ...tasks,
        [todolistId]: tasks[todolistId].map((item) => (item.id === task.id ? updatedTask : item)),
      })
    })
  }

  return (
    <div style={{ margin: "20px" }}>
      <CreateItemForm onCreateItem={createTodolist} />
      {todolists.map((todolist) => (
        <div key={todolist.id} style={container}>
          <div>
            <EditableSpan value={todolist.title} onChange={(title) => changeTodolistTitle(todolist.id, title)} />
            <button onClick={() => deleteTodolist(todolist.id)}>x</button>
          </div>
          <CreateItemForm onCreateItem={(title) => createTask(todolist.id, title)} />
          {tasks[todolist.id]?.map((task) => (
            <div key={task.id}>
              <Checkbox checked={task.status === TaskStatus.Completed} onChange={(e) => changeTaskStatus(e, task)} />
              <EditableSpan value={task.title} onChange={(title) => changeTaskTitle(task, title)} />
              <button onClick={() => deleteTask(todolist.id, task.id)}>x</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const container: CSSProperties = {
  border: "1px solid black",
  margin: "20px 0",
  padding: "10px",
  width: "330px",
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "column",
}
