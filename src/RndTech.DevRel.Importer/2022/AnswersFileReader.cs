using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;

namespace RndTech.DevRel.Importer._2022;

public static class AnswersFileReader
{
	public static AnswerFileModel[] Read(string filePath)
	{
		using var reader = new StreamReader(filePath);
		using var csv = new CsvReader(reader,
			new CsvConfiguration(CultureInfo.InvariantCulture)
				{ HasHeaderRecord = true, BadDataFound = null, Delimiter = "," });
		
		var answers = csv.GetRecords<AnswerFileModel>().ToArray();

		return answers;
	}
}
