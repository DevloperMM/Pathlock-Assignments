namespace Backend.DTOs;

public class TaskInput
{
    public string Title { get; set; } = "";
    public int EstimatedHours { get; set; }
    public DateTime DueDate { get; set; }
    public List<string> Dependencies { get; set; } = new();
}

public class ScheduleInput
{
    public List<TaskInput> Tasks { get; set; } = new();
}

public class ScheduleOutput
{
    public List<string> RecommendedOrder { get; set; } = new();
    public string Message { get; set; } = "";
}
