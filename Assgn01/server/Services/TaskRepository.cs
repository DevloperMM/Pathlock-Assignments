using Assignment1.Models;
using System.Xml.Linq;

namespace Assignment1.Services
{
    public class TaskRepository
    {
        private static readonly List<TaskItem> _tasks = new();

        public static IEnumerable<TaskItem> GetAll() => _tasks;

        public static TaskItem? GetById(Guid id) => _tasks.FirstOrDefault(t => t.Id == id);

        public static void Add(TaskItem task) => _tasks.Add(task);

        public static void Update(TaskItem task)
        {
            var existing = GetById(task.Id);
            if (existing != null)
            {
                existing.Desc = task.Desc;
                existing.IsCompleted = task.IsCompleted;
            }
        }

        public static void Delete(Guid id)
        {
            var task = GetById(id);
            if (task != null) _tasks.Remove(task);
        }
    }
}
