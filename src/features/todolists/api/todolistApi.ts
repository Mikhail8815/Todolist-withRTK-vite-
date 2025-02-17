
import {Todolist} from "@/features/todolists/api/todolistApi.types.ts";
import {BaseResponse} from "@/common/types";
import {instance} from "@/common/instance";

export const todolistApi = {
    getTodolists() {
        return instance.get<Todolist[]>('/todo-lists')
    },
    createTodolists(title: string) {
        return instance.post<BaseResponse<{ item: Todolist }>>('/todo-lists', {title})
    },
    deleteTodolist(id: string) {
        return instance.delete<BaseResponse>(`/todo-lists/${id}`)
    },
    changeTodolistTitle(id: string, title: string) {
       return instance.put<BaseResponse>(`/todo-lists/${id}`, {title})
    }
}