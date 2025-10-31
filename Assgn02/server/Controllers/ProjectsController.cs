using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v1/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;

        public ProjectsController(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        private int GetCurrentUserId()
        {
            return _jwtService.GetUserIdFromToken(User) ?? throw new UnauthorizedAccessException();
        }

        [HttpGet]
        public async Task<ActionResult<List<ProjectResponseDto>>> GetProjects()
        {
            var userId = GetCurrentUserId();
            var projects = await _context.Projects
                .Where(p => p.UserId == userId)
                .Include(p => p.Tasks)
                .Select(p => new ProjectResponseDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    Tasks = p.Tasks.Select(t => new TaskResponseDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        DueDate = t.DueDate,
                        IsCompleted = t.IsCompleted
                    }).ToList()
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpPost]
        public async Task<ActionResult<ProjectResponseDto>> CreateProject(CreateProjectDto dto)
        {
            var userId = GetCurrentUserId();
            var project = new Project
            {
                Title = dto.Title,
                Description = dto.Description,
                UserId = userId
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { projectId = project.Id }, new ProjectResponseDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CreatedAt = project.CreatedAt,
                Tasks = new List<TaskResponseDto>()
            });
        }

        [HttpGet("{projectId}")]
        public async Task<ActionResult<ProjectResponseDto>> GetProject(int projectId)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects
                .Where(p => p.Id == projectId && p.UserId == userId)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync();

            if (project == null)
                return NotFound(new { message = "Project not found" });

            return Ok(new ProjectResponseDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CreatedAt = project.CreatedAt,
                Tasks = project.Tasks.Select(t => new TaskResponseDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DueDate = t.DueDate,
                    IsCompleted = t.IsCompleted
                }).ToList()
            });
        }

        [HttpDelete("{projectId}")]
        public async Task<IActionResult> DeleteProject(int projectId)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

            if (project == null)
                return NotFound(new { message = "Project not found" });

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{projectId}/tasks")]
        public async Task<ActionResult<TaskResponseDto>> CreateTask(int projectId, CreateTaskDto dto)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

            if (project == null)
                return NotFound(new { message = "Project not found" });

            var task = new TaskItem
            {
                Title = dto.Title,
                DueDate = dto.DueDate,
                ProjectId = projectId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { projectId }, new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                DueDate = task.DueDate,
                IsCompleted = task.IsCompleted
            });
        }

        [HttpPut("{projectId}/tasks/{taskId}")]
        public async Task<ActionResult<TaskResponseDto>> UpdateTask(int projectId, int taskId, UpdateTaskDto dto)
        {
            var userId = GetCurrentUserId();
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.ProjectId == projectId && t.Project.UserId == userId);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            task.Title = dto.Title;
            task.DueDate = dto.DueDate;
            task.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();

            return Ok(new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                DueDate = task.DueDate,
                IsCompleted = task.IsCompleted
            });
        }

        [HttpDelete("{projectId}/tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(int projectId, int taskId)
        {
            var userId = GetCurrentUserId();
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.ProjectId == projectId && t.Project.UserId == userId);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{projectId}/schedule")]
        public async Task<ActionResult<ScheduleResponseDto>> ScheduleTasks(int projectId, ScheduleRequestDto dto)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects
                .Where(p => p.Id == projectId && p.UserId == userId)
                .Include(p => p.Tasks.Where(t => !t.IsCompleted))
                .FirstOrDefaultAsync();

            if (project == null)
                return NotFound(new { message = "Project not found" });

            var incompleteTasks = project.Tasks.OrderBy(t => t.DueDate ?? DateTime.MaxValue).ToList();

            if (!incompleteTasks.Any())
            {
                return Ok(new ScheduleResponseDto
                {
                    Message = "No incomplete tasks to schedule",
                    ScheduledTasks = new List<ScheduledTaskDto>()
                });
            }

            var scheduledTasks = new List<ScheduledTaskDto>();
            var currentDate = dto.StartDate;
            var hoursPerTask = dto.TotalHoursAvailable / incompleteTasks.Count;

            foreach (var task in incompleteTasks)
            {
                scheduledTasks.Add(new ScheduledTaskDto
                {
                    TaskId = task.Id,
                    Title = task.Title,
                    SuggestedStartDate = currentDate,
                    SuggestedEndDate = currentDate.AddHours(hoursPerTask),
                    EstimatedHours = hoursPerTask
                });

                currentDate = currentDate.AddHours(hoursPerTask);
            }

            return Ok(new ScheduleResponseDto
            {
                Message = $"Successfully scheduled {scheduledTasks.Count} tasks",
                ScheduledTasks = scheduledTasks
            });
        }
    }
}
