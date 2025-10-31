import api from './axios';
import type {
    Project,
    CreateProjectRequest,
    CreateTaskRequest,
    UpdateTaskRequest,
    Task,
    ScheduleRequest,
    ScheduleResponse,
} from '../types';

export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  createTask: async (projectId: number, data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  updateTask: async (
    projectId: number,
    taskId: number,
    data: UpdateTaskRequest
  ): Promise<Task> => {
    const response = await api.put<Task>(
      `/projects/${projectId}/tasks/${taskId}`,
      data
    );
    return response.data;
  },

  deleteTask: async (projectId: number, taskId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },

  scheduleTasks: async (
    projectId: number,
    data: ScheduleRequest
  ): Promise<ScheduleResponse> => {
    const response = await api.post<ScheduleResponse>(
      `/projects/${projectId}/schedule`,
      data
    );
    return response.data;
  },
};
