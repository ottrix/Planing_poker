using Microsoft.EntityFrameworkCore;
using ScrumPoker;
using ScrumPoker.Server;
using ScrumPoker.Server.Hubs;
using ScrumPoker.Server.Managers;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:8080");  

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
        }
    )
);

builder.Services.AddScoped<UserManager>();
builder.Services.AddScoped<RoomManager>();
builder.Services.AddScoped<PointsManager>();
builder.Services.AddSingleton<VotingManager>();
builder.Services.AddSingleton<ConcurrentDictionary<string, RoomState>>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowSpecificOrigin",
        policyBuilder =>
        {
            policyBuilder
                .WithOrigins("https://plan-poker.com", "https://www.plan-poker.com") 
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseForwardedHeaders();

app.UseCors("AllowSpecificOrigin");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

app.MapControllers();
app.MapHub<PlanningHub>("/planningHub");

app.MapControllerRoute(
    name: "room",
    pattern: "room/{roomId}",
    defaults: new { controller = "Room", action = "Index" }
);

app.Logger.LogInformation("Application started and listening on: {Urls}", string.Join(", ", app.Urls));

app.Run();
