using AutoWeightLog.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/health/db", async (AppDbContext db, CancellationToken cancellationToken) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync(cancellationToken);
        if (!canConnect)
        {
            return Results.Json(new { status = "error", database = "unreachable" }, statusCode: 503);
        }

        return Results.Ok(new { status = "ok", database = "connected" });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new { status = "error", database = "unreachable", detail = ex.Message },
            statusCode: 503);
    }
});

app.Run();
