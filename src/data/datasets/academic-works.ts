import { RenderingConfig } from "../../controllers/RenderingManager";

export enum PersonType {
  Poet = "poet",
  Philosopher = "philosopher",
  Mathematician = "mathematician",
  Polymath = "polymath",
  Artist = "artist",
  Astronomer = "astronomer",
  Scientist = "scientist",
  Playwright = "playwright",
  Writer = "writer",
  // Add more types as necessary
}

export const DEFAULT_RENDERING_CONFIG_AcademicDataset: RenderingConfig = {
  nodeConfig: {
    tags: {},
    types: {
      "major work": {
        color: "#a4c0db",
        isVisible: true,
      },
      year: {
        color: "#918278",
        isVisible: true,
      },
      field: {
        color: "#EADBC8",
        isVisible: true,
      },
      description: {
        color: "#F8FAFC",
        isVisible: true,
      },
      poet: {
        color: "#FEFAF6",
        isVisible: true,
      },
      philosopher: {
        color: "#BCCCDC",
        isVisible: true,
      },
      mathematician: {
        color: "#9AA6B2",
        isVisible: true,
      },
      polymath: {
        color: "#D9EAFD",
        isVisible: true,
      },
      artist: {
        color: "#EADBC8",
        isVisible: true,
      },
      astronomer: {
        color: "#BCCCDC",
        isVisible: true,
      },
      scientist: {
        color: "#9AA6B2",
        isVisible: true,
      },
      playwright: {
        color: "#FEFAF6",
        isVisible: true,
      },
      writer: {
        color: "#F8FAFC",
        isVisible: true,
      },
    },
  },
  edgeConfig: {
    tags: {},
    types: {
      contributed: {
        color: "#DAC0A3",
        isVisible: true,
      },
      "within the field of": {
        color: "#BCCCDC",
        isVisible: true,
      },
      "published in": {
        color: "#9AA6B2",
        isVisible: true,
      },
      "described as": {
        color: "#D9EAFD",
        isVisible: true,
      },
      "subcategory of": {
        color: "#EADBC8",
        isVisible: true,
      },
    },
  },
  mode: "type",
};

export type MajorWork = {
  name: string;
  field: string;
  year?: number;
  description?: string;
};

export type Person = {
  name: string;
  type: PersonType;
  majorWorks: MajorWork[];
};

export type Field = {
  name: string;
  parentField: string;
};

