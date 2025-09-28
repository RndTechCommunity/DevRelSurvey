namespace RndTech.DevRel.App.Configuration;

public static class EnvironmentVariablesProvider
{
    public static void ConfigureEnvironmentVariables(IConfigurationBuilder builder)
    {
        builder.AddEnvironmentVariables(prefix: "DEVRELAPP_CONFIG_");
    }
}