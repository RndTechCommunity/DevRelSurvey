using RndTech.DevRel.App.Configuration;
using RndTech.DevRel.App.Extensions;

var builder = WebApplication.CreateSlimBuilder(args);

// Настройка переменных окружения
EnvironmentVariablesProvider.ConfigureEnvironmentVariables(builder.Configuration);

// Регистрация всех сервисов приложения
builder.Services.AddDevRelApplication(builder.Configuration);

var app = builder.Build();

// Валидация конфигурации
app.Services.ValidateConfiguration();

// Настройка middleware pipeline
app.ConfigureMiddlewarePipeline();

// Предзагрузка данных
app.Services.WarmUpApplication();

app.Run();