// Data Collections
export const people: Person[] = [
  // Ancient Greeks
  {
    name: "Homer",
    type: PersonType.Poet,
    majorWorks: [
      {
        name: "The Iliad",
        field: "Literature",
        year: -750,
        description: "Epic poem set during the Trojan War",
      },
      {
        name: "The Odyssey",
        field: "Literature",
        year: -700,
        description: "Epic poem following the journey of Odysseus",
      },
    ],
  },
  {
    name: "Socrates",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Apology",
        field: "Philosophy",
        year: -399,
        description: "Defense speech by Socrates",
      },
      {
        name: "Crito",
        field: "Philosophy",
        year: -399,
        description: "Dialogue between Socrates and Crito",
      },
      {
        name: "Phaedo",
        field: "Philosophy",
        year: -399,
        description: "Dialogue on the immortality of the soul",
      },
    ],
  },
  {
    name: "Plato",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Republic",
        field: "Philosophy",
        year: -380,
        description: "Dialogue on justice and the ideal state",
      },
      {
        name: "The Symposium",
        field: "Philosophy",
        year: -385,
        description: "Dialogue on love",
      },
      {
        name: "Phaedrus",
        field: "Philosophy",
        year: -370,
        description: "Dialogue on love and rhetoric",
      },
    ],
  },
  {
    name: "Aristotle",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Nicomachean Ethics",
        field: "Philosophy",
        year: -340,
        description: "Treatise on ethics and moral philosophy",
      },
      {
        name: "Metaphysics",
        field: "Philosophy",
        year: -330,
        description: "Treatise on the nature of reality",
      },
      {
        name: "Politics",
        field: "Philosophy",
        year: -350,
        description: "Treatise on political theory",
      },
    ],
  },
  {
    name: "Euclid",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Elements",
        field: "Geometry",
        year: -300,
        description: "Treatise on geometry",
      },
      {
        name: "Optics",
        field: "Mathematics",
        year: -300,
        description: "Work on the theory of vision",
      },
      {
        name: "Data",
        field: "Mathematics",
        year: -300,
        description: "Collection of geometrical theorems",
      },
    ],
  },
  {
    name: "Pythagoras",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Pythagorean Theorem",
        field: "Geometry",
        year: -530,
        description: "Theorem on right-angled triangles",
      },
      {
        name: "Musica universalis",
        field: "Mathematics",
        year: -500,
        description: "Theory of harmony and proportions",
      },
      {
        name: "Pythagoreanism",
        field: "Philosophy",
        year: -500,
        description: "Philosophical and religious teachings",
      },
    ],
  },
  // Middle Ages
  {
    name: "Saint Augustine",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Confessions",
        field: "Philosophy",
        year: 400,
        description: "Autobiographical work",
      },
      {
        name: "City of God",
        field: "Philosophy",
        year: 426,
        description: "Work on Christian philosophy",
      },
      {
        name: "On Christian Doctrine",
        field: "Philosophy",
        year: 397,
        description: "Treatise on Christian teaching",
      },
    ],
  },
  {
    name: "Thomas Aquinas",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Summa Theologica",
        field: "Philosophy",
        year: 1274,
        description: "Comprehensive work on theology",
      },
      {
        name: "Summa Contra Gentiles",
        field: "Philosophy",
        year: 1264,
        description: "Apologetic work",
      },
      {
        name: "On Being and Essence",
        field: "Philosophy",
        year: 1256,
        description: "Treatise on metaphysics",
      },
    ],
  },
  // Renaissance
  {
    name: "Leonardo da Vinci",
    type: PersonType.Polymath,
    majorWorks: [
      {
        name: "Vitruvian Man",
        field: "Art",
        year: 1490,
        description: "Drawing of the ideal human proportions",
      },
      {
        name: "The Last Supper",
        field: "Art",
        year: 1498,
        description: "Mural painting of the Last Supper",
      },
      {
        name: "Mona Lisa",
        field: "Art",
        year: 1503,
        description: "Portrait painting",
      },
    ],
  },
  {
    name: "Michelangelo",
    type: PersonType.Artist,
    majorWorks: [
      {
        name: "David",
        field: "Art",
        year: 1504,
        description: "Sculpture of David",
      },
      {
        name: "Sistine Chapel ceiling",
        field: "Art",
        year: 1512,
        description: "Fresco painting on the ceiling of the Sistine Chapel",
      },
      {
        name: "The Last Judgment",
        field: "Art",
        year: 1541,
        description: "Fresco painting in the Sistine Chapel",
      },
    ],
  },
  {
    name: "Nicolaus Copernicus",
    type: PersonType.Astronomer,
    majorWorks: [
      {
        name: "On the Revolutions of the Heavenly Spheres",
        field: "Astronomy",
        year: 1543,
        description: "Work on heliocentric theory",
      },
      {
        name: "Commentariolus",
        field: "Astronomy",
        year: 1514,
        description: "Manuscript on heliocentric theory",
      },
      {
        name: "De revolutionibus orbium coelestium",
        field: "Astronomy",
        year: 1543,
        description: "Treatise on heliocentric theory",
      },
    ],
  },
  {
    name: "Johannes Kepler",
    type: PersonType.Astronomer,
    majorWorks: [
      {
        name: "Kepler's Laws of Planetary Motion",
        field: "Astronomy",
        year: 1609,
        description: "Laws of planetary motion",
      },
      {
        name: "Astronomia nova",
        field: "Astronomy",
        year: 1609,
        description: "Work on planetary motion",
      },
      {
        name: "Harmonices Mundi",
        field: "Astronomy",
        year: 1619,
        description: "Work on the harmony of the world",
      },
    ],
  },
  {
    name: "Galileo Galilei",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Dialogue Concerning the Two Chief World Systems",
        field: "Physics",
        year: 1632,
        description: "Dialogue on heliocentrism",
      },
      {
        name: "Sidereus Nuncius",
        field: "Astronomy",
        year: 1610,
        description: "Work on astronomical observations",
      },
      {
        name: "Two New Sciences",
        field: "Physics",
        year: 1638,
        description: "Work on kinematics and strength of materials",
      },
    ],
  },
  {
    name: "Rene Descartes",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Meditations on First Philosophy",
        field: "Philosophy",
        year: 1641,
        description: "Philosophical treatise",
      },
      {
        name: "Discourse on the Method",
        field: "Philosophy",
        year: 1637,
        description: "Philosophical and autobiographical treatise",
      },
      {
        name: "Principles of Philosophy",
        field: "Philosophy",
        year: 1644,
        description: "Philosophical treatise",
      },
    ],
  },
  {
    name: "Francis Bacon",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Novum Organum",
        field: "Philosophy",
        year: 1620,
        description: "Work on scientific method",
      },
      {
        name: "The Advancement of Learning",
        field: "Philosophy",
        year: 1605,
        description: "Work on the philosophy of science",
      },
      {
        name: "The New Atlantis",
        field: "Philosophy",
        year: 1627,
        description: "Utopian novel",
      },
    ],
  },
  {
    name: "William Shakespeare",
    type: PersonType.Playwright,
    majorWorks: [
      {
        name: "Hamlet",
        field: "Literature",
        year: 1600,
        description: "Tragedy play",
      },
      {
        name: "Macbeth",
        field: "Literature",
        year: 1606,
        description: "Tragedy play",
      },
      {
        name: "Romeo and Juliet",
        field: "Literature",
        year: 1597,
        description: "Tragedy play",
      },
    ],
  },
  {
    name: "Dante Alighieri",
    type: PersonType.Poet,
    majorWorks: [
      {
        name: "Divine Comedy",
        field: "Literature",
        year: 1320,
        description: "Epic poem",
      },
      {
        name: "La Vita Nuova",
        field: "Literature",
        year: 1294,
        description: "Poetry collection",
      },
      {
        name: "De Monarchia",
        field: "Literature",
        year: 1313,
        description: "Political treatise",
      },
    ],
  },
  {
    name: "Thomas More",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Utopia",
        field: "Philosophy",
        year: 1516,
        description: "Political philosophy work",
      },
      {
        name: "The History of King Richard III",
        field: "History",
        year: 1543,
        description: "Historical work",
      },
      {
        name: "Dialogue of Comfort Against Tribulation",
        field: "Philosophy",
        year: 1534,
        description: "Philosophical dialogue",
      },
    ],
  },
  {
    name: "Niccolo Machiavelli",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Prince",
        field: "Political Science",
        year: 1532,
        description: "Political treatise",
      },
      {
        name: "Discourses on Livy",
        field: "Political Science",
        year: 1531,
        description: "Political treatise",
      },
      {
        name: "The Art of War",
        field: "Political Science",
        year: 1521,
        description: "Military treatise",
      },
    ],
  },
  {
    name: "Giordano Bruno",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "On the Infinite Universe and Worlds",
        field: "Philosophy",
        year: 1584,
        description: "Philosophical work",
      },
      {
        name: "The Ash Wednesday Supper",
        field: "Philosophy",
        year: 1584,
        description: "Philosophical dialogue",
      },
      {
        name: "The Expulsion of the Triumphant Beast",
        field: "Philosophy",
        year: 1584,
        description: "Philosophical dialogue",
      },
    ],
  },
  {
    name: "Erasmus",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "In Praise of Folly",
        field: "Philosophy",
        year: 1511,
        description: "Satirical work",
      },
      {
        name: "Adagia",
        field: "Philosophy",
        year: 1500,
        description: "Collection of proverbs",
      },
      {
        name: "The Education of a Christian Prince",
        field: "Philosophy",
        year: 1516,
        description: "Political treatise",
      },
    ],
  },
  {
    name: "Pico della Mirandola",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Oration on the Dignity of Man",
        field: "Philosophy",
        year: 1486,
        description: "Philosophical oration",
      },
      {
        name: "900 Theses",
        field: "Philosophy",
        year: 1486,
        description: "Collection of philosophical theses",
      },
      {
        name: "Heptaplus",
        field: "Philosophy",
        year: 1489,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Giovanni Boccaccio",
    type: PersonType.Writer,
    majorWorks: [
      {
        name: "The Decameron",
        field: "Literature",
        year: 1353,
        description: "Collection of novellas",
      },
      {
        name: "On Famous Women",
        field: "Literature",
        year: 1361,
        description: "Collection of biographies",
      },
      {
        name: "The Elegy of Lady Fiammetta",
        field: "Literature",
        year: 1343,
        description: "Novel",
      },
    ],
  },
  {
    name: "Petrarch",
    type: PersonType.Poet,
    majorWorks: [
      {
        name: "Canzoniere",
        field: "Literature",
        year: 1374,
        description: "Collection of poems",
      },
      {
        name: "Africa",
        field: "Literature",
        year: 1343,
        description: "Epic poem",
      },
      {
        name: "Secretum",
        field: "Literature",
        year: 1347,
        description: "Philosophical dialogue",
      },
    ],
  },
  // Enlightenment
  {
    name: "Isaac Newton",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Principia Mathematica",
        field: "Physics",
        year: 1687,
        description: "Work on classical mechanics",
      },
      {
        name: "Opticks",
        field: "Physics",
        year: 1704,
        description: "Work on optics",
      },
      {
        name: "The Method of Fluxions",
        field: "Mathematics",
        year: 1671,
        description: "Work on calculus",
      },
    ],
  },
  {
    name: "John Locke",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Essay Concerning Human Understanding",
        field: "Epistemology",
        year: 1689,
        description: "Work on the theory of knowledge",
      },
      {
        name: "Two Treatises of Government",
        field: "Political Science",
        year: 1689,
        description: "Political treatise",
      },
      {
        name: "Some Thoughts Concerning Education",
        field: "Philosophy",
        year: 1693,
        description: "Work on education",
      },
    ],
  },
  {
    name: "David Hume",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "A Treatise of Human Nature",
        field: "Philosophy",
        year: 1739,
        description: "Philosophical work",
      },
      {
        name: "An Enquiry Concerning Human Understanding",
        field: "Philosophy",
        year: 1748,
        description: "Philosophical work",
      },
      {
        name: "Dialogues Concerning Natural Religion",
        field: "Philosophy",
        year: 1779,
        description: "Philosophical dialogue",
      },
    ],
  },
  {
    name: "Immanuel Kant",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Critique of Pure Reason",
        field: "Philosophy",
        year: 1781,
        description: "Philosophical work",
      },
      {
        name: "Critique of Practical Reason",
        field: "Philosophy",
        year: 1788,
        description: "Philosophical work",
      },
      {
        name: "Critique of Judgment",
        field: "Philosophy",
        year: 1790,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Jean-Jacques Rousseau",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Social Contract",
        field: "Political Science",
        year: 1762,
        description: "Political treatise",
      },
      {
        name: "Emile, or On Education",
        field: "Philosophy",
        year: 1762,
        description: "Work on education",
      },
      {
        name: "Discourse on the Origin and Basis of Inequality Among Men",
        field: "Philosophy",
        year: 1755,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Voltaire",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Candide",
        field: "Literature",
        year: 1759,
        description: "Satirical novella",
      },
      {
        name: "Letters on the English",
        field: "Philosophy",
        year: 1733,
        description: "Collection of essays",
      },
      {
        name: "Treatise on Tolerance",
        field: "Philosophy",
        year: 1763,
        description: "Philosophical work",
      },
    ],
  },
  // 19th Century
  {
    name: "Georg Wilhelm Friedrich Hegel",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Phenomenology of Spirit",
        field: "Philosophy",
        year: 1807,
        description: "Philosophical work",
      },
      {
        name: "Science of Logic",
        field: "Philosophy",
        year: 1812,
        description: "Philosophical work",
      },
      {
        name: "Elements of the Philosophy of Right",
        field: "Philosophy",
        year: 1820,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Arthur Schopenhauer",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The World as Will and Representation",
        field: "Philosophy",
        year: 1818,
        description: "Philosophical work",
      },
      {
        name: "On the Fourfold Root of the Principle of Sufficient Reason",
        field: "Philosophy",
        year: 1813,
        description: "Philosophical work",
      },
      {
        name: "Parerga and Paralipomena",
        field: "Philosophy",
        year: 1851,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Søren Kierkegaard",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Fear and Trembling",
        field: "Philosophy",
        year: 1843,
        description: "Philosophical work",
      },
      {
        name: "Either/Or",
        field: "Philosophy",
        year: 1843,
        description: "Philosophical work",
      },
      {
        name: "The Sickness Unto Death",
        field: "Philosophy",
        year: 1849,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Friedrich Nietzsche",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Thus Spoke Zarathustra",
        field: "Philosophy",
        year: 1883,
        description: "Philosophical novel",
      },
      {
        name: "Beyond Good and Evil",
        field: "Philosophy",
        year: 1886,
        description: "Philosophical work",
      },
      {
        name: "The Birth of Tragedy",
        field: "Philosophy",
        year: 1872,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Karl Marx",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Das Kapital",
        field: "Philosophy",
        year: 1867,
        description: "Political economy work",
      },
      {
        name: "The Communist Manifesto",
        field: "Philosophy",
        year: 1848,
        description: "Political pamphlet",
      },
      {
        name: "The German Ideology",
        field: "Philosophy",
        year: 1846,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Friedrich Engels",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Condition of the Working Class in England",
        field: "Philosophy",
        year: 1845,
        description: "Sociological work",
      },
      {
        name: "Socialism: Utopian and Scientific",
        field: "Philosophy",
        year: 1880,
        description: "Political work",
      },
      {
        name: "The Origin of the Family, Private Property and the State",
        field: "Philosophy",
        year: 1884,
        description: "Sociological work",
      },
    ],
  },
  {
    name: "John Stuart Mill",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "On Liberty",
        field: "Philosophy",
        year: 1859,
        description: "Philosophical work",
      },
      {
        name: "Utilitarianism",
        field: "Philosophy",
        year: 1863,
        description: "Philosophical work",
      },
      {
        name: "The Subjection of Women",
        field: "Philosophy",
        year: 1869,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Jeremy Bentham",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "An Introduction to the Principles of Morals and Legislation",
        field: "Philosophy",
        year: 1789,
        description: "Philosophical work",
      },
      {
        name: "The Panopticon Writings",
        field: "Philosophy",
        year: 1791,
        description: "Philosophical work",
      },
      {
        name: "A Fragment on Government",
        field: "Philosophy",
        year: 1776,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "William James",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Varieties of Religious Experience",
        field: "Philosophy",
        year: 1902,
        description: "Philosophical work",
      },
      {
        name: "Pragmatism",
        field: "Philosophy",
        year: 1907,
        description: "Philosophical work",
      },
      {
        name: "The Principles of Psychology",
        field: "Philosophy",
        year: 1890,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Alfred North Whitehead",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Process and Reality",
        field: "Philosophy",
        year: 1929,
        description: "Philosophical work",
      },
      {
        name: "Science and the Modern World",
        field: "Philosophy",
        year: 1925,
        description: "Philosophical work",
      },
      {
        name: "Adventures of Ideas",
        field: "Philosophy",
        year: 1933,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Charles Darwin",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Origin of Species",
        field: "Evolutionary Biology",
        year: 1859,
        description: "Work on evolutionary biology",
      },
      {
        name: "The Descent of Man",
        field: "Evolutionary Biology",
        year: 1871,
        description: "Work on human evolution",
      },
      {
        name: "The Expression of the Emotions in Man and Animals",
        field: "Biology",
        year: 1872,
        description: "Work on emotions",
      },
    ],
  },
  {
    name: "Gregor Mendel",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Laws of Inheritance",
        field: "Genetics",
        year: 1865,
        description: "Work on inheritance",
      },
      {
        name: "Experiments on Plant Hybridization",
        field: "Genetics",
        year: 1866,
        description: "Work on plant hybridization",
      },
      {
        name: "Mendelian Inheritance",
        field: "Genetics",
        year: 1865,
        description: "Work on inheritance",
      },
    ],
  },
  {
    name: "James Clerk Maxwell",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Maxwell's Equations",
        field: "Physics",
        year: 1865,
        description: "Work on electromagnetism",
      },
      {
        name: "A Treatise on Electricity and Magnetism",
        field: "Physics",
        year: 1873,
        description: "Work on electromagnetism",
      },
      {
        name: "Theory of Heat",
        field: "Physics",
        year: 1871,
        description: "Work on thermodynamics",
      },
    ],
  },
  {
    name: "Michael Faraday",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Laws of Electromagnetism",
        field: "Physics",
        year: 1831,
        description: "Work on electromagnetism",
      },
      {
        name: "Faraday's Law of Induction",
        field: "Physics",
        year: 1831,
        description: "Work on electromagnetic induction",
      },
      {
        name: "Electrolysis",
        field: "Chemistry",
        year: 1834,
        description: "Work on electrolysis",
      },
    ],
  },
  {
    name: "Antoine Lavoisier",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Periodic Table",
        field: "Chemistry",
        year: 1789,
        description: "Work on the periodic table",
      },
      {
        name: "Elementary Treatise of Chemistry",
        field: "Chemistry",
        year: 1789,
        description: "Work on chemistry",
      },
      {
        name: "Law of Conservation of Mass",
        field: "Chemistry",
        year: 1789,
        description: "Work on the conservation of mass",
      },
    ],
  },
  {
    name: "Louis Pasteur",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Germ Theory",
        field: "Biology",
        year: 1861,
        description: "Work on germ theory",
      },
      {
        name: "Pasteurization",
        field: "Biology",
        year: 1864,
        description: "Work on pasteurization",
      },
      {
        name: "Vaccination",
        field: "Biology",
        year: 1885,
        description: "Work on vaccination",
      },
    ],
  },
  {
    name: "Fibonacci",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Fibonacci Sequence",
        field: "Number Theory",
        year: 1202,
        description: "Work on the Fibonacci sequence",
      },
      {
        name: "Liber Abaci",
        field: "Mathematics",
        year: 1202,
        description: "Work on mathematics",
      },
      {
        name: "Practica Geometriae",
        field: "Mathematics",
        year: 1220,
        description: "Work on geometry",
      },
    ],
  },
  // 20th Century
  {
    name: "Albert Einstein",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Theory of Relativity",
        field: "Physics",
        year: 1905,
        description: "Work on relativity",
      },
      {
        name: "Photoelectric Effect",
        field: "Physics",
        year: 1905,
        description: "Work on the photoelectric effect",
      },
      {
        name: "Brownian Motion",
        field: "Physics",
        year: 1905,
        description: "Work on Brownian motion",
      },
    ],
  },
  {
    name: "Niels Bohr",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Bohr Model",
        field: "Quantum Mechanics",
        year: 1913,
        description: "Work on the Bohr model",
      },
      {
        name: "Complementarity Principle",
        field: "Quantum Mechanics",
        year: 1928,
        description: "Work on complementarity",
      },
      {
        name: "Quantum Theory",
        field: "Quantum Mechanics",
        year: 1924,
        description: "Work on quantum theory",
      },
    ],
  },
  {
    name: "Richard Feynman",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Quantum Electrodynamics",
        field: "Quantum Mechanics",
        year: 1948,
        description: "Work on quantum electrodynamics",
      },
      {
        name: "Feynman Diagrams",
        field: "Physics",
        year: 1948,
        description: "Work on Feynman diagrams",
      },
      {
        name: "The Feynman Lectures on Physics",
        field: "Physics",
        year: 1964,
        description: "Work on physics",
      },
    ],
  },
  {
    name: "James Clerk Maxwell",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Maxwell's Equations",
        field: "Physics",
        year: 1865,
        description: "Work on electromagnetism",
      },
      {
        name: "A Treatise on Electricity and Magnetism",
        field: "Physics",
        year: 1873,
        description: "Work on electromagnetism",
      },
      {
        name: "Theory of Heat",
        field: "Physics",
        year: 1871,
        description: "Work on thermodynamics",
      },
    ],
  },
  {
    name: "Aristotle",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Nicomachean Ethics",
        field: "Philosophy",
        year: -340,
        description: "Treatise on ethics and moral philosophy",
      },
      {
        name: "Metaphysics",
        field: "Philosophy",
        year: -330,
        description: "Treatise on the nature of reality",
      },
      {
        name: "Politics",
        field: "Philosophy",
        year: -350,
        description: "Treatise on political theory",
      },
    ],
  },
  {
    name: "Plato",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Republic",
        field: "Philosophy",
        year: -380,
        description: "Dialogue on justice and the ideal state",
      },
      {
        name: "The Symposium",
        field: "Philosophy",
        year: -385,
        description: "Dialogue on love",
      },
      {
        name: "Phaedrus",
        field: "Philosophy",
        year: -370,
        description: "Dialogue on love and rhetoric",
      },
    ],
  },
  {
    name: "Socrates",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Apology",
        field: "Philosophy",
        year: -399,
        description: "Defense speech by Socrates",
      },
      {
        name: "Crito",
        field: "Philosophy",
        year: -399,
        description: "Dialogue between Socrates and Crito",
      },
      {
        name: "Phaedo",
        field: "Philosophy",
        year: -399,
        description: "Dialogue on the immortality of the soul",
      },
    ],
  },
  {
    name: "Immanuel Kant",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Critique of Pure Reason",
        field: "Philosophy",
        year: 1781,
        description: "Philosophical work",
      },
      {
        name: "Critique of Practical Reason",
        field: "Philosophy",
        year: 1788,
        description: "Philosophical work",
      },
      {
        name: "Critique of Judgment",
        field: "Philosophy",
        year: 1790,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "René Descartes",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Meditations",
        field: "Philosophy",
        year: 1641,
        description: "Philosophical treatise",
      },
      {
        name: "Discourse on the Method",
        field: "Philosophy",
        year: 1637,
        description: "Philosophical and autobiographical treatise",
      },
      {
        name: "Principles of Philosophy",
        field: "Philosophy",
        year: 1644,
        description: "Philosophical treatise",
      },
    ],
  },
  {
    name: "Friedrich Nietzsche",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Thus Spoke Zarathustra",
        field: "Philosophy",
        year: 1883,
        description: "Philosophical novel",
      },
      {
        name: "Beyond Good and Evil",
        field: "Philosophy",
        year: 1886,
        description: "Philosophical work",
      },
      {
        name: "The Birth of Tragedy",
        field: "Philosophy",
        year: 1872,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "John Locke",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Essay Concerning Human Understanding",
        field: "Epistemology",
        year: 1689,
        description: "Work on the theory of knowledge",
      },
      {
        name: "Two Treatises of Government",
        field: "Political Science",
        year: 1689,
        description: "Political treatise",
      },
      {
        name: "Some Thoughts Concerning Education",
        field: "Philosophy",
        year: 1693,
        description: "Work on education",
      },
    ],
  },
  {
    name: "David Hume",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "A Treatise of Human Nature",
        field: "Philosophy",
        year: 1739,
        description: "Philosophical work",
      },
      {
        name: "An Enquiry Concerning Human Understanding",
        field: "Philosophy",
        year: 1748,
        description: "Philosophical work",
      },
      {
        name: "Dialogues Concerning Natural Religion",
        field: "Philosophy",
        year: 1779,
        description: "Philosophical dialogue",
      },
    ],
  },
  {
    name: "Bertrand Russell",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Principia Mathematica (Russell)",
        field: "Logic",
        year: 1910,
        description: "Work on logic",
      },
      {
        name: "The Problems of Philosophy",
        field: "Philosophy",
        year: 1912,
        description: "Philosophical work",
      },
      {
        name: "A History of Western Philosophy",
        field: "Philosophy",
        year: 1945,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Ludwig Wittgenstein",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Tractatus Logico-Philosophicus",
        field: "Logic",
        year: 1921,
        description: "Philosophical work",
      },
      {
        name: "Philosophical Investigations",
        field: "Philosophy",
        year: 1953,
        description: "Philosophical work",
      },
      {
        name: "On Certainty",
        field: "Philosophy",
        year: 1969,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Fibonacci",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Fibonacci Sequence",
        field: "Number Theory",
        year: 1202,
        description: "Work on the Fibonacci sequence",
      },
      {
        name: "Liber Abaci",
        field: "Mathematics",
        year: 1202,
        description: "Work on mathematics",
      },
      {
        name: "Practica Geometriae",
        field: "Mathematics",
        year: 1220,
        description: "Work on geometry",
      },
    ],
  },
  {
    name: "Bernhard Riemann",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Riemann Hypothesis",
        field: "Number Theory",
        year: 1859,
        description: "Work on the Riemann hypothesis",
      },
      {
        name: "Riemannian Geometry",
        field: "Mathematics",
        year: 1854,
        description: "Work on Riemannian geometry",
      },
      {
        name: "On the Hypotheses which lie at the Bases of Geometry",
        field: "Mathematics",
        year: 1854,
        description: "Work on geometry",
      },
    ],
  },
  {
    name: "Georg Cantor",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Set Theory",
        field: "Mathematics",
        year: 1874,
        description: "Work on set theory",
      },
      {
        name: "Cantor's Diagonal Argument",
        field: "Mathematics",
        year: 1891,
        description: "Work on set theory",
      },
      {
        name: "Transfinite Numbers",
        field: "Mathematics",
        year: 1895,
        description: "Work on transfinite numbers",
      },
    ],
  },
  {
    name: "Emmy Noether",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Noether's Theorem",
        field: "Physics",
        year: 1918,
        description: "Work on Noether's theorem",
      },
      {
        name: "Abstract Algebra",
        field: "Mathematics",
        year: 1921,
        description: "Work on abstract algebra",
      },
      {
        name: "Theory of Ideals in Ring Domains",
        field: "Mathematics",
        year: 1921,
        description: "Work on ring theory",
      },
    ],
  },
  {
    name: "Henri Poincaré",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Poincaré Conjecture",
        field: "Mathematics",
        year: 1904,
        description: "Work on the Poincaré conjecture",
      },
      {
        name: "Science and Hypothesis",
        field: "Philosophy",
        year: 1902,
        description: "Philosophical work",
      },
      {
        name: "The Value of Science",
        field: "Philosophy",
        year: 1905,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "John von Neumann",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Game Theory",
        field: "Mathematics",
        year: 1944,
        description: "Work on game theory",
      },
      {
        name: "Quantum Mechanics",
        field: "Physics",
        year: 1932,
        description: "Work on quantum mechanics",
      },
      {
        name: "Mathematical Foundations of Quantum Mechanics",
        field: "Physics",
        year: 1932,
        description: "Work on quantum mechanics",
      },
    ],
  },
  {
    name: "David Hilbert",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Hilbert's Problems",
        field: "Mathematics",
        year: 1900,
        description: "Work on Hilbert's problems",
      },
      {
        name: "Foundations of Geometry",
        field: "Mathematics",
        year: 1899,
        description: "Work on geometry",
      },
      {
        name: "Theory of Algebraic Invariants",
        field: "Mathematics",
        year: 1897,
        description: "Work on algebra",
      },
    ],
  },
  {
    name: "Srinivasa Ramanujan",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Ramanujan's Notebooks",
        field: "Mathematics",
        year: 1919,
        description: "Work on mathematics",
      },
      {
        name: "Ramanujan Prime",
        field: "Mathematics",
        year: 1919,
        description: "Work on prime numbers",
      },
      {
        name: "Ramanujan Conjecture",
        field: "Mathematics",
        year: 1916,
        description: "Work on number theory",
      },
    ],
  },
  {
    name: "Paul Erdős",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Erdős Number",
        field: "Mathematics",
        year: 1969,
        description: "Work on the Erdős number",
      },
      {
        name: "Probabilistic Method",
        field: "Mathematics",
        year: 1947,
        description: "Work on the probabilistic method",
      },
      {
        name: "Erdős–Kac Theorem",
        field: "Mathematics",
        year: 1940,
        description: "Work on number theory",
      },
    ],
  },
  {
    name: "Kurt Gödel",
    type: PersonType.Mathematician,
    majorWorks: [
      {
        name: "Gödel's Incompleteness Theorems",
        field: "Mathematics",
        year: 1931,
        description: "Work on incompleteness theorems",
      },
      {
        name: "Consistency of the Axiom of Choice",
        field: "Mathematics",
        year: 1940,
        description: "Work on set theory",
      },
      {
        name: "Gödel Metric",
        field: "Mathematics",
        year: 1949,
        description: "Work on relativity",
      },
    ],
  },
  {
    name: "Charles Darwin",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Origin of Species",
        field: "Evolutionary Biology",
        year: 1859,
        description: "Work on evolutionary biology",
      },
      {
        name: "The Descent of Man",
        field: "Evolutionary Biology",
        year: 1871,
        description: "Work on human evolution",
      },
      {
        name: "The Expression of the Emotions in Man and Animals",
        field: "Biology",
        year: 1872,
        description: "Work on emotions",
      },
    ],
  },
  {
    name: "Max Planck",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Quantum Theory",
        field: "Quantum Mechanics",
        year: 1900,
        description: "Work on quantum theory",
      },
      {
        name: "Planck's Law",
        field: "Physics",
        year: 1900,
        description: "Work on black-body radiation",
      },
      {
        name: "Thermodynamics",
        field: "Physics",
        year: 1897,
        description: "Work on thermodynamics",
      },
    ],
  },
  {
    name: "Werner Heisenberg",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Uncertainty Principle",
        field: "Quantum Mechanics",
        year: 1927,
        description: "Work on the uncertainty principle",
      },
      {
        name: "Matrix Mechanics",
        field: "Physics",
        year: 1925,
        description: "Work on matrix mechanics",
      },
      {
        name: "Physics and Philosophy",
        field: "Philosophy",
        year: 1958,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Erwin Schrödinger",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Schrödinger Equation",
        field: "Quantum Mechanics",
        year: 1926,
        description: "Work on the Schrödinger equation",
      },
      {
        name: "What is Life?",
        field: "Biology",
        year: 1944,
        description: "Philosophical work",
      },
      {
        name: "Schrödinger's Cat",
        field: "Physics",
        year: 1935,
        description: "Thought experiment",
      },
    ],
  },
  {
    name: "Paul Dirac",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Dirac Equation",
        field: "Quantum Mechanics",
        year: 1928,
        description: "Work on the Dirac equation",
      },
      {
        name: "Principles of Quantum Mechanics",
        field: "Physics",
        year: 1930,
        description: "Work on quantum mechanics",
      },
      {
        name: "Dirac Delta Function",
        field: "Mathematics",
        year: 1930,
        description: "Work on the delta function",
      },
    ],
  },
  {
    name: "Louis Pasteur",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Germ Theory",
        field: "Biology",
        year: 1861,
        description: "Work on germ theory",
      },
      {
        name: "Pasteurization",
        field: "Biology",
        year: 1864,
        description: "Work on pasteurization",
      },
      {
        name: "Vaccination",
        field: "Biology",
        year: 1885,
        description: "Work on vaccination",
      },
    ],
  },
  {
    name: "Michael Faraday",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Laws of Electromagnetism",
        field: "Physics",
        year: 1831,
        description: "Work on electromagnetism",
      },
      {
        name: "Faraday's Law of Induction",
        field: "Physics",
        year: 1831,
        description: "Work on electromagnetic induction",
      },
      {
        name: "Electrolysis",
        field: "Chemistry",
        year: 1834,
        description: "Work on electrolysis",
      },
    ],
  },
  {
    name: "Antoine Lavoisier",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Periodic Table",
        field: "Chemistry",
        year: 1789,
        description: "Work on the periodic table",
      },
      {
        name: "Elementary Treatise of Chemistry",
        field: "Chemistry",
        year: 1789,
        description: "Work on chemistry",
      },
      {
        name: "Law of Conservation of Mass",
        field: "Chemistry",
        year: 1789,
        description: "Work on the conservation of mass",
      },
    ],
  },
  {
    name: "Gregor Mendel",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Laws of Inheritance",
        field: "Genetics",
        year: 1865,
        description: "Work on inheritance",
      },
      {
        name: "Experiments on Plant Hybridization",
        field: "Genetics",
        year: 1866,
        description: "Work on plant hybridization",
      },
      {
        name: "Mendelian Inheritance",
        field: "Genetics",
        year: 1865,
        description: "Work on inheritance",
      },
    ],
  },
  {
    name: "Linus Pauling",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "The Nature of the Chemical Bond",
        field: "Chemistry",
        year: 1939,
        description: "Work on chemical bonding",
      },
      {
        name: "Vitamin C and the Common Cold",
        field: "Biochemistry",
        year: 1970,
        description: "Work on vitamin C",
      },
      {
        name: "Sickle Cell Anemia",
        field: "Biology",
        year: 1949,
        description: "Work on sickle cell anemia",
      },
    ],
  },
  // Additional philosophers
  {
    name: "Thomas Aquinas",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Summa Theologica",
        field: "Philosophy",
        year: 1274,
        description: "Comprehensive work on theology",
      },
      {
        name: "Summa Contra Gentiles",
        field: "Philosophy",
        year: 1264,
        description: "Apologetic work",
      },
      {
        name: "On Being and Essence",
        field: "Philosophy",
        year: 1256,
        description: "Treatise on metaphysics",
      },
    ],
  },
  {
    name: "Saint Augustine",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Confessions",
        field: "Philosophy",
        year: 400,
        description: "Autobiographical work",
      },
      {
        name: "City of God",
        field: "Philosophy",
        year: 426,
        description: "Work on Christian philosophy",
      },
      {
        name: "On Christian Doctrine",
        field: "Philosophy",
        year: 397,
        description: "Treatise on Christian teaching",
      },
    ],
  },
  {
    name: "Baruch Spinoza",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Ethics",
        field: "Philosophy",
        year: 1677,
        description: "Philosophical work",
      },
      {
        name: "Theological-Political Treatise",
        field: "Philosophy",
        year: 1670,
        description: "Philosophical work",
      },
      {
        name: "On the Improvement of the Understanding",
        field: "Philosophy",
        year: 1662,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Gottfried Wilhelm Leibniz",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Monadology",
        field: "Philosophy",
        year: 1714,
        description: "Philosophical work",
      },
      {
        name: "Discourse on Metaphysics",
        field: "Philosophy",
        year: 1686,
        description: "Philosophical work",
      },
      {
        name: "New Essays on Human Understanding",
        field: "Philosophy",
        year: 1704,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Georg Wilhelm Friedrich Hegel",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Phenomenology of Spirit",
        field: "Philosophy",
        year: 1807,
        description: "Philosophical work",
      },
      {
        name: "Science of Logic",
        field: "Philosophy",
        year: 1812,
        description: "Philosophical work",
      },
      {
        name: "Elements of the Philosophy of Right",
        field: "Philosophy",
        year: 1820,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Arthur Schopenhauer",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The World as Will and Representation",
        field: "Philosophy",
        year: 1818,
        description: "Philosophical work",
      },
      {
        name: "On the Fourfold Root of the Principle of Sufficient Reason",
        field: "Philosophy",
        year: 1813,
        description: "Philosophical work",
      },
      {
        name: "Parerga and Paralipomena",
        field: "Philosophy",
        year: 1851,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Søren Kierkegaard",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Fear and Trembling",
        field: "Philosophy",
        year: 1843,
        description: "Philosophical work",
      },
      {
        name: "Either/Or",
        field: "Philosophy",
        year: 1843,
        description: "Philosophical work",
      },
      {
        name: "The Sickness Unto Death",
        field: "Philosophy",
        year: 1849,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Jean-Paul Sartre",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Being and Nothingness",
        field: "Philosophy",
        year: 1943,
        description: "Philosophical work",
      },
      {
        name: "Nausea",
        field: "Philosophy",
        year: 1938,
        description: "Philosophical novel",
      },
      {
        name: "Existentialism is a Humanism",
        field: "Philosophy",
        year: 1946,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Simone de Beauvoir",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Second Sex",
        field: "Philosophy",
        year: 1949,
        description: "Philosophical work",
      },
      {
        name: "The Ethics of Ambiguity",
        field: "Philosophy",
        year: 1947,
        description: "Philosophical work",
      },
      {
        name: "Memoirs of a Dutiful Daughter",
        field: "Philosophy",
        year: 1958,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Martin Heidegger",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Being and Time",
        field: "Philosophy",
        year: 1927,
        description: "Philosophical work",
      },
      {
        name: "Introduction to Metaphysics",
        field: "Philosophy",
        year: 1953,
        description: "Philosophical work",
      },
      {
        name: "The Question Concerning Technology",
        field: "Philosophy",
        year: 1954,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Michel Foucault",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Discipline and Punish",
        field: "Philosophy",
        year: 1975,
        description: "Philosophical work",
      },
      {
        name: "The History of Sexuality",
        field: "Philosophy",
        year: 1976,
        description: "Philosophical work",
      },
      {
        name: "Madness and Civilization",
        field: "Philosophy",
        year: 1961,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Jacques Derrida",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Of Grammatology",
        field: "Philosophy",
        year: 1967,
        description: "Philosophical work",
      },
      {
        name: "Writing and Difference",
        field: "Philosophy",
        year: 1967,
        description: "Philosophical work",
      },
      {
        name: "Speech and Phenomena",
        field: "Philosophy",
        year: 1967,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Ludwig Feuerbach",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Essence of Christianity",
        field: "Philosophy",
        year: 1841,
        description: "Philosophical work",
      },
      {
        name: "Principles of the Philosophy of the Future",
        field: "Philosophy",
        year: 1843,
        description: "Philosophical work",
      },
      {
        name: "The Essence of Faith According to Luther",
        field: "Philosophy",
        year: 1844,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Karl Marx",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Das Kapital",
        field: "Philosophy",
        year: 1867,
        description: "Political economy work",
      },
      {
        name: "The Communist Manifesto",
        field: "Philosophy",
        year: 1848,
        description: "Political pamphlet",
      },
      {
        name: "The German Ideology",
        field: "Philosophy",
        year: 1846,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Friedrich Engels",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Condition of the Working Class in England",
        field: "Philosophy",
        year: 1845,
        description: "Sociological work",
      },
      {
        name: "Socialism: Utopian and Scientific",
        field: "Philosophy",
        year: 1880,
        description: "Political work",
      },
      {
        name: "The Origin of the Family, Private Property and the State",
        field: "Philosophy",
        year: 1884,
        description: "Sociological work",
      },
    ],
  },
  {
    name: "John Stuart Mill",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "On Liberty",
        field: "Philosophy",
        year: 1859,
        description: "Philosophical work",
      },
      {
        name: "Utilitarianism",
        field: "Philosophy",
        year: 1863,
        description: "Philosophical work",
      },
      {
        name: "The Subjection of Women",
        field: "Philosophy",
        year: 1869,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Jeremy Bentham",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "An Introduction to the Principles of Morals and Legislation",
        field: "Philosophy",
        year: 1789,
        description: "Philosophical work",
      },
      {
        name: "The Panopticon Writings",
        field: "Philosophy",
        year: 1791,
        description: "Philosophical work",
      },
      {
        name: "A Fragment on Government",
        field: "Philosophy",
        year: 1776,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "William James",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Varieties of Religious Experience",
        field: "Philosophy",
        year: 1902,
        description: "Philosophical work",
      },
      {
        name: "Pragmatism",
        field: "Philosophy",
        year: 1907,
        description: "Philosophical work",
      },
      {
        name: "The Principles of Psychology",
        field: "Philosophy",
        year: 1890,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Alfred North Whitehead",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Process and Reality",
        field: "Philosophy",
        year: 1929,
        description: "Philosophical work",
      },
      {
        name: "Science and the Modern World",
        field: "Philosophy",
        year: 1925,
        description: "Philosophical work",
      },
      {
        name: "Adventures of Ideas",
        field: "Philosophy",
        year: 1933,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Hannah Arendt",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Human Condition",
        field: "Philosophy",
        year: 1958,
        description: "Philosophical work",
      },
      {
        name: "The Origins of Totalitarianism",
        field: "Philosophy",
        year: 1951,
        description: "Philosophical work",
      },
      {
        name: "Eichmann in Jerusalem",
        field: "Philosophy",
        year: 1963,
        description: "Philosophical work",
      },
    ],
  },
  // Additional ancient Greeks and Renaissance figures
  {
    name: "Socrates",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Apology",
        field: "Philosophy",
        year: -399,
        description: "Defense speech by Socrates",
      },
      {
        name: "Crito",
        field: "Philosophy",
        year: -399,
        description: "Dialogue between Socrates and Crito",
      },
      {
        name: "Phaedo",
        field: "Philosophy",
        year: -399,
        description: "Dialogue on the immortality of the soul",
      },
    ],
  },
  {
    name: "Plato",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Republic",
        field: "Philosophy",
        year: -380,
        description: "Dialogue on justice and the ideal state",
      },
      {
        name: "The Symposium",
        field: "Philosophy",
        year: -385,
        description: "Dialogue on love",
      },
      {
        name: "Phaedrus",
        field: "Philosophy",
        year: -370,
        description: "Dialogue on love and rhetoric",
      },
    ],
  },
  {
    name: "Aristotle",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Nicomachean Ethics",
        field: "Philosophy",
        year: -340,
        description: "Treatise on ethics and moral philosophy",
      },
      {
        name: "Metaphysics",
        field: "Philosophy",
        year: -330,
        description: "Treatise on the nature of reality",
      },
      {
        name: "Politics",
        field: "Philosophy",
        year: -350,
        description: "Treatise on political theory",
      },
    ],
  },
  {
    name: "Homer",
    type: PersonType.Poet,
    majorWorks: [
      {
        name: "The Iliad",
        field: "Literature",
        year: -750,
        description: "Epic poem set during the Trojan War",
      },
      {
        name: "The Odyssey",
        field: "Literature",
        year: -700,
        description: "Epic poem following the journey of Odysseus",
      },
    ],
  },
  {
    name: "Leonardo da Vinci",
    type: PersonType.Polymath,
    majorWorks: [
      {
        name: "Vitruvian Man",
        field: "Art",
        year: 1490,
        description: "Drawing of the ideal human proportions",
      },
      {
        name: "The Last Supper",
        field: "Art",
        year: 1498,
        description: "Mural painting of the Last Supper",
      },
      {
        name: "Mona Lisa",
        field: "Art",
        year: 1503,
        description: "Portrait painting",
      },
    ],
  },
  {
    name: "Michelangelo",
    type: PersonType.Artist,
    majorWorks: [
      {
        name: "David",
        field: "Art",
        year: 1504,
        description: "Sculpture of David",
      },
      {
        name: "Sistine Chapel ceiling",
        field: "Art",
        year: 1512,
        description: "Fresco painting on the ceiling of the Sistine Chapel",
      },
      {
        name: "The Last Judgment",
        field: "Art",
        year: 1541,
        description: "Fresco painting in the Sistine Chapel",
      },
    ],
  },
  {
    name: "Galileo Galilei",
    type: PersonType.Scientist,
    majorWorks: [
      {
        name: "Dialogue Concerning the Two Chief World Systems",
        field: "Physics",
        year: 1632,
        description: "Dialogue on heliocentrism",
      },
      {
        name: "Sidereus Nuncius",
        field: "Astronomy",
        year: 1610,
        description: "Work on astronomical observations",
      },
      {
        name: "Two New Sciences",
        field: "Physics",
        year: 1638,
        description: "Work on kinematics and strength of materials",
      },
    ],
  },
  {
    name: "Nicolaus Copernicus",
    type: PersonType.Astronomer,
    majorWorks: [
      {
        name: "On the Revolutions of the Heavenly Spheres",
        field: "Astronomy",
        year: 1543,
        description: "Work on heliocentric theory",
      },
      {
        name: "Commentariolus",
        field: "Astronomy",
        year: 1514,
        description: "Manuscript on heliocentric theory",
      },
      {
        name: "De revolutionibus orbium coelestium",
        field: "Astronomy",
        year: 1543,
        description: "Treatise on heliocentric theory",
      },
    ],
  },
  {
    name: "Johannes Kepler",
    type: PersonType.Astronomer,
    majorWorks: [
      {
        name: "Kepler's Laws of Planetary Motion",
        field: "Astronomy",
        year: 1609,
        description: "Laws of planetary motion",
      },
      {
        name: "Astronomia nova",
        field: "Astronomy",
        year: 1609,
        description: "Work on planetary motion",
      },
      {
        name: "Harmonices Mundi",
        field: "Astronomy",
        year: 1619,
        description: "Work on the harmony of the world",
      },
    ],
  },
  {
    name: "Rene Descartes",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Meditations on First Philosophy",
        field: "Philosophy",
        year: 1641,
        description: "Philosophical treatise",
      },
      {
        name: "Discourse on the Method",
        field: "Philosophy",
        year: 1637,
        description: "Philosophical and autobiographical treatise",
      },
      {
        name: "Principles of Philosophy",
        field: "Philosophy",
        year: 1644,
        description: "Philosophical treatise",
      },
    ],
  },
  {
    name: "Francis Bacon",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Novum Organum",
        field: "Philosophy",
        year: 1620,
        description: "Work on scientific method",
      },
      {
        name: "The Advancement of Learning",
        field: "Philosophy",
        year: 1605,
        description: "Work on the philosophy of science",
      },
      {
        name: "The New Atlantis",
        field: "Philosophy",
        year: 1627,
        description: "Utopian novel",
      },
    ],
  },
  {
    name: "William Shakespeare",
    type: PersonType.Playwright,
    majorWorks: [
      {
        name: "Hamlet",
        field: "Literature",
        year: 1600,
        description: "Tragedy play",
      },
      {
        name: "Macbeth",
        field: "Literature",
        year: 1606,
        description: "Tragedy play",
      },
      {
        name: "Romeo and Juliet",
        field: "Literature",
        year: 1597,
        description: "Tragedy play",
      },
    ],
  },
  {
    name: "Dante Alighieri",
    type: PersonType.Poet,
    majorWorks: [
      {
        name: "Divine Comedy",
        field: "Literature",
        year: 1320,
        description: "Epic poem",
      },
      {
        name: "La Vita Nuova",
        field: "Literature",
        year: 1294,
        description: "Poetry collection",
      },
      {
        name: "De Monarchia",
        field: "Literature",
        year: 1313,
        description: "Political treatise",
      },
    ],
  },
  {
    name: "Thomas More",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Utopia",
        field: "Philosophy",
        year: 1516,
        description: "Political philosophy work",
      },
      {
        name: "The History of King Richard III",
        field: "History",
        year: 1543,
        description: "Historical work",
      },
      {
        name: "Dialogue of Comfort Against Tribulation",
        field: "Philosophy",
        year: 1534,
        description: "Philosophical dialogue",
      },
    ],
  },
  {
    name: "Niccolo Machiavelli",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "The Prince",
        field: "Political Science",
        year: 1532,
        description: "Political treatise",
      },
      {
        name: "Discourses on Livy",
        field: "Political Science",
        year: 1531,
        description: "Political treatise",
      },
      {
        name: "The Art of War",
        field: "Political Science",
        year: 1521,
        description: "Military treatise",
      },
    ],
  },
  {
    name: "Giordano Bruno",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "On the Infinite Universe and Worlds",
        field: "Philosophy",
        year: 1584,
        description: "Philosophical work",
      },
      {
        name: "The Ash Wednesday Supper",
        field: "Philosophy",
        year: 1584,
        description: "Philosophical dialogue",
      },
      {
        name: "The Expulsion of the Triumphant Beast",
        field: "Philosophy",
        year: 1584,
        description: "Philosophical dialogue",
      },
    ],
  },
  {
    name: "Erasmus",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "In Praise of Folly",
        field: "Philosophy",
        year: 1511,
        description: "Satirical work",
      },
      {
        name: "Adagia",
        field: "Philosophy",
        year: 1500,
        description: "Collection of proverbs",
      },
      {
        name: "The Education of a Christian Prince",
        field: "Philosophy",
        year: 1516,
        description: "Political treatise",
      },
    ],
  },
  {
    name: "Pico della Mirandola",
    type: PersonType.Philosopher,
    majorWorks: [
      {
        name: "Oration on the Dignity of Man",
        field: "Philosophy",
        year: 1486,
        description: "Philosophical oration",
      },
      {
        name: "900 Theses",
        field: "Philosophy",
        year: 1486,
        description: "Collection of philosophical theses",
      },
      {
        name: "Heptaplus",
        field: "Philosophy",
        year: 1489,
        description: "Philosophical work",
      },
    ],
  },
  {
    name: "Giovanni Boccaccio",
    type: PersonType.Writer,
    majorWorks: [
      {
        name: "The Decameron",
        field: "Literature",
        year: 1353,
        description: "Collection of novellas",
      },
      {
        name: "On Famous Women",
        field: "Literature",
        year: 1361,
        description: "Collection of biographies",
      },
      {
        name: "The Elegy of Lady Fiammetta",
        field: "Literature",
        year: 1343,
        description: "Novel",
      },
    ],
  },
  {
    name: "Petrarch",
    type: PersonType.Poet,
    majorWorks: [
      {
        name: "Canzoniere",
        field: "Literature",
        year: 1374,
        description: "Collection of poems",
      },
      {
        name: "Africa",
        field: "Literature",
        year: 1343,
        description: "Epic poem",
      },
      {
        name: "Secretum",
        field: "Literature",
        year: 1347,
        description: "Philosophical dialogue",
      },
    ],
  },
];

