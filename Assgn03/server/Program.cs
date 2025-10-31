using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add controllers support (THIS FIXES THE ERROR!)
builder.Services.AddControllers();

// OpenAPI setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register SchedulerService
builder.Services.AddSingleton<SchedulerService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", b => b
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("CorsPolicy");
app.UseHttpsRedirection();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// This now works ONLY because AddControllers was called above.
app.MapControllers();

app.Run();
