using Microsoft.EntityFrameworkCore;

namespace AutoWeightLog.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
