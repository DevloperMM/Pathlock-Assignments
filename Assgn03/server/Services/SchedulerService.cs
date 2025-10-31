using Backend.DTOs;

namespace Backend.Services
{
    public class SchedulerService
    {
        public ScheduleOutput GetRecommendedOrder(ScheduleInput input)
        {
            var graph = new Dictionary<string, List<string>>();
            var indegree = new Dictionary<string, int>();

            // Build graph
            foreach (var task in input.Tasks)
            {
                graph[task.Title] = new List<string>();
                indegree[task.Title] = 0;
            }
            foreach (var task in input.Tasks)
            {
                foreach (var dep in task.Dependencies)
                {
                    if (!graph.ContainsKey(dep))
                        graph[dep] = new List<string>();
                    graph[dep].Add(task.Title);
                    indegree[task.Title]++;
                }
            }

            // Topological sort (Kahn's algorithm)
            var queue = new Queue<string>(indegree.Where(x => x.Value == 0).Select(x => x.Key));
            var order = new List<string>();

            while (queue.Count > 0)
            {
                var curr = queue.Dequeue();
                order.Add(curr);

                if (!graph.ContainsKey(curr)) continue;

                foreach (var next in graph[curr])
                {
                    indegree[next]--;
                    if (indegree[next] == 0) queue.Enqueue(next);
                }
            }

            if (order.Count != input.Tasks.Count)
                return new ScheduleOutput { Message = "Dependency cycle detected!", RecommendedOrder = new List<string>() };

            return new ScheduleOutput { RecommendedOrder = order, Message = "Tasks scheduled successfully" };
        }
    }
}
