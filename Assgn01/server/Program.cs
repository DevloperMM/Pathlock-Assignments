using Assignment1.Models;
using Assignment1.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000", "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ Enable CORS before endpoints
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Your endpoints
app.MapGet("/api/tasks", () => Results.Ok(TaskRepository.GetAll()));
app.MapPost("/api/tasks", (TaskItem task) =>
{
    task.Id = Guid.NewGuid();
    TaskRepository.Add(task);
    return Results.Created($"/api/tasks/{task.Id}", task);
});
app.MapPut("/api/tasks/{id}", (Guid id, TaskItem updatedTask) =>
{
    var existing = TaskRepository.GetById(id);
    if (existing is null) return Results.NotFound();
    updatedTask.Id = id;
    TaskRepository.Update(updatedTask);
    return Results.Ok(updatedTask);
});
app.MapDelete("/api/tasks/{id}", (Guid id) =>
{
    var existing = TaskRepository.GetById(id);
    if (existing is null) return Results.NotFound();
    TaskRepository.Delete(id);
    return Results.NoContent();
});

app.Run();
