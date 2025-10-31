using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CreateTaskDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class TaskResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class ScheduleRequestDto
    {
        [Required]
        public int TotalHoursAvailable { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
    }

    public class ScheduleResponseDto
    {
        public List<ScheduledTaskDto> ScheduledTasks { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }

    public class ScheduledTaskDto
    {
        public int TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime SuggestedStartDate { get; set; }
        public DateTime SuggestedEndDate { get; set; }
        public int EstimatedHours { get; set; }
    }
}