export const fields: Field[] = [
  { name: "Mathematics", parentField: "" },
  { name: "Geometry", parentField: "Mathematics" },
  { name: "Number Theory", parentField: "Mathematics" },
  { name: "Algebra", parentField: "Mathematics" },
  { name: "Analysis", parentField: "Mathematics" },
  { name: "Physics", parentField: "" },
  { name: "Quantum Mechanics", parentField: "Physics" },
  { name: "Particle Physics", parentField: "Physics" },
  { name: "Philosophy", parentField: "" },
  { name: "Ethics", parentField: "Philosophy" },
  { name: "Logic", parentField: "Philosophy" },
  { name: "Epistemology", parentField: "Philosophy" },
  { name: "Computer Science", parentField: "" },
  { name: "Chemistry", parentField: "" },
  { name: "Electrical Engineering", parentField: "" },
  { name: "Biology", parentField: "" },
  { name: "Genetics", parentField: "Biology" },
  { name: "Evolutionary Biology", parentField: "Biology" },
  { name: "Biochemistry", parentField: "Biology" },
  { name: "Particle Physics", parentField: "Physics" },
  { name: "Organic Chemistry", parentField: "Chemistry" },
  { name: "Literature", parentField: "" },
  { name: "Art", parentField: "" },
  { name: "Astronomy", parentField: "" },
  { name: "Political Science", parentField: "" },
];
