namespace RndTech.DevRel.Importer._2022;

public static class Importer
{
	public static void Import()
	{
		var answers = AnswersFileReader.Read("2022.csv");
		AnswersDbImporter.Import("", answers);
	}
}
