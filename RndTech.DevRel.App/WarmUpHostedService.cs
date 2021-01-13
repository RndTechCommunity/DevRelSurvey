using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RndTech.DevRel.App.Model;

namespace RndTech.DevRel.App
{
	public class WarmUpHostedService : IHostedService
	{
		private readonly IServiceProvider serviceProvider;
		
		public WarmUpHostedService(IServiceProvider serviceProvider)
		{
			this.serviceProvider = serviceProvider;
		}

		public async Task StartAsync(CancellationToken cancellationToken)
		{
			using var scope = serviceProvider.CreateScope();
			var intervieweesPreloader = scope.ServiceProvider.GetRequiredService<IntervieweesPreloader>();
		}

		public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
	}
}