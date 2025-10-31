import axios from 'axios';

export async function postSchedule(projectId: string, tasks: any[]) {
  const { data } = await axios.post(
    `http://localhost:5000/api/v1/projects/${projectId}/schedule`,
    { tasks }
  );
  return data;
}
