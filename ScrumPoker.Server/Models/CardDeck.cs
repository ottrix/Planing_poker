using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ScrumPoker.Server.Models
{
    public class CardDeck
    {
        public string Name { get; set; }
        public List<string> Values { get; set; }

        public CardDeck(string name, List<string> values)
        {
            Name = name;
            Values = values;
        }
    }
}