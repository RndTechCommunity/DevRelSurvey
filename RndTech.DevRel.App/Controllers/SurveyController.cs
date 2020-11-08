using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Renci.SshNet;
using RndTech.DevRel.App.Model.Survey2020;

namespace RndTech.DevRel.App.Controllers
{
    [Route("api/")]
    public class SurveyController : Controller
    {
        private readonly IOptions<Survey2020SftpCredentials> sftpOptions;

        public SurveyController(IOptions<Survey2020SftpCredentials> sftpOptions)
        {
            this.sftpOptions = sftpOptions;
        }
        
        [HttpPost]
        [Route("survey")]
        [Throttle(Name="Survey2020", Message = "", Seconds = 10)]
        public IActionResult SaveSurveyData(string answer)
        {
            var answerModel = JsonConvert.DeserializeObject<SurveyAnswer>(answer);
            if(answerModel == null || answerModel.CompaniesQuestion.All().Any(x => x == null))
                return new ConflictResult();
            
            var connectionInfo = new ConnectionInfo(
                sftpOptions.Value.Host,
                sftpOptions.Value.Login,
                new PasswordAuthenticationMethod(sftpOptions.Value.Login, sftpOptions.Value.Password));
            
            var fileName = $"{answer.GetHashCode()}.json";
            using (var client = new SftpClient(connectionInfo))
            {
                client.Connect();
                
                SaveEmail(client, answerModel);
                answerModel.EmailQuestion = string.Empty;
                client.WriteAllText(fileName, JsonConvert.SerializeObject(answerModel));
            }
            
            return new AcceptedResult();
        }

        private void SaveEmail(SftpClient client, SurveyAnswer answerModel)
        {
            const string fileName = "log.txt";
            client.AppendAllText(fileName, $"{answerModel.EmailQuestion}\n");
            client.WriteAllLines(fileName, client.ReadAllLines(fileName).OrderBy(x => Guid.NewGuid()));
        }
    }
}