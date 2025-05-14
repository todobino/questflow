// src/lib/dnd-names.ts
import type { Race } from './dnd-data';

type NameList = {
  firstNames: readonly string[];
  lastNames: readonly string[];
};

export const DND_NAMES: Record<Race, NameList> = {
  Dragonborn: {
    firstNames: [
      "Arjhan", "Balasar", "Bharash", "Donaar", "Ghesh", "Heskan", "Kriv", "Medrash", "Mehen", "Nadarr", "Pandjed", "Patrin", "Rhogar", "Shamash", "Shedinn", "Tarhun", "Torinn",
      "Akra", "Biri", "Daar", "Farideh", "Harann", "Havilar", "Jheri", "Kava", "Korinn", "Mishann", "Nala", "Perra", "Raiann", "Sora", "Surina", "Thava", "Uadjit"
    ],
    lastNames: [
      "Clethtinthiallor", "Daardendrian", "Delmirev", "Drachedandion", "Fenkenkabradon", "Kepeshkmolik", "Kerrhylon", "Kimbatuul", "Linxakasendalor", "Myastan", "Nemmonis", "Norixius", "Ophinshtalajiir", "Prexijandilin", "Shestendeliath", "Turnuroth", "Verthisathurgiesh", "Yarjerit"
    ],
  },
  Dwarf: {
    firstNames: [
      "Adrik", "Alberich", "Baern", "Barendd", "Brottor", "Bruenor", "Dain", "Darrak", "Delg", "Eberk", "Einkil", "Fargrim", "Flint", "Gardain", "Harbek", "Kildrak", "Morgran", "Orsik", "Oskar", "Rangrim", "Rurik", "Taklinn", "Thoradin", "Thorin", "Tordek", "Traubon", "Travok", "Ulfgar", "Veit", "Vondal",
      "Amber", "Artin", "Audhild", "Bardryn", "Dagnal", "Diesa", "Eldeth", "Falkrunn", "Finellen", "Gunnloda", "Gurdis", "Helja", "Hlin", "Kathra", "Kristryd", "Ilde", "Liftrasa", "Mardred", "Riswynn", "Sannl", "Torbera", "Torgga", "Vistra"
    ],
    lastNames: [
      "Balderk", "Battlehammer", "Brawnanvil", "Dankil", "Fireforge", "Frostbeard", "Gorunn", "Holderhek", "Ironfist", "Loderr", "Lutgehr", "Rumnaheim", "Strakeln", "Torunn", "Ungart"
    ],
  },
  Elf: {
    firstNames: [
      "Adran", "Aelar", "Aramil", "Arannis", "Aust", "Beiro", "Berrian", "Carric", "Enialis", "Erdan", "Erevan", "Galinndan", "Hadarai", "Heian", "Himo", "Immeral", "Ivellios", "Laucian", "Mindartis", "Paelias", "Peren", "Quarion", "Riardon", "Rolen", "Soveliss", "Thamior", "Tharivol", "Theren", "Varis",
      "Adrie", "Althaea", "Anastrianna", "Andraste", "Antinua", "Bethrynna", "Birel", "Caelynn", "Drusilia", "Enna", "Felosial", "Ielenia", "Jelenneth", "Keyleth", "Leshanna", "Lia", "Meriele", "Mialee", "Naivara", "Quelenna", "Quillathe", "Sariel", "Shanairra", "Shava", "Silaqui", "Theirastra", "Thia", "Vadania", "Valanthe", "Xanaphia"
    ],
    lastNames: [
      "Amakiir (Gemflower)", "Amastacia (Starflower)", "Galanodel (Moonwhisper)", "Holimion (Diamonddew)", "Ilphelkiir (Gemblossom)", "Liadon (Silverfrond)", "Meliamne (Oakenheel)", "Nai'lo (Nightbreeze)", "Siannodel (Moonbrook)", "Xiloscient (Goldpetal)"
    ],
  },
  Gnome: {
    firstNames: [
      "Alston", "Alvyn", "Boddynock", "Brocc", "Burgell", "Dimble", "Eldon", "Erky", "Fonkin", "Frug", "Gerbo", "Gimble", "Glim", "Jebeddo", "Kellen", "Namfoodle", "Orryn", "Roondar", "Seebo", "Sindri", "Warryn", "Wrenn", "Zook",
      "Bimpnottin", "Breena", "Caramip", "Carlin", "Donella", "Duvamil", "Ella", "Ellyjobell", "Ellywick", "Lilli", "Loopmottin", "Lorilla", "Mardnab", "Nissa", "Nyx", "Oda", "Orla", "Roywyn", "Shamil", "Tana", "Waywocket", "Zanna"
    ],
    lastNames: [
      "Beren", "Daergel", "Folkor", "Garrick", "Nackle", "Murnig", "Ningel", "Raulnor", "Scheppen", "Timbers", "Turen"
    ],
  },
  "Half-Elf": {
    firstNames: [ // Often human or elven, or a mix
      "Calathes", "Corran", "Elmar", "Faelar", "Galen", "Ioriston", "Kael", "Lorin", "Maelor", "Ronan", "Theron", "Valerius",
      "Aeliana", "Ariana", "Elara", "Ilyana", "Lyra", "Maia", "Nyla", "Renna", "Sylphina", "Valena", "Zara"
    ],
    lastNames: [ // Can be human or elven, or a combination.
      "Oakentree", "Silverwood", "Moonbrook", "Stormrider", "Lightfoot", "Hawkwinter", "Swiftarrow", "Starglimmer", "Greenleaf", "Highhill"
    ],
  },
  Halfling: {
    firstNames: [
      "Alton", "Ander", "Corrin", "Eldon", "Errich", "Finnan", "Garret", "Lindal", "Lyle", "Merric", "Milo", "Osborn", "Perrin", "Reed", "Roscoe", "Wellby",
      "Andry", "Bree", "Callie", "Cora", "Euphemia", "Jillian", "Kithri", "Lavinia", "Lidda", "Merla", "Nedda", "Paela", "Portia", "Seraphina", "Shaena", "Trym", "Vani", "Verna"
    ],
    lastNames: [
      "Brushgather", "Goodbarrel", "Greenbottle", "High-hill", "Hilltopple", "Leagallow", "Tealeaf", "Thorngage", "Tosscobble", "Underbough"
    ],
  },
  "Half-Orc": {
    firstNames: [
      "Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth", "Krusk", "Mhurren", "Ront", "Shump", "Thokk",
      "Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega", "Ovak", "Ownka", "Shautha", "Sutha", "Vola", "Volen", "Yevelda"
    ],
    lastNames: [ // Often human surnames or descriptive orcish ones (sometimes just a single name is used)
      "Doomhammer", "Ironhide", "Stonefist", "Blackthorn", "Skullsplitter", "Goreblade", "Smith", "Jones", "Grumsh", "Vorlag"
    ],
  },
  Human: { // Very diverse, providing a generic fantasy set
    firstNames: [
      "Darvin", "Dorn", "Evendur", "Gorstag", "Grim", "Helm", "Malark", "Morn", "Randal", "Stedd", "Alaric", "Brand", "Conrad", "Derek", "Edgar", "Finn", "Gareth", "Ian", "Jasper", "Kevin", "Liam", "Marcus", "Nolan", "Oscar", "Patrick", "Quinn", "Robert", "Simon", "Thomas", "Ulrich", "Victor", "William", "Xavier", "York", "Zachary",
      "Arveene", "Esvele", "Jhessail", "Kerri", "Lureene", "Miri", "Rowan", "Shandie", "Tessele", "Alicia", "Brianna", "Catherine", "Diana", "Eleanor", "Fiona", "Giselle", "Helen", "Isabelle", "Julia", "Katherine", "Laura", "Megan", "Nora", "Olivia", "Penelope", "Quincy", "Rebecca", "Sophia", "Theresa", "Ursula", "Victoria", "Wendy", "Xenia", "Yvonne", "Zoe"
    ],
    lastNames: [
      "Amblecrown", "Buckman", "Dundragon", "Evenwood", "Greycastle", "Tallstag", "Brightwood", "Stormwind", "Blackwood", "Goldcrest", "Ironford", "Redmont", "Silverstream", "Whitestone", "Dragonsbane"
    ],
  },
  Tiefling: {
    firstNames: [ // Often "virtue" names or names sounding somewhat exotic/infernal
      "Akmenos", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon", "Leucis", "Melech", "Mordai", "Morthos", "Pelaios", "Skamos", "Therai", "Valerius", "Zaltar",
      "Akta", "Anakis", "Bryseis", "Criella", "Damaia", "Ea", "Kallista", "Lerissa", "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta", "Tanika", "Thyra", "Zorina"
    ],
    lastNames: [ // Can be descriptive of heritage or chosen.
      "Art", "Carrion", "Chant", "Creed", "Despair", "Excellence", "Fear", "Glory", "Hope", "Ideal", "Music", "Nowhere", "Open", "Poetry", "Quest", "Random", "Reverence", "Sorrow", "Temerity", "Torment", "Weary"
    ],
  },
};
