using System.ComponentModel.DataAnnotations;

namespace RndTech.DevRel.App.Configuration;

public class ServerOptions
{
    public const string SectionName = "Server";

    [Range(1, 65535)]
    public int Port { get; set; } = 29500;
}