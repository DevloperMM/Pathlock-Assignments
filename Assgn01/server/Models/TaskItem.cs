namespace Assignment1.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Desc { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}
