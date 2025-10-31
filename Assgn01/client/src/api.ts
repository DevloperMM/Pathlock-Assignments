import axios from "axios";
import { Task } from "./types";

const API_URL = "http://localhost:5181/api/tasks";

export const getTasks = async () => {
  const res = await axios.get<Task[]>(API_URL);
  return res.data;
};

export const addTask = async (desc: string) => {
  const res = await axios.post<Task>(API_URL, { desc, isCompleted: false });
  return res.data;
};

export const updateTask = async (task: Task) => {
  const res = await axios.put<Task>(`${API_URL}/${task.id}`, task);
  return res.data;
};

export const deleteTask = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};
