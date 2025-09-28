using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Extensions;

var builder = WebApplication.CreateSlimBuilder(args);

// Настройка переменных окружения
EnvironmentVariablesProvider.ConfigureEnvironmentVariables(builder.Configuration);

// Регистрация всех сервисов приложения
builder.Services.AddDevRelServices(builder.Configuration);
builder.Services.AddControllers();

var app = builder.Build();

// Настройка middleware pipeline
app.ConfigureDevRelPipeline();

// Предзагрузка данных
await app.WarmUpApplicationAsync();

app.Run();