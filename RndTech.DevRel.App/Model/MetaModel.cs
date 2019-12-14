using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RndTech.DevRel.App.Model
{
	public class MetaModel
	{
		public int count { get; set; }
		public Dictionary<string, Dictionary<string, int>> sources { get; set; }
	}
}
