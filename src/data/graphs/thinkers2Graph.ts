import { EntityDataArgs } from "../../core/model/entity/abstractEntity";
import { forceConsistencyOnGraph } from "../../core/model/forceConsistency";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";
import { people } from "../datasets/academic-works";

export const thinkers2 = () => {
  const graph = new Graph();

  const createEdgeAndMissingNodes = (
    input: string,
    output: string,
    args: EntityDataArgs | undefined,
    graph: Graph
  ) => {
    graph.createNodeIfMissing(input, { type: "concept" });
    graph.createNodeIfMissing(output, { type: "concept" });
    graph.createEdgeIfMissing(input, output, args);
  };

  const _createEdge: (
    input: string,
    edgeType: string,
    output: string
  ) => void = (input, edgeType, output) =>
    createEdgeAndMissingNodes(input, output, { type: edgeType }, graph);

  const createEdge = (...args: string[]) => {
    if (args.length < 3) {
      throw new Error("Insufficient arguments provided");
    } else if (args.length % 2 !== 1) {
      throw new Error("Invalid number of arguments");
    }
    for (let i = 0; i < args.length - 2; i += 2) {
      _createEdge(args[i], args[i + 1], args[i + 2]);
    }
  };

  // createEdge("I have a dream", "", "To tell a story");
  // createEdge("I have a dream", "", "To build an experience");
  // createEdge("I have a dream", "", "To introduce a new way of thinking");
  // createEdge(
  //   "I have a dream",
  //   "",
  //   "To create a new technology for communication"
  // );
  // createEdge("To tell a story", "because", "I love art");
  // createEdge("To build an experience", "because", "I love art");
  // createEdge("To introduce a new way of thinking", "because", "I love art");
  // createEdge(
  //   "To create a new technology for communication",
  //   "by building",
  //   "unigraph"
  // );
  // createEdge("To tell a story", "using", "unigraph");
  // createEdge("To introduce a new way of thinking", "using", "unigraph");
  // createEdge(
  //   "To tell a story",
  //   "and therefore",
  //   "To introduce a new way of thinking"
  // );
  // createEdge("unigraph", "is a", "unified graph analytics engine");
  // createEdge(
  //   "unigraph",
  //   "functions as a",
  //   "interface between humans and graph technologies"
  // );
  // createEdge(
  //   "unigraph",
  //   "focuses on",
  //   "human interpretability of graph-based data"
  // );
  // createEdge("unigraph", "could be used for", "knowledge graphs");
  // createEdge("unigraph", "could be used for", "systems diagramming");

  // //Response 1
  // // Customization Features
  // createEdge("Platform", "allows customization of", "entities");
  // createEdge("Platform", "allows customization of", "spaces");
  // createEdge("Platform", "allows customization of", "interactions");
  // createEdge("Platform", "allows customization of", "visual themes");

  // // Platform Purpose
  // createEdge("Platform", "serves as", "central launchpad");
  // createEdge("Platform", "serves as", "web canvas-based analytics toolkit");
  // createEdge("Platform", "lowers", "barrier of entry to producing objects");
  // createEdge("Platform", "functions as", "metalanguage for analytics");
  // createEdge("Platform", "enables", "data science");
  // createEdge("Platform", "enables", "application development");

  // // Implementation Requirements
  // createEdge(
  //   "Platform Implementation",
  //   "requires",
  //   "separation into platform layer"
  // );
  // createEdge(
  //   "Platform Implementation",
  //   "requires",
  //   "separation into application layer"
  // );
  // createEdge("Platform Implementation", "must be", "robust in features");
  // createEdge("Platform Implementation", "must be", "lightweight");
  // createEdge("Platform Implementation", "must have", "minimal dependencies");
  // createEdge(
  //   "Platform Implementation",
  //   "must achieve",
  //   "threshold of understandability"
  // );
  // createEdge("Platform Implementation", "must achieve", "ease of utility");

  // //Response 2
  // // Core Concepts and Pillars
  // createEdge("Graph Engine", "is", "graph-based analytics engine");
  // createEdge("Graph Engine", "has pillar", "accessibility");
  // createEdge("Graph Engine", "has pillar", "performance");
  // createEdge("Graph Engine", "has pillar", "flexibility");
  // createEdge("Graph Engine", "enables", "infinite composition");
  // createEdge("Graph Engine", "enables", "infinite decomposition");
  // createEdge("Graph Engine", "enables", "infinite nesting");

  // // Logical Layer Components
  // createEdge("Logical Layer", "contains primitive", "Node");
  // createEdge("Logical Layer", "contains primitive", "Edge");
  // createEdge("Node", "can be", "Group");
  // createEdge("Group", "is", "node with children");
  // createEdge("Logical Layer", "contains complex", "Chain");
  // createEdge("Chain", "consists of", "collection of nodes and edges");

  // // Type System
  // createEdge("Type System", "includes", "Definitions");
  // createEdge("Type System", "includes", "Instances");
  // createEdge("Node", "supports", "typed context mapper");
  // createEdge("Edge", "supports", "typed context mapper");

  // // Display Layer Components
  // createEdge("Display Layer", "contains", "Canvas");
  // createEdge("Canvas", "supports interaction", "onDrag");
  // createEdge("Canvas", "supports interaction", "onClick");
  // createEdge("Canvas", "supports interaction", "onRightClick");
  // createEdge("Canvas", "supports", "Rendering");

  // // Node Interactions
  // createEdge("Node", "supports interaction", "onHover");
  // createEdge("Node", "supports interaction", "onClick");
  // createEdge("Node", "supports interaction", "onDoubleClick");
  // createEdge("Node", "supports interaction", "onResize");
  // createEdge("Node", "supports interaction", "onMove");

  // // Applications and Use Cases
  // createEdge("Graph Engine", "enables", "complex system diagramming");
  // createEdge("Graph Engine", "enables", "navigation");
  // createEdge("Graph Engine", "enables", "time-evolution");
  // createEdge("Graph Engine", "supports", "dynamic functional composition");
  // createEdge("Graph Engine", "enables", "cross-org data harmonization");

  // // System Design Components
  // createEdge("System Design", "includes component", "Database");
  // createEdge("System Design", "includes component", "API Gateway");
  // createEdge("System Design", "includes component", "Load Balancer");
  // createEdge("System Design", "includes component", "Service");

  // // Functional Requirements
  // createEdge("Graph Model", "requires", "Base Primitives");
  // createEdge("Graph Model", "requires", "State Management");
  // createEdge("State Management", "includes", "Node CRUD");
  // createEdge("State Management", "includes", "Edge CRUD");
  // createEdge("State Management", "includes", "Group CRUD");
  // createEdge("State Management", "includes", "Subgraph CRUD");

  // // Canvas Interaction Events
  // createEdge("Canvas", "handles event", "onNodeClick");
  // createEdge("Canvas", "handles event", "onNodeRightClick");
  // createEdge("Canvas", "handles event", "onNodeHover");
  // createEdge("Canvas", "handles event", "onEdgeClick");
  // createEdge("Canvas", "handles event", "onEdgeRightClick");
  // createEdge("Canvas", "handles event", "onEdgeHover");
  // createEdge("Canvas", "handles event", "onBackgroundClick");
  // createEdge("Canvas", "handles event", "onBackgroundDrag");

  // // Camera Controls
  // createEdge("Camera", "supports", "zoom in");
  // createEdge("Camera", "supports", "zoom out");
  // createEdge("Camera", "supports", "fit graph to canvas");

  // // Rendering Capabilities
  // createEdge("Rendering", "includes", "renderNode");
  // createEdge("Rendering", "includes", "renderGroup");
  // createEdge("Rendering", "includes", "renderEdge");
  // createEdge("Rendering", "includes", "highlightNode");
  // createEdge("Rendering", "includes", "unhighlightNode");
  // createEdge("Rendering", "includes", "renderBoxSelection");

  // // Business Strategy and Development
  // createEdge("Development Strategy", "follows", "Iterative development");
  // createEdge("Development Strategy", "focuses on", "compounding value");
  // createEdge("Development Strategy", "employs", "bottom-up tooling");

  // // Semantic Web Integration
  // createEdge("Graph Engine", "integrates with", "Semantic Web");
  // createEdge("Semantic Web", "includes technology", "OWL");
  // createEdge("Semantic Web", "includes technology", "RDF");

  // // Model and Display Separation
  // createEdge("Graph Engine", "separates", "Model Graph");
  // createEdge("Graph Engine", "separates", "Scene Graph");
  // createEdge("Model Graph", "contains", "logical structure");
  // createEdge("Scene Graph", "contains", "visual representation");

  // // Groups and Composition
  // createEdge("Groups", "enable", "hierarchical structures");
  // createEdge("Groups", "support", "context aggregation");
  // createEdge("Groups", "improve", "visualization clarity");
  // createEdge("Groups", "facilitate", "scalability");

  // Academic influences
  // Ancient Scientific Influences
  // Pre-Socratic Foundations
  createEdge("Thales", "influenced", "Anaximander");
  createEdge("Anaximander", "influenced", "Anaximenes");
  createEdge("Anaximenes", "influenced", "Anaxagoras");
  createEdge("Pythagoras", "influenced", "Philolaus");
  createEdge("Philolaus", "influenced", "Archytas");
  createEdge("Heraclitus", "influenced", "Parmenides");
  createEdge("Parmenides", "influenced", "Zeno of Elea");
  createEdge("Zeno of Elea", "influenced", "Melissus");
  createEdge("Empedocles", "influenced", "Democritus");
  createEdge("Democritus", "influenced", "Leucippus");

  // Socratic Circle
  createEdge("Socrates", "influenced", "Plato");
  createEdge("Socrates", "influenced", "Xenophon");
  createEdge("Socrates", "influenced", "Antisthenes");
  createEdge("Antisthenes", "influenced", "Diogenes of Sinope");
  createEdge("Socrates", "influenced", "Aristippus");
  createEdge("Aristippus", "influenced", "Theodorus the Atheist");

  // Platonic Academy
  createEdge("Plato", "influenced", "Aristotle");
  createEdge("Plato", "influenced", "Speusippus");
  createEdge("Speusippus", "influenced", "Xenocrates");
  createEdge("Xenocrates", "influenced", "Polemon");
  createEdge("Plato", "influenced", "Eudoxus");
  createEdge("Eudoxus", "influenced", "Archytas");

  // Aristotelian Legacy
  createEdge("Aristotle", "influenced", "Theophrastus");
  createEdge("Theophrastus", "influenced", "Strato of Lampsacus");
  createEdge("Aristotle", "influenced", "Aristoxenus");
  createEdge("Aristotle", "influenced", "Dicaearchus");
  createEdge("Theophrastus", "influenced", "Demetrius of Phalerum");

  // Hellenistic Schools
  createEdge("Epicurus", "influenced", "Metrodorus of Lampsacus");
  createEdge("Epicurus", "influenced", "Hermarchus");
  createEdge("Epicurus", "influenced", "Lucretius");
  createEdge("Zeno of Citium", "influenced", "Cleanthes");
  createEdge("Cleanthes", "influenced", "Chrysippus");
  createEdge("Chrysippus", "influenced", "Panaetius");
  createEdge("Panaetius", "influenced", "Posidonius");

  // Scientific and Mathematical Development
  createEdge("Euclid", "influenced", "Apollonius");
  createEdge("Apollonius", "influenced", "Hipparchus");
  createEdge("Hipparchus", "influenced", "Ptolemy");
  createEdge("Archimedes", "influenced", "Hero of Alexandria");
  createEdge("Euclid", "influenced", "Archimedes");
  createEdge("Aristotle", "influenced", "Euclid");
  createEdge("Ptolemy", "influenced", "Galen");
  createEdge("Hippocrates", "influenced", "Galen");
  createEdge("Hippocrates", "influenced", "Herophilus");
  createEdge("Herophilus", "influenced", "Erasistratus");

  // Classical to Medieval Transmission
  createEdge("Ptolemy", "influenced", "Al-Khwarizmi");
  createEdge("Euclid", "influenced", "Al-Khwarizmi");
  createEdge("Al-Khwarizmi", "influenced", "Fibonacci");
  createEdge("Aristotle", "influenced", "Avicenna");
  createEdge("Avicenna", "influenced", "Averroes");
  createEdge("Averroes", "influenced", "Maimonides");
  createEdge("Maimonides", "influenced", "Aquinas");
  createEdge("Al-Farabi", "influenced", "Avicenna");
  createEdge("Ibn al-Haytham", "influenced", "Roger Bacon");
  createEdge("Roger Bacon", "influenced", "Francis Bacon");

  // Late Antiquity Transmission
  createEdge("Plotinus", "influenced", "Porphyry");
  createEdge("Porphyry", "influenced", "Iamblichus");
  createEdge("Iamblichus", "influenced", "Proclus");
  createEdge("Proclus", "influenced", "Pseudo-Dionysius");
  createEdge("Augustine", "influenced", "Boethius");
  createEdge("Boethius", "influenced", "Cassiodorus");
  createEdge("Cassiodorus", "influenced", "Isidore of Seville");
  createEdge("Ptolemy", "influenced", "Theon of Alexandria");
  createEdge("Theon of Alexandria", "influenced", "Hypatia");

  // Byzantine Preservation
  createEdge("John of Damascus", "influenced", "Theodore of Studios");
  createEdge("Photius", "influenced", "Arethas of Caesarea");
  createEdge("Michael Psellos", "influenced", "John Italus");
  createEdge("Anna Comnena", "influenced", "Eustathius of Thessalonica");
  createEdge("John Philoponus", "influenced", "Simplicius");
  createEdge("Simplicius", "influenced", "Byzantine Scholars");

  // Islamic Golden Age
  createEdge("Al-Kindi", "influenced", "Al-Farabi");
  createEdge("Al-Farabi", "influenced", "Avicenna");
  createEdge("Avicenna", "influenced", "Al-Ghazali");
  createEdge("Al-Ghazali", "influenced", "Averroes");
  createEdge("Averroes", "influenced", "Latin Scholastics");
  createEdge("Ibn al-Haytham", "influenced", "Roger Bacon");
  createEdge("Al-Khwarizmi", "influenced", "Leonardo Fibonacci");
  createEdge("Jabir ibn Hayyan", "influenced", "Latin Alchemists");

  // Medieval Scholasticism
  createEdge("Anselm", "influenced", "Peter Abelard");
  createEdge("Peter Abelard", "influenced", "Peter Lombard");
  createEdge("Averroes", "influenced", "Albertus Magnus");
  createEdge("Albertus Magnus", "influenced", "Thomas Aquinas");
  createEdge("Avicenna", "influenced", "Maimonides");
  createEdge("Maimonides", "influenced", "Thomas Aquinas");
  createEdge("Thomas Aquinas", "influenced", "Dante Alighieri");
  createEdge("Duns Scotus", "influenced", "William of Ockham");

  // Proto-Renaissance
  createEdge("Petrarch", "influenced", "Boccaccio");
  createEdge("Boccaccio", "influenced", "Salutati");
  createEdge("Salutati", "influenced", "Leonardo Bruni");
  createEdge("Manuel Chrysoloras", "influenced", "Italian Humanists");
  createEdge("Gemistus Pletho", "influenced", "Marsilio Ficino");
  createEdge("Bessarion", "influenced", "Italian Renaissance");
  createEdge("Nicholas of Cusa", "influenced", "Renaissance Science");
  createEdge("Roger Bacon", "influenced", "Renaissance Scientists");

  // Early Renaissance
  createEdge("Marsilio Ficino", "influenced", "Pico della Mirandola");
  createEdge("George of Trebizond", "influenced", "Regiomontanus");
  createEdge("Regiomontanus", "influenced", "Copernicus");
  createEdge("Paul of Middelburg", "influenced", "Copernicus");
  createEdge("Leonardo Bruni", "influenced", "Lorenzo Valla");
  createEdge("Lorenzo Valla", "influenced", "Erasmus");

  // Medieval to Renaissance
  createEdge("Ockham", "influenced", "Bacon");
  createEdge("Duns Scotus", "influenced", "Ockham");
  createEdge("Aquinas", "influenced", "Dante");
  createEdge("Dante", "influenced", "Petrarch");
  createEdge("Petrarch", "influenced", "Erasmus");
  createEdge("Erasmus", "influenced", "More");
  createEdge("More", "influenced", "Francis Bacon");
  createEdge("Machiavelli", "influenced", "Hobbes");
  createEdge("Copernicus", "influenced", "Bruno");
  createEdge("Bruno", "influenced", "Galileo");

  // Late Renaissance Humanists
  createEdge("Erasmus", "influenced", "Thomas More");
  createEdge("Erasmus", "influenced", "Juan Luis Vives");
  createEdge("Thomas More", "influenced", "William Roper");
  createEdge("Machiavelli", "influenced", "Francesco Guicciardini");
  createEdge("Machiavelli", "influenced", "Jean Bodin");
  createEdge("Pietro Pomponazzi", "influenced", "Giacomo Zabarella");
  createEdge("Zabarella", "influenced", "Galileo");
  createEdge("Montaigne", "influenced", "Pierre Charron");

  // Scientific Revolution Pioneers
  createEdge("Copernicus", "influenced", "Rheticus");
  createEdge("Rheticus", "influenced", "Tycho Brahe");
  createEdge("Tycho Brahe", "influenced", "Kepler");
  createEdge("Vesalius", "influenced", "Fabricius");
  createEdge("Fabricius", "influenced", "William Harvey");
  createEdge("Paracelsus", "influenced", "van Helmont");
  createEdge("William Gilbert", "influenced", "Francis Bacon");
  createEdge("Galileo", "influenced", "Torricelli");
  createEdge("Torricelli", "influenced", "Pascal");
  createEdge("Mersenne", "influenced", "Pascal");

  // Early Modern Philosophy
  createEdge("Francis Bacon", "influenced", "Hobbes");
  createEdge("Galileo", "influenced", "Hobbes");
  createEdge("Descartes", "influenced", "Princess Elisabeth");
  createEdge("Descartes", "influenced", "Malebranche");
  createEdge("Descartes", "influenced", "Spinoza");
  createEdge("Hobbes", "influenced", "Spinoza");
  createEdge("Spinoza", "influenced", "Leibniz");
  createEdge("Henry More", "influenced", "Conway");
  createEdge("Conway", "influenced", "Leibniz");
  createEdge("Gassendi", "influenced", "Boyle");

  // Scientific Method Development
  createEdge("Galileo", "influenced", "Viviani");
  createEdge("Viviani", "influenced", "Borelli");
  createEdge("Borelli", "influenced", "Malpighi");
  createEdge("Huygens", "influenced", "Leibniz");
  createEdge("Boyle", "influenced", "Hooke");
  createEdge("Hooke", "influenced", "Newton");
  createEdge("Newton", "influenced", "Halley");
  createEdge("Newton", "influenced", "Roger Cotes");

  // Early Scientific Institutions
  createEdge("Bacon", "influenced", "Royal Society");
  createEdge("Mersenne", "influenced", "French Academy");
  createEdge("Galileo", "influenced", "Accademia dei Lincei");
  createEdge("Cosimo de Medici", "influenced", "Galileo");
  createEdge("Cardinal Richelieu", "influenced", "French Academy");
  createEdge("Charles II", "influenced", "Royal Society");
  createEdge("Colbert", "influenced", "French Academy of Sciences");
  createEdge("Frederick I", "influenced", "Berlin Academy");

  // Early Modern Philosophy
  createEdge("Montaigne", "influenced", "Pascal");
  createEdge("Pascal", "influenced", "Leibniz");
  createEdge("Hobbes", "influenced", "Spinoza");
  createEdge("Spinoza", "influenced", "Leibniz");
  createEdge("Locke", "influenced", "Berkeley");
  createEdge("Berkeley", "influenced", "Hume");
  createEdge("Hume", "influenced", "Kant");
  createEdge("Kant", "influenced", "Hegel");
  createEdge("Hegel", "influenced", "Marx");
  createEdge("Hegel", "influenced", "Kierkegaard");

  // Modern Philosophy
  createEdge("Schopenhauer", "influenced", "Nietzsche");
  createEdge("Kierkegaard", "influenced", "Sartre");
  createEdge("Nietzsche", "influenced", "Heidegger");
  createEdge("Heidegger", "influenced", "Sartre");
  createEdge("Husserl", "influenced", "Heidegger");
  createEdge("Frege", "influenced", "Russell");
  createEdge("Russell", "influenced", "Wittgenstein");
  createEdge("Wittgenstein", "influenced", "Popper");
  createEdge("Carnap", "influenced", "Quine");
  createEdge("Quine", "influenced", "Davidson");

  // Mathematics and Logic Development
  createEdge("Dedekind", "influenced", "Cantor");
  createEdge("Cantor", "influenced", "Hilbert");
  createEdge("Peano", "influenced", "Russell");
  createEdge("Frege", "influenced", "Gödel");
  createEdge("Hilbert", "influenced", "Gödel");
  createEdge("Gödel", "influenced", "Turing");
  createEdge("Turing", "influenced", "von Neumann");
  createEdge("von Neumann", "influenced", "Shannon");
  createEdge("Boole", "influenced", "Frege");
  createEdge("De Morgan", "influenced", "Boole");

  // Scientific Revolution to Modern Science
  createEdge("Vesalius", "influenced", "Harvey");
  createEdge("Harvey", "influenced", "Boyle");
  createEdge("Boyle", "influenced", "Newton");
  createEdge("Hooke", "influenced", "Newton");
  createEdge("Newton", "influenced", "Laplace");
  createEdge("Laplace", "influenced", "Fourier");
  createEdge("Fourier", "influenced", "Maxwell");
  createEdge("Lavoisier", "influenced", "Dalton");
  createEdge("Dalton", "influenced", "Mendeleev");
  createEdge("Ampère", "influenced", "Faraday");

  // Biology and Evolution
  createEdge("Lamarck", "influenced", "Darwin");
  createEdge("Cuvier", "influenced", "Darwin");
  createEdge("Lyell", "influenced", "Darwin");
  createEdge("Wallace", "influenced", "Darwin");
  createEdge("Darwin", "influenced", "Huxley");
  createEdge("Mendel", "influenced", "Morgan");
  createEdge("Morgan", "influenced", "Muller");
  createEdge("Fisher", "influenced", "Wright");
  createEdge("Wright", "influenced", "Dobzhansky");
  createEdge("Dobzhansky", "influenced", "Mayr");

  // Modern Physics Expansion
  createEdge("Hertz", "influenced", "Planck");
  createEdge("Lorentz", "influenced", "Einstein");
  createEdge("Minkowski", "influenced", "Einstein");
  createEdge("Mach", "influenced", "Einstein");
  createEdge("de Broglie", "influenced", "Schrödinger");
  createEdge("Born", "influenced", "Heisenberg");
  createEdge("Pauli", "influenced", "Heisenberg");
  createEdge("Jordan", "influenced", "Heisenberg");
  createEdge("Yukawa", "influenced", "Feynman");
  createEdge("Fermi", "influenced", "Feynman");

  // 20th Century Science
  createEdge("Pauling", "influenced", "Crick");
  createEdge("Crick", "influenced", "Watson");
  createEdge("Watson", "influenced", "Venter");
  createEdge("Weinberg", "influenced", "Glashow");
  createEdge("Gell-Mann", "influenced", "Weinberg");
  createEdge("Bardeen", "influenced", "Cooper");
  createEdge("Landau", "influenced", "Feynman");
  createEdge("Wheeler", "influenced", "Hawking");
  createEdge("Chandrasekhar", "influenced", "Hawking");
  createEdge("Penrose", "influenced", "Hawking");

  // Computer Science and Information Theory
  createEdge("Babbage", "influenced", "Lovelace");
  createEdge("Lovelace", "influenced", "Turing");
  createEdge("Shannon", "influenced", "Hamming");
  createEdge("von Neumann", "influenced", "McCarthy");
  createEdge("McCarthy", "influenced", "Minsky");
  createEdge("Wiener", "influenced", "Shannon");
  createEdge("Church", "influenced", "Turing");
  createEdge("Post", "influenced", "Church");
  createEdge("Kleene", "influenced", "McCarthy");
  createEdge("Backus", "influenced", "Dijkstra");

  // Social Sciences
  createEdge("Smith", "influenced", "Ricardo");
  createEdge("Ricardo", "influenced", "Marx");
  createEdge("Mill", "influenced", "Keynes");
  createEdge("Weber", "influenced", "Parsons");
  createEdge("Durkheim", "influenced", "Lévi-Strauss");
  createEdge("Freud", "influenced", "Jung");
  createEdge("Jung", "influenced", "Campbell");
  createEdge("Boas", "influenced", "Mead");
  createEdge("Malinowski", "influenced", "Radcliffe-Brown");
  createEdge("Saussure", "influenced", "Lévi-Strauss");

  // Interdisciplinary Influences
  createEdge("Whitehead", "influenced", "Russell");
  createEdge("James", "influenced", "Dewey");
  createEdge("Peirce", "influenced", "James");
  createEdge("Dewey", "influenced", "Mead");
  createEdge("Cassirer", "influenced", "Panofsky");
  createEdge("Wiener", "influenced", "Bateson");
  createEdge("von Bertalanffy", "influenced", "Bateson");
  createEdge("Polanyi", "influenced", "Kuhn");
  createEdge("Kuhn", "influenced", "Feyerabend");
  createEdge("Lakatos", "influenced", "Feyerabend");

  /// More
  // Ancient Greek Foundations
  createEdge("Socrates", "influenced", "Plato");
  createEdge("Plato", "influenced", "Aristotle");
  createEdge("Aristotle", "influenced", "Alexander the Great");
  createEdge("Plato", "influenced", "Plotinus");
  createEdge("Aristotle", "influenced", "Aquinas");

  // Classical to Medieval
  createEdge("Augustine", "influenced", "Aquinas");
  createEdge("Plotinus", "influenced", "Augustine");
  createEdge("Averroes", "influenced", "Aquinas");
  createEdge("Maimonides", "influenced", "Aquinas");
  createEdge("Aquinas", "influenced", "Dante");

  // Renaissance to Early Modern
  createEdge("Machiavelli", "influenced", "Hobbes");
  createEdge("Montaigne", "influenced", "Pascal");
  createEdge("Descartes", "influenced", "Spinoza");
  createEdge("Descartes", "influenced", "Leibniz");
  createEdge("Spinoza", "influenced", "Leibniz");

  // Empiricist and Rationalist Traditions
  createEdge("Locke", "influenced", "Berkeley");
  createEdge("Berkeley", "influenced", "Hume");
  createEdge("Hume", "influenced", "Kant");
  createEdge("Leibniz", "influenced", "Wolff");
  createEdge("Wolff", "influenced", "Kant");

  // German Idealism and Its Aftermath
  createEdge("Kant", "influenced", "Fichte");
  createEdge("Fichte", "influenced", "Hegel");
  createEdge("Kant", "influenced", "Hegel");
  createEdge("Hegel", "influenced", "Marx");
  createEdge("Hegel", "influenced", "Kierkegaard");

  // Modern Continental Philosophy
  createEdge("Kierkegaard", "influenced", "Nietzsche");
  createEdge("Nietzsche", "influenced", "Heidegger");
  createEdge("Heidegger", "influenced", "Sartre");
  createEdge("Husserl", "influenced", "Heidegger");
  createEdge("Sartre", "influenced", "Camus");

  // Analytic Philosophy
  createEdge("Frege", "influenced", "Russell");
  createEdge("Russell", "influenced", "Wittgenstein");
  createEdge("Wittgenstein", "influenced", "Popper");
  createEdge("Russell", "influenced", "Quine");
  createEdge("Wittgenstein", "influenced", "Austin");

  // Critical Theory and Post-Structuralism
  createEdge("Marx", "influenced", "Frankfurt School");
  createEdge("Heidegger", "influenced", "Foucault");
  createEdge("Nietzsche", "influenced", "Foucault");
  createEdge("Hegel", "influenced", "Derrida");
  createEdge("Husserl", "influenced", "Derrida");

  // American Pragmatism
  createEdge("Kant", "influenced", "Peirce");
  createEdge("Peirce", "influenced", "James");
  createEdge("James", "influenced", "Dewey");
  createEdge("Hegel", "influenced", "Dewey");
  createEdge("Dewey", "influenced", "Rorty");

  ////////////////////
  ////// BELIEFS

  createEdge("Aristotle", "adopted", "Empirical Naturalism");
  createEdge("Al-Farabi", "adopted", "Neo-Aristotelianism");
  createEdge("Al-Ghazali", "adopted", "Islamic Occasionalism");
  createEdge("Al-Khwarizmi", "adopted", "Mathematical Systematization");
  createEdge("Al-Kindi", "adopted", "Rational Theology");
  createEdge("Albertus Magnus", "adopted", "Christian Aristotelianism");
  createEdge("Ampère", "adopted", "Electromagnetic Theory");
  createEdge("Anaxagoras", "adopted", "Cosmic Mind");
  createEdge("Anaximander", "adopted", "Natural Law");
  createEdge("Anaximenes", "adopted", "Material Monism");
  createEdge("Anselm", "adopted", "Rational Faith");
  createEdge("Antisthenes", "adopted", "Ethical Asceticism");
  createEdge("Apollonius", "adopted", "Geometric Harmony");
  createEdge("Aquinas", "adopted", "Thomistic Synthesis");
  createEdge("Archimedes", "adopted", "Mathematical Physics");
  createEdge("Aristippus", "adopted", "Hedonism");
  createEdge("Augustine", "adopted", "Divine Illumination");
  createEdge("Averroes", "adopted", "Rational Islam");
  createEdge("Avicenna", "adopted", "Islamic Rationalism");
  createEdge("Bacon", "adopted", "Empirical Method");
  createEdge("Berkeley", "adopted", "Idealism");
  createEdge("Boethius", "adopted", "Platonic Christianity");
  createEdge("Boole", "adopted", "Logical Algebra");
  createEdge("Born", "adopted", "Quantum Probability");
  createEdge("Boyle", "adopted", "Corpuscular Theory");
  createEdge("Bruno", "adopted", "Cosmic Infinity");
  createEdge("Camus", "adopted", "Philosophical Absurdism");
  createEdge("Cantor", "adopted", "Mathematical Infinity");
  createEdge("Carnap", "adopted", "Logical Positivism");
  createEdge("Copernicus", "adopted", "Heliocentrism");
  createEdge("Darwin", "adopted", "Natural Selection");
  createEdge("Democritus", "adopted", "Atomism");
  createEdge("Descartes", "adopted", "Rational Dualism");
  createEdge("Dewey", "adopted", "Pragmatism");
  createEdge("Einstein", "adopted", "Relativity");
  createEdge("Epicurus", "adopted", "Atomistic Hedonism");
  createEdge("Euclid", "adopted", "Axiomatic Geometry");
  createEdge("Euler", "adopted", "Mathematical Analysis");
  createEdge("Faraday", "adopted", "Field Theory");
  createEdge("Fermi", "adopted", "Nuclear Physics");
  createEdge("Feynman", "adopted", "Quantum Electrodynamics");
  createEdge("Fibonacci", "adopted", "Mathematical Sequence");
  createEdge("Fourier", "adopted", "Wave Analysis");
  createEdge("Galileo", "adopted", "Mathematical Physics");
  createEdge("Gauss", "adopted", "Mathematical Rigor");
  createEdge("Gödel", "adopted", "Mathematical Platonism");
  createEdge("Heisenberg", "adopted", "Quantum Uncertainty");
  createEdge("Hobbes", "adopted", "Materialist Politics");
  createEdge("Hume", "adopted", "Empirical Skepticism");
  createEdge("Kant", "adopted", "Transcendental Idealism");
  createEdge("Kepler", "adopted", "Celestial Harmony");
  createEdge("Leibniz", "adopted", "Universal Harmony");
  createEdge("Locke", "adopted", "Empirical Knowledge");
  createEdge("Maxwell", "adopted", "Electromagnetic Unity");
  createEdge("Newton", "adopted", "Universal Mechanics");
  createEdge("Nietzsche", "adopted", "Will to Power");
  createEdge("Ockham", "adopted", "Nominalism");
  createEdge("Pascal", "adopted", "Probabilistic Faith");
  createEdge("Planck", "adopted", "Quantum Theory");
  createEdge("Plato", "adopted", "Forms");
  createEdge("Ptolemy", "adopted", "Geocentric System");
  createEdge("Pythagoras", "adopted", "Number Mysticism");
  createEdge("Russell", "adopted", "Logical Atomism");
  createEdge("Schrödinger", "adopted", "Wave Mechanics");
  createEdge("Shannon", "adopted", "Information Theory");
  createEdge("Socrates", "adopted", "Dialectical Inquiry");
  createEdge("Spinoza", "adopted", "Rational Monism");
  createEdge("Thales", "adopted", "Material Principle");
  createEdge("Turing", "adopted", "Computability");
  createEdge("von Neumann", "adopted", "Mathematical Formalism");
  createEdge("Wittgenstein", "adopted", "Language Games");

  /// INVENTIONS OF IDEAS
  createEdge("Newton", "invented", "calculus");
  createEdge("Leibniz", "invented", "binary number system");
  createEdge("Descartes", "invented", "cartesian coordinate system");
  createEdge("Aristotle", "invented", "formal logic");
  createEdge("Plato", "invented", "theory of forms");
  createEdge("Kant", "invented", "transcendental idealism");
  createEdge("Hegel", "invented", "dialectical method");
  createEdge("Frege", "invented", "predicate logic");
  createEdge("Cantor", "invented", "set theory");
  createEdge("Russell", "invented", "type theory");
  createEdge("Gödel", "invented", "incompleteness theorems");
  createEdge("Wittgenstein", "invented", "picture theory of meaning");
  createEdge("Husserl", "invented", "phenomenological method");
  createEdge("Heidegger", "invented", "fundamental ontology");
  createEdge("Sartre", "invented", "existential phenomenology");
  createEdge("Berkeley", "invented", "subjective idealism");
  createEdge("Hume", "invented", "radical empiricism");
  createEdge("Spinoza", "invented", "substance monism");
  createEdge("Locke", "invented", "empirical epistemology");
  createEdge("Pascal", "invented", "probability theory");
  createEdge("Bayes", "invented", "conditional probability");
  createEdge("Boole", "invented", "boolean algebra");
  createEdge("Euler", "invented", "graph theory");
  createEdge("Gauss", "invented", "normal distribution");
  createEdge("Riemann", "invented", "non-euclidean geometry");
  createEdge("Peirce", "invented", "pragmatism");
  createEdge("James", "invented", "radical empiricism");
  createEdge("Dewey", "invented", "instrumentalism");
  createEdge("Marx", "invented", "historical materialism");
  createEdge("Nietzsche", "invented", "perspectivism");
  createEdge("Foucault", "invented", "genealogical method");
  createEdge("Derrida", "invented", "deconstruction");
  createEdge("Quine", "invented", "naturalized epistemology");
  createEdge("Popper", "invented", "falsificationism");
  createEdge("Kuhn", "invented", "paradigm theory");
  createEdge("Lakatos", "invented", "research programmes");
  createEdge("Carnap", "invented", "logical positivism");
  createEdge("Tarski", "invented", "semantic theory of truth");
  createEdge("Church", "invented", "lambda calculus");
  createEdge("Turing", "invented", "computability theory");
  createEdge("Von Neumann", "invented", "game theory");
  createEdge("Kripke", "invented", "possible world semantics");
  createEdge("Rawls", "invented", "justice as fairness");
  createEdge("Putnam", "invented", "functionalism");
  createEdge("Davidson", "invented", "radical interpretation");
  createEdge("Chomsky", "invented", "universal grammar");
  createEdge("Austin", "invented", "speech act theory");
  createEdge("Grice", "invented", "conversational implicature");
  createEdge("Dummett", "invented", "anti-realism");
  createEdge("Lewis", "invented", "modal realism");

  /// Contradictions
  createEdge("Plato", "disagrees with", "Aristotle");
  createEdge("Augustine", "disagrees with", "Pelagius");
  createEdge("Leibniz", "disagrees with", "Newton");
  createEdge("Hegel", "disagrees with", "Kierkegaard");
  createEdge("Russell", "disagrees with", "Hegel");
  createEdge("Carnap", "disagrees with", "Heidegger");
  createEdge("Popper", "disagrees with", "Hegel");
  createEdge("Locke", "disagrees with", "Descartes");
  createEdge("Berkeley", "disagrees with", "Locke");
  createEdge("Nietzsche", "disagrees with", "Kant");
  createEdge("Marx", "disagrees with", "Hegel");
  createEdge("Averroes", "disagrees with", "Al-Ghazali");
  createEdge("Sartre", "disagrees with", "Heidegger");
  createEdge("Quine", "disagrees with", "Carnap");
  createEdge("Foucault", "disagrees with", "Habermas");

  // Conceptual Contradictions
  createEdge("Theory of Forms", "contradicts", "Empiricism");
  createEdge("Rationalism", "contradicts", "Empiricism");
  createEdge("Idealism", "contradicts", "Materialism");
  createEdge("Free Will", "contradicts", "Determinism");
  createEdge("Absolutism", "contradicts", "Relativism");
  createEdge("Realism", "contradicts", "Nominalism");
  createEdge("Monism", "contradicts", "Dualism");
  createEdge("Positivism", "contradicts", "Metaphysics");
  createEdge("Existentialism", "contradicts", "Essentialism");
  createEdge("Foundationalism", "contradicts", "Coherentism");
  createEdge("Internalism", "contradicts", "Externalism");
  createEdge("Compatibilism", "contradicts", "Incompatibilism");
  createEdge("Verificationism", "contradicts", "Falsificationism");
  createEdge("Universalism", "contradicts", "Particularism");
  createEdge("Presentism", "contradicts", "Eternalism");

  createEdge("Parmenides", "disagrees with", "Heraclitus");
  createEdge("Plato", "disagrees with", "Democritus");
  createEdge("Aristotle", "disagrees with", "Plato");
  createEdge("Epicurus", "disagrees with", "Zeno of Citium");
  createEdge("Chrysippus", "disagrees with", "Epicurus");
  // Medieval Conflicts
  createEdge("Augustine", "disagrees with", "Pelagius");
  createEdge("Averroes", "disagrees with", "Al-Ghazali");
  createEdge("Aquinas", "disagrees with", "Averroes");
  createEdge("William of Ockham", "disagrees with", "Duns Scotus");
  createEdge("John Philoponus", "disagrees with", "Aristotle");
  // Scientific Revolution Conflicts
  createEdge("Galileo", "disagrees with", "Aristotle");
  createEdge("Copernicus", "disagrees with", "Ptolemy");
  createEdge("Newton", "disagrees with", "Descartes");
  createEdge("Leibniz", "disagrees with", "Newton");
  createEdge("Boyle", "disagrees with", "Aristotle");
  // Modern Philosophy Conflicts
  createEdge("Berkeley", "disagrees with", "Locke");
  createEdge("Hume", "disagrees with", "Descartes");
  createEdge("Kant", "disagrees with", "Hume");
  createEdge("Hegel", "disagrees with", "Kant");
  createEdge("Schopenhauer", "disagrees with", "Hegel");
  // Scientific Theory Conflicts
  createEdge("Einstein", "disagrees with", "Newton");
  createEdge("Bohr", "disagrees with", "Einstein");
  createEdge("Heisenberg", "disagrees with", "Einstein");
  createEdge("Darwin", "disagrees with", "Cuvier");
  createEdge("Planck", "disagrees with", "Mach");
  // Methodological Conflicts
  createEdge("Popper", "disagrees with", "logical positivism");
  createEdge("Kuhn", "disagrees with", "Popper");
  createEdge("Feyerabend", "disagrees with", "Popper");
  createEdge("Lakatos", "disagrees with", "Kuhn");
  createEdge("Quine", "disagrees with", "Carnap");
  // Conceptual Contradictions
  createEdge("Heliocentrism", "contradicts", "Geocentric System");
  createEdge("Mathematical Platonism", "contradicts", "Nominalism");
  createEdge("Quantum Theory", "contradicts", "Universal Mechanics");
  createEdge("Natural Selection", "contradicts", "Divine Illumination");
  createEdge("Atomism", "contradicts", "Cosmic Mind");
  createEdge("Material Monism", "contradicts", "Rational Dualism");
  createEdge("Empirical Method", "contradicts", "Rational Faith");
  createEdge("Quantum Probability", "contradicts", "Determinism");
  createEdge("Historical Materialism", "contradicts", "Idealism");
  createEdge("Logical Positivism", "contradicts", "Metaphysics");
  createEdge("Universal Grammar", "contradicts", "Empirical Naturalism");
  createEdge("Game Theory", "contradicts", "Free Will");
  createEdge("Computability Theory", "contradicts", "Mathematical Infinity");
  createEdge("Information Theory", "contradicts", "Philosophical Absurdism");
  createEdge("Modal Realism", "contradicts", "anti-realism");

  /// INFLUENCE LIST
  // Theory of Forms influences
  createEdge(
    "theory of forms",
    "influenced",
    "Augustine",
    "developed",
    "Christian Platonism"
  );
  createEdge(
    "theory of forms",
    "influenced",
    "Plotinus",
    "developed",
    "Neoplatonism"
  );
  createEdge(
    "theory of forms",
    "influenced",
    "Kant",
    "developed",
    "transcendental idealism"
  );

  // Formal Logic influences
  createEdge(
    "formal logic",
    "influenced",
    "Leibniz",
    "developed",
    "symbolic logic"
  );
  createEdge(
    "formal logic",
    "influenced",
    "Frege",
    "developed",
    "predicate logic"
  );
  createEdge(
    "formal logic",
    "influenced",
    "Russell",
    "developed",
    "type theory"
  );

  // Calculus influences
  createEdge(
    "calculus",
    "influenced",
    "Euler",
    "developed",
    "mathematical analysis"
  );
  createEdge(
    "calculus",
    "influenced",
    "Lagrange",
    "developed",
    "analytical mechanics"
  );
  createEdge(
    "calculus",
    "influenced",
    "Gauss",
    "developed",
    "differential geometry"
  );

  // Set Theory influences
  createEdge(
    "set theory",
    "influenced",
    "Gödel",
    "developed",
    "incompleteness theorems"
  );
  createEdge(
    "set theory",
    "influenced",
    "von Neumann",
    "developed",
    "game theory"
  );
  createEdge(
    "set theory",
    "influenced",
    "Bourbaki",
    "developed",
    "abstract algebra"
  );

  // Phenomenological Method influences
  createEdge(
    "phenomenological method",
    "influenced",
    "Heidegger",
    "developed",
    "fundamental ontology"
  );
  createEdge(
    "phenomenological method",
    "influenced",
    "Sartre",
    "developed",
    "existential phenomenology"
  );
  createEdge(
    "phenomenological method",
    "influenced",
    "Merleau-Ponty",
    "developed",
    "phenomenology of perception"
  );

  // Historical Materialism influences
  createEdge(
    "historical materialism",
    "influenced",
    "Lenin",
    "developed",
    "theory of imperialism"
  );
  createEdge(
    "historical materialism",
    "influenced",
    "Gramsci",
    "developed",
    "cultural hegemony theory"
  );
  createEdge(
    "historical materialism",
    "influenced",
    "Althusser",
    "developed",
    "structural Marxism"
  );

  // Pragmatism influences
  createEdge(
    "pragmatism",
    "influenced",
    "James",
    "developed",
    "radical empiricism"
  );
  createEdge(
    "pragmatism",
    "influenced",
    "Dewey",
    "developed",
    "instrumentalism"
  );
  createEdge("pragmatism", "influenced", "Rorty", "developed", "neopragmatism");

  // Boolean Algebra influences
  createEdge(
    "boolean algebra",
    "influenced",
    "Shannon",
    "developed",
    "information theory"
  );
  createEdge(
    "boolean algebra",
    "influenced",
    "Turing",
    "developed",
    "computability theory"
  );
  createEdge(
    "boolean algebra",
    "influenced",
    "von Neumann",
    "developed",
    "computer architecture"
  );

  // Computability Theory influences
  createEdge(
    "computability theory",
    "influenced",
    "Church",
    "developed",
    "lambda calculus"
  );
  createEdge(
    "computability theory",
    "influenced",
    "Kleene",
    "developed",
    "recursive function theory"
  );
  createEdge(
    "computability theory",
    "influenced",
    "Post",
    "developed",
    "formal language theory"
  );

  // Speech Act Theory influences
  createEdge(
    "speech act theory",
    "influenced",
    "Searle",
    "developed",
    "social reality theory"
  );
  createEdge(
    "speech act theory",
    "influenced",
    "Habermas",
    "developed",
    "communicative action theory"
  );
  createEdge(
    "speech act theory",
    "influenced",
    "Butler",
    "developed",
    "performativity theory"
  );

  // Written works
  createEdge("The Republic", "wrote", "Plato", "influenced", "City of God");
  createEdge(
    "Metaphysics",
    "wrote",
    "Aristotle",
    "influenced",
    "Summa Theologica"
  );
  createEdge("Physics", "wrote", "Aristotle", "influenced", "On the Heavens");
  createEdge(
    "Elements",
    "wrote",
    "Euclid",
    "influenced",
    "Principia Mathematica"
  );
  // Medieval Philosophy
  createEdge(
    "Confessions",
    "wrote",
    "Augustine",
    "influenced",
    "Summa Theologica"
  );
  createEdge("City of God", "wrote", "Augustine", "influenced", "Pensées");
  createEdge("Summa Theologica", "wrote", "Aquinas", "influenced", "Ethics");
  // Early Modern Philosophy
  createEdge("Meditations", "wrote", "Descartes", "influenced", "Ethics");
  createEdge(
    "Discourse on Method",
    "wrote",
    "Descartes",
    "influenced",
    "Monadology"
  );
  createEdge(
    "Ethics",
    "wrote",
    "Spinoza",
    "influenced",
    "Critique of Pure Reason"
  );
  createEdge(
    "Monadology",
    "wrote",
    "Leibniz",
    "influenced",
    "Critique of Pure Reason"
  );
  // Mathematics and Physics
  createEdge(
    "Principia Mathematica",
    "wrote",
    "Newton",
    "influenced",
    "Theory of Relativity"
  );
  createEdge(
    "Elements",
    "wrote",
    "Euclid",
    "influenced",
    "Principia Mathematica"
  );
  createEdge(
    "Begriffsschrift",
    "wrote",
    "Frege",
    "influenced",
    "Principia Mathematica"
  );
  createEdge(
    "Theory of Relativity",
    "wrote",
    "Einstein",
    "influenced",
    "A Brief History of Time"
  );
  // Enlightenment Philosophy
  createEdge(
    "Essay Concerning Human Understanding",
    "wrote",
    "Locke",
    "influenced",
    "Treatise of Human Nature"
  );
  createEdge(
    "Treatise of Human Nature",
    "wrote",
    "Hume",
    "influenced",
    "Critique of Pure Reason"
  );
  createEdge(
    "Critique of Pure Reason",
    "wrote",
    "Kant",
    "influenced",
    "Phenomenology of Spirit"
  );
  // Modern Philosophy
  createEdge(
    "Phenomenology of Spirit",
    "wrote",
    "Hegel",
    "influenced",
    "Being and Time"
  );
  createEdge(
    "Fear and Trembling",
    "wrote",
    "Kierkegaard",
    "influenced",
    "Being and Time"
  );
  createEdge(
    "Thus Spoke Zarathustra",
    "wrote",
    "Nietzsche",
    "influenced",
    "Being and Nothingness"
  );
  // Logic and Mathematics
  createEdge(
    "Principia Mathematica",
    "wrote",
    "Russell",
    "influenced",
    "Tractatus"
  );
  createEdge(
    "Tractatus",
    "wrote",
    "Wittgenstein",
    "influenced",
    "Logical Investigations"
  );
  createEdge(
    "Incompleteness Theorems",
    "wrote",
    "Gödel",
    "influenced",
    "Computing Machinery and Intelligence"
  );
  // 20th Century Philosophy
  createEdge(
    "Logical Investigations",
    "wrote",
    "Husserl",
    "influenced",
    "Being and Time"
  );
  createEdge(
    "Being and Time",
    "wrote",
    "Heidegger",
    "influenced",
    "Being and Nothingness"
  );
  createEdge(
    "Being and Nothingness",
    "wrote",
    "Sartre",
    "influenced",
    "The Second Sex"
  );
  // Islamic Philosophy
  createEdge(
    "The Virtuous City",
    "wrote",
    "Al-Farabi",
    "influenced",
    "The Book of Healing"
  );
  createEdge(
    "The Book of Healing",
    "wrote",
    "Avicenna",
    "influenced",
    "The Incoherence of the Philosophers"
  );
  createEdge(
    "Guide for the Perplexed",
    "wrote",
    "Maimonides",
    "influenced",
    "Ethics"
  );
  // Contemporary Philosophy
  createEdge(
    "Word and Object",
    "wrote",
    "Quine",
    "influenced",
    "Truth and Meaning"
  );
  createEdge(
    "A Theory of Justice",
    "wrote",
    "Rawls",
    "influenced",
    "Anarchy, State, and Utopia"
  );
  createEdge(
    "Naming and Necessity",
    "wrote",
    "Kripke",
    "influenced",
    "On the Plurality of Worlds"
  );

  createEdge("Euler", "invented", "topology");
  createEdge("Lagrange", "invented", "calculus of variations");
  createEdge("Hamilton", "invented", "quaternions");
  createEdge("Galois", "invented", "group theory");
  createEdge("Cauchy", "invented", "complex analysis");
  createEdge("Boltzmann", "invented", "statistical mechanics");
  createEdge("Planck", "invented", "quantum theory");
  createEdge("Dirac", "invented", "quantum electrodynamics");
  createEdge("von Neumann", "invented", "quantum logic");
  createEdge("Shannon", "invented", "information theory");

  // Philosophical Systems
  createEdge("Schelling", "invented", "nature philosophy");
  createEdge("Dilthey", "invented", "hermeneutics");
  createEdge("Bergson", "invented", "Vitalism");
  createEdge("Whitehead", "invented", "process philosophy");
  createEdge("Gadamer", "invented", "philosophical hermeneutics");
  createEdge("Levinas", "invented", "ethics of alterity");
  createEdge("Deleuze", "invented", "difference philosophy");
  createEdge("Rawls", "invented", "veil of ignorance");
  createEdge("Davidson", "invented", "anomalous monism");
  createEdge("Dennett", "invented", "multiple drafts model");

  // Institutional Influences
  createEdge("Humboldt", "influenced", "Berlin University");
  createEdge("Ranke", "influenced", "Historical School");
  createEdge("Weber", "influenced", "German Sociology");
  createEdge("Durkheim", "influenced", "French Sociology");
  createEdge("Brentano", "influenced", "Austrian School");
  createEdge("Menger", "influenced", "Economic Theory");
  createEdge("Bohr", "influenced", "Copenhagen School");
  createEdge("Schlick", "influenced", "Vienna Circle");
  createEdge("Russell", "influenced", "Cambridge School");
  createEdge("Dewey", "influenced", "American Education");

  // Scientific Theories Adopted
  createEdge("Maxwell", "adopted", "field theory");
  createEdge("Helmholtz", "adopted", "energy conservation");
  createEdge("Mendeleev", "adopted", "periodic law");
  createEdge("Pasteur", "adopted", "germ theory");
  createEdge("Wegener", "adopted", "continental drift");
  createEdge("Hubble", "adopted", "expanding universe");
  createEdge("Pauling", "adopted", "chemical bond theory");
  createEdge("Morgan", "adopted", "chromosome theory");
  createEdge("Schrödinger", "adopted", "wave mechanics");
  createEdge("Heisenberg", "adopted", "matrix mechanics");

  // Philosophical Methods
  createEdge("Schleiermacher", "invented", "modern hermeneutics");
  createEdge("Brentano", "invented", "descriptive psychology");
  createEdge("Dilthey", "invented", "human sciences methodology");
  createEdge("Peirce", "invented", "semiotics");
  createEdge("Cassirer", "invented", "philosophy of symbolic forms");
  createEdge("Bachelard", "invented", "epistemological break");
  createEdge("Althusser", "invented", "structural marxism");
  createEdge("Habermas", "invented", "communicative rationality");
  createEdge("Polanyi", "invented", "personal knowledge");
  createEdge("Kuhn", "invented", "paradigm shift");

  // Mathematical Innovations
  createEdge("Grassmann", "invented", "linear algebra");
  createEdge("Dedekind", "invented", "real numbers theory");
  createEdge("Peano", "invented", "arithmetic axioms");
  createEdge("Hausdorff", "invented", "topological spaces");
  createEdge("Hilbert", "invented", "formalism");
  createEdge("Brouwer", "invented", "intuitionism");
  createEdge("Gödel", "invented", "completeness theorem");
  createEdge("von Neumann", "invented", "computer architecture");
  createEdge("Kolmogorov", "invented", "probability axioms");
  createEdge("Mandelbrot", "invented", "fractal geometry");

  // Scientific Methods
  createEdge("Bernard", "invented", "experimental medicine");
  createEdge("Fisher", "invented", "statistical significance");
  createEdge("Popper", "invented", "falsificationism");
  createEdge("von Bertalanffy", "invented", "general systems theory");
  createEdge("Wiener", "invented", "cybernetics");
  createEdge("Shannon", "invented", "communication theory");
  createEdge("Turing", "invented", "computing machine");
  createEdge("Bourbaki", "invented", "structural mathematics");
  createEdge("Chomsky", "invented", "generative grammar");
  createEdge("Simon", "invented", "artificial intelligence");

  // Logical Developments
  createEdge("De Morgan", "invented", "logical relations");
  createEdge("Peirce", "invented", "quantification logic");
  createEdge("Schröder", "invented", "algebraic logic");
  createEdge("Frege", "invented", "concept script");
  createEdge("Russell", "invented", "logical atomism");
  createEdge("Tarski", "invented", "semantic theory");
  createEdge("Gentzen", "invented", "natural deduction");
  createEdge("Church", "invented", "lambda calculus");
  createEdge("Kleene", "invented", "recursive functions");
  createEdge("Kripke", "invented", "modal semantics");

  // Adopted Methodologies
  createEdge("Comte", "adopted", "positivism");
  createEdge("Mill", "adopted", "empiricism");
  createEdge("Dilthey", "adopted", "historicism");
  createEdge("Brentano", "adopted", "intentionality");
  createEdge("Peirce", "adopted", "fallibilism");
  createEdge("James", "adopted", "radical empiricism");
  createEdge("Husserl", "adopted", "phenomenology");
  createEdge("Cassirer", "adopted", "neo-kantianism");
  createEdge("Carnap", "adopted", "logical empiricism");
  createEdge("Quine", "adopted", "naturalism");

  // School Formations
  createEdge("Schlick", "influenced", "Vienna Circle");
  createEdge("Adorno", "influenced", "Frankfurt School");
  createEdge("Wittgenstein", "influenced", "Cambridge School");
  createEdge("Brentano", "influenced", "Phenomenology");
  createEdge("Peirce", "influenced", "Pragmaticism");
  createEdge("Husserl", "influenced", "Phenomenological Movement");
  createEdge("Russell", "influenced", "Logical Atomism");
  createEdge("Bohr", "influenced", "Copenhagen Interpretation");
  createEdge("Saussure", "influenced", "Structuralism");
  createEdge("Derrida", "influenced", "Deconstruction");

  // Scientific Works
  createEdge("Darwin", "wrote", "Origin of Species");
  createEdge("Newton", "wrote", "Principia");
  createEdge("Einstein", "wrote", "Relativity");
  createEdge("Maxwell", "wrote", "Electromagnetic Theory");
  createEdge("Mendel", "wrote", "Laws of Inheritance");
  createEdge("Galileo", "wrote", "Two New Sciences");
  createEdge("Copernicus", "wrote", "De revolutionibus");
  createEdge("Lavoisier", "wrote", "Elements of Chemistry");
  createEdge("Harvey", "wrote", "De Motu Cordis");
  createEdge("Vesalius", "wrote", "De Humani Corporis Fabrica");

  // Ancient to Medieval Transitions
  createEdge("Plato", "wrote", "Forms", "influenced", "Divine Illumination");
  createEdge("Aristotle", "wrote", "Physics", "influenced", "Natural Law");
  createEdge(
    "Euclid",
    "wrote",
    "Elements",
    "influenced",
    "Mathematical Physics"
  );
  createEdge(
    "Democritus",
    "wrote",
    "Atomism",
    "influenced",
    "Corpuscular Theory"
  );
  createEdge(
    "Pythagoras",
    "wrote",
    "Number Mysticism",
    "influenced",
    "Celestial Harmony"
  );

  // Medieval Developments
  createEdge(
    "Augustine",
    "wrote",
    "Divine Illumination",
    "influenced",
    "Rational Faith"
  );
  createEdge(
    "Avicenna",
    "wrote",
    "Islamic Rationalism",
    "influenced",
    "Thomistic Synthesis"
  );
  createEdge(
    "Averroes",
    "wrote",
    "Rational Islam",
    "influenced",
    "Natural Theology"
  );
  createEdge(
    "Maimonides",
    "wrote",
    "Guide for the Perplexed",
    "influenced",
    "Rational Theology"
  );
  createEdge(
    "Aquinas",
    "wrote",
    "Summa Theologica",
    "influenced",
    "Natural Law"
  );

  // Renaissance to Early Modern
  createEdge(
    "Copernicus",
    "wrote",
    "Heliocentrism",
    "influenced",
    "Universal Mechanics"
  );
  createEdge(
    "Galileo",
    "wrote",
    "Mathematical Physics",
    "influenced",
    "Principia Mathematica"
  );
  createEdge(
    "Bacon",
    "wrote",
    "Empirical Method",
    "influenced",
    "Royal Society"
  );
  createEdge(
    "Boyle",
    "wrote",
    "Corpuscular Theory",
    "influenced",
    "Universal Mechanics"
  );
  createEdge(
    "Newton",
    "wrote",
    "Universal Mechanics",
    "influenced",
    "Determinism"
  );

  // Modern Philosophy Development
  createEdge(
    "Descartes",
    "wrote",
    "Meditations",
    "influenced",
    "Rational Dualism"
  );
  createEdge("Spinoza", "wrote", "Ethics", "influenced", "Rational Monism");
  createEdge(
    "Leibniz",
    "wrote",
    "Monadology",
    "influenced",
    "Universal Harmony"
  );
  createEdge(
    "Locke",
    "wrote",
    "Essay Concerning Human Understanding",
    "influenced",
    "Empiricism"
  );
  createEdge(
    "Hume",
    "wrote",
    "Treatise of Human Nature",
    "influenced",
    "Skepticism"
  );

  // German Idealism and Its Legacy
  createEdge(
    "Kant",
    "wrote",
    "Critique of Pure Reason",
    "influenced",
    "Transcendental Idealism"
  );
  createEdge(
    "Hegel",
    "wrote",
    "Phenomenology of Spirit",
    "influenced",
    "Dialectical Method"
  );
  createEdge(
    "Schopenhauer",
    "wrote",
    "World as Will",
    "influenced",
    "Will to Power"
  );
  createEdge(
    "Heidegger",
    "wrote",
    "Being and Time",
    "influenced",
    "Existentialism"
  );
  createEdge(
    "Sartre",
    "wrote",
    "Being and Nothingness",
    "influenced",
    "Existential Phenomenology"
  );

  // Mathematical Foundations
  createEdge(
    "Newton",
    "wrote",
    "calculus",
    "influenced",
    "analytical mechanics"
  );
  createEdge(
    "Lagrange",
    "wrote",
    "analytical mechanics",
    "influenced",
    "field theory"
  );
  createEdge(
    "Riemann",
    "wrote",
    "non-euclidean geometry",
    "influenced",
    "Relativity"
  );
  createEdge(
    "Cantor",
    "wrote",
    "set theory",
    "influenced",
    "Mathematical Infinity"
  );
  createEdge("Frege", "wrote", "predicate logic", "influenced", "type theory");

  // Scientific Theory Development
  createEdge(
    "Maxwell",
    "wrote",
    "Electromagnetic Theory",
    "influenced",
    "field theory"
  );
  createEdge(
    "Einstein",
    "wrote",
    "Special Relativity",
    "influenced",
    "Quantum Theory"
  );
  createEdge(
    "Planck",
    "wrote",
    "Quantum Theory",
    "influenced",
    "Wave Mechanics"
  );
  createEdge(
    "Schrödinger",
    "wrote",
    "Wave Mechanics",
    "influenced",
    "Quantum Electrodynamics"
  );
  createEdge(
    "Darwin",
    "wrote",
    "Natural Selection",
    "influenced",
    "evolutionary theory"
  );

  // Logic and Computation
  createEdge(
    "Frege",
    "wrote",
    "Begriffsschrift",
    "influenced",
    "Principia Mathematica"
  );
  createEdge(
    "Russell",
    "wrote",
    "Principia Mathematica",
    "influenced",
    "logical atomism"
  );
  createEdge(
    "Gödel",
    "wrote",
    "incompleteness theorems",
    "influenced",
    "computability theory"
  );
  createEdge(
    "Church",
    "wrote",
    "lambda calculus",
    "influenced",
    "computer science"
  );
  createEdge(
    "Turing",
    "wrote",
    "Turing machine",
    "influenced",
    "computer architecture"
  );

  // Contemporary Philosophy
  createEdge(
    "Carnap",
    "wrote",
    "logical positivism",
    "influenced",
    "verificationism"
  );
  createEdge(
    "Quine",
    "wrote",
    "Word and Object",
    "influenced",
    "naturalized epistemology"
  );
  createEdge(
    "Kuhn",
    "wrote",
    "Structure of Scientific Revolutions",
    "influenced",
    "paradigm theory"
  );
  createEdge(
    "Lakatos",
    "wrote",
    "research programmes",
    "influenced",
    "Philosophy of Science"
  );
  createEdge(
    "Foucault",
    "wrote",
    "genealogical method",
    "influenced",
    "post-structuralism"
  );

  // Social and Psychological Theory
  createEdge(
    "Marx",
    "wrote",
    "historical materialism",
    "influenced",
    "critical theory"
  );
  createEdge(
    "Lévi-Strauss",
    "wrote",
    "structural anthropology",
    "influenced",
    "structuralism"
  );
  createEdge(
    "Freud",
    "wrote",
    "psychoanalysis",
    "influenced",
    "depth psychology"
  );
  createEdge(
    "Jung",
    "wrote",
    "collective unconscious",
    "influenced",
    "archetypal psychology"
  );
  createEdge("Weber", "wrote", "social theory", "influenced", "sociology");

  // Information and Systems
  createEdge(
    "Wiener",
    "wrote",
    "cybernetics",
    "influenced",
    "information theory"
  );
  createEdge(
    "Shannon",
    "wrote",
    "information theory",
    "influenced",
    "computer science"
  );
  createEdge(
    "von Bertalanffy",
    "wrote",
    "general systems theory",
    "influenced",
    "cybernetics"
  );
  createEdge(
    "von Neumann",
    "wrote",
    "game theory",
    "influenced",
    "decision theory"
  );
  createEdge(
    "Turing",
    "wrote",
    "artificial intelligence",
    "influenced",
    "computer science"
  );

  // Language and Mind
  createEdge(
    "Chomsky",
    "wrote",
    "universal grammar",
    "influenced",
    "cognitive science"
  );
  createEdge(
    "Austin",
    "wrote",
    "speech acts",
    "influenced",
    "philosophy of language"
  );
  createEdge(
    "Wittgenstein",
    "wrote",
    "private language argument",
    "influenced",
    "ordinary language philosophy"
  );
  createEdge(
    "Descartes",
    "wrote",
    "mind-body dualism",
    "influenced",
    "philosophy of mind"
  );
  createEdge(
    "Putnam",
    "wrote",
    "functionalism",
    "influenced",
    "cognitive science"
  );

  /// FILLER?
  // Byzantine and Islamic Scholarship
  createEdge("John of Damascus", "influenced", "Byzantine Scholars");
  createEdge("Michael Psellos", "developed", "Byzantine Philosophy");
  createEdge("Ibn al-Haytham", "wrote", "Book of Optics");
  createEdge("Jabir ibn Hayyan", "influenced", "Latin Alchemists");
  createEdge(
    "Al-Farabi",
    "wrote",
    "The Virtuous City",
    "influenced",
    "Political Philosophy"
  );

  // Renaissance Humanism
  createEdge("Manuel Chrysoloras", "influenced", "Italian Humanists");
  createEdge("Marsilio Ficino", "developed", "Platonic Christianity");
  createEdge("Pico della Mirandola", "wrote", "Oration on Human Dignity");
  createEdge(
    "Nicholas of Cusa",
    "wrote",
    "Learned Ignorance",
    "influenced",
    "Renaissance Science"
  );
  createEdge("Gemistus Pletho", "influenced", "Italian Renaissance");

  // Early Modern Science
  createEdge("Paracelsus", "developed", "Medical Chemistry");
  createEdge("van Helmont", "developed", "Gas Theory");
  createEdge("William Gilbert", "wrote", "De Magnete");
  createEdge(
    "Mersenne",
    "wrote",
    "Harmonie Universelle",
    "influenced",
    "Acoustics"
  );
  createEdge("Gassendi", "adopted", "Atomism");

  // Mathematics Development
  createEdge("Hamilton", "invented", "quaternions");
  createEdge("Galois", "invented", "group theory");
  createEdge("Grassmann", "invented", "linear algebra");
  createEdge(
    "Riemann",
    "wrote",
    "On the Hypotheses which lie at the Bases of Geometry",
    "influenced",
    "non-euclidean geometry"
  );
  createEdge("Hausdorff", "developed", "topological spaces");

  // Modern Physics
  createEdge("de Broglie", "invented", "wave-particle duality");
  createEdge("Pauli", "invented", "exclusion principle");
  createEdge("Dirac", "developed", "quantum electrodynamics");
  createEdge(
    "Bohr",
    "wrote",
    "Copenhagen Interpretation",
    "influenced",
    "Quantum Theory"
  );
  createEdge("Yukawa", "invented", "meson theory");

  // Computer Science and Cybernetics
  createEdge("Babbage", "invented", "difference engine");
  createEdge("Lovelace", "developed", "computer programming");
  createEdge(
    "Wiener",
    "wrote",
    "Cybernetics",
    "influenced",
    "information theory"
  );
  createEdge("von Bertalanffy", "developed", "general systems theory");
  createEdge("Backus", "invented", "FORTRAN");

  // Philosophy of Science
  createEdge("Bachelard", "invented", "epistemological break");
  createEdge(
    "Lakatos",
    "wrote",
    "research programmes",
    "influenced",
    "Philosophy of Science"
  );
  createEdge("Schlick", "developed", "logical empiricism");
  createEdge("Cassirer", "developed", "philosophy of symbolic forms");
  createEdge(
    "Kuhn",
    "wrote",
    "paradigm theory",
    "influenced",
    "scientific revolution concept"
  );

  // Logic and Semantics
  createEdge("Tarski", "invented", "semantic theory of truth");
  createEdge("Gentzen", "invented", "natural deduction");
  createEdge(
    "Kripke",
    "wrote",
    "Naming and Necessity",
    "influenced",
    "modal semantics"
  );
  createEdge("Grice", "developed", "conversational implicature");
  createEdge("Dummett", "developed", "anti-realism");

  // Social Sciences
  createEdge("Malinowski", "developed", "functionalist anthropology");
  createEdge("Radcliffe-Brown", "developed", "structural functionalism");
  createEdge(
    "Saussure",
    "wrote",
    "Course in General Linguistics",
    "influenced",
    "Structuralism"
  );
  createEdge("Boas", "developed", "cultural relativism");
  createEdge("Weber", "developed", "social theory");

  // Contemporary Philosophy
  createEdge(
    "Rawls",
    "wrote",
    "A Theory of Justice",
    "influenced",
    "political philosophy"
  );
  createEdge("Putnam", "developed", "functionalism");
  createEdge(
    "Chomsky",
    "wrote",
    "Syntactic Structures",
    "influenced",
    "universal grammar"
  );
  createEdge("Lewis", "developed", "modal realism");
  createEdge("Deleuze", "invented", "difference philosophy");

  // Specialized Scientific Developments
  createEdge("Boltzmann", "developed", "statistical mechanics");
  createEdge("Chandrasekhar", "developed", "stellar evolution theory");
  createEdge(
    "Penrose",
    "wrote",
    "twistor theory",
    "influenced",
    "quantum gravity"
  );
  createEdge("Mandelbrot", "invented", "fractal geometry");
  createEdge("Bernard", "developed", "experimental medicine");

  // Philosophical Methodologies
  createEdge("Dilthey", "developed", "human sciences methodology");
  createEdge("Gadamer", "developed", "philosophical hermeneutics");
  createEdge(
    "Levinas",
    "wrote",
    "Totality and Infinity",
    "influenced",
    "ethics of alterity"
  );
  createEdge("Schleiermacher", "developed", "modern hermeneutics");
  createEdge("Bergson", "developed", "Vitalism");
  // More filler
  // Byzantine and Islamic Scholarship
  createEdge("John of Damascus", "influenced", "Byzantine Scholars");
  createEdge("Michael Psellos", "developed", "Byzantine Philosophy");
  createEdge("Ibn al-Haytham", "wrote", "Book of Optics");
  createEdge("Jabir ibn Hayyan", "influenced", "Latin Alchemists");
  createEdge(
    "Al-Farabi",
    "wrote",
    "The Virtuous City",
    "influenced",
    "Political Philosophy"
  );

  // Renaissance Humanism
  createEdge("Manuel Chrysoloras", "influenced", "Italian Humanists");
  createEdge("Marsilio Ficino", "developed", "Platonic Christianity");
  createEdge("Pico della Mirandola", "wrote", "Oration on Human Dignity");
  createEdge(
    "Nicholas of Cusa",
    "wrote",
    "Learned Ignorance",
    "influenced",
    "Renaissance Science"
  );
  createEdge("Gemistus Pletho", "influenced", "Italian Renaissance");

  // Early Modern Science
  createEdge("Paracelsus", "developed", "Medical Chemistry");
  createEdge("van Helmont", "developed", "Gas Theory");
  createEdge("William Gilbert", "wrote", "De Magnete");
  createEdge(
    "Mersenne",
    "wrote",
    "Harmonie Universelle",
    "influenced",
    "Acoustics"
  );
  createEdge("Gassendi", "adopted", "Atomism");

  // Mathematics Development
  createEdge("Hamilton", "invented", "quaternions");
  createEdge("Galois", "invented", "group theory");
  createEdge("Grassmann", "invented", "linear algebra");
  createEdge(
    "Riemann",
    "wrote",
    "On the Hypotheses which lie at the Bases of Geometry",
    "influenced",
    "non-euclidean geometry"
  );
  createEdge("Hausdorff", "developed", "topological spaces");

  // Modern Physics
  createEdge("de Broglie", "invented", "wave-particle duality");
  createEdge("Pauli", "invented", "exclusion principle");
  createEdge("Dirac", "developed", "quantum electrodynamics");
  createEdge(
    "Bohr",
    "wrote",
    "Copenhagen Interpretation",
    "influenced",
    "Quantum Theory"
  );
  createEdge("Yukawa", "invented", "meson theory");

  // Computer Science and Cybernetics
  createEdge("Babbage", "invented", "difference engine");
  createEdge("Lovelace", "developed", "computer programming");
  createEdge(
    "Wiener",
    "wrote",
    "Cybernetics",
    "influenced",
    "information theory"
  );
  createEdge("von Bertalanffy", "developed", "general systems theory");
  createEdge("Backus", "invented", "FORTRAN");

  // Philosophy of Science
  createEdge("Bachelard", "invented", "epistemological break");
  createEdge(
    "Lakatos",
    "wrote",
    "research programmes",
    "influenced",
    "Philosophy of Science"
  );
  createEdge("Schlick", "developed", "logical empiricism");
  createEdge("Cassirer", "developed", "philosophy of symbolic forms");
  createEdge(
    "Kuhn",
    "wrote",
    "paradigm theory",
    "influenced",
    "scientific revolution concept"
  );

  // Logic and Semantics
  createEdge("Tarski", "invented", "semantic theory of truth");
  createEdge("Gentzen", "invented", "natural deduction");
  createEdge(
    "Kripke",
    "wrote",
    "Naming and Necessity",
    "influenced",
    "modal semantics"
  );
  createEdge("Grice", "developed", "conversational implicature");
  createEdge("Dummett", "developed", "anti-realism");

  // Social Sciences
  createEdge("Malinowski", "developed", "functionalist anthropology");
  createEdge("Radcliffe-Brown", "developed", "structural functionalism");
  createEdge(
    "Saussure",
    "wrote",
    "Course in General Linguistics",
    "influenced",
    "Structuralism"
  );
  createEdge("Boas", "developed", "cultural relativism");
  createEdge("Weber", "developed", "social theory");

  // Contemporary Philosophy
  createEdge(
    "Rawls",
    "wrote",
    "A Theory of Justice",
    "influenced",
    "political philosophy"
  );
  createEdge("Putnam", "developed", "functionalism");
  createEdge(
    "Chomsky",
    "wrote",
    "Syntactic Structures",
    "influenced",
    "universal grammar"
  );
  createEdge("Lewis", "developed", "modal realism");
  createEdge("Deleuze", "invented", "difference philosophy");

  // Specialized Scientific Developments
  createEdge("Boltzmann", "developed", "statistical mechanics");
  createEdge("Chandrasekhar", "developed", "stellar evolution theory");
  createEdge(
    "Penrose",
    "wrote",
    "twistor theory",
    "influenced",
    "quantum gravity"
  );
  createEdge("Mandelbrot", "invented", "fractal geometry");
  createEdge("Bernard", "developed", "experimental medicine");

  // Philosophical Methodologies
  createEdge("Dilthey", "developed", "human sciences methodology");
  createEdge("Gadamer", "developed", "philosophical hermeneutics");
  createEdge(
    "Levinas",
    "wrote",
    "Totality and Infinity",
    "influenced",
    "ethics of alterity"
  );
  createEdge("Schleiermacher", "developed", "modern hermeneutics");
  createEdge("Bergson", "developed", "Vitalism");

  const setTypeOnEntities = (entityIds: string[], type: string) => {
    for (const entity of graph.maybeGetEntities(entityIds)) {
      entity.setType(type);
    }
  };

  const setTagOnEntities = (entityIds: string[], tag: string) => {
    for (const entity of graph.maybeGetEntities(entityIds)) {
      entity.addTag(tag);
    }
  };

  // set type on entities
  // Persons - Historical figures, philosophers, scientists
  setTypeOnEntities(
    [
      "Al-Farabi",
      "Al-Ghazali",
      "Al-Khwarizmi",
      "Al-Kindi",
      "Albertus Magnus",
      "Alexander the Great",
      "Aristotle",
      "Augustine",
      "Averroes",
      "Avicenna",
      "Bacon",
      "Berkeley",
      "Bohr",
      "Boltzmann",
      "Copernicus",
      "Darwin",
      "Descartes",
      "Einstein",
      "Euclid",
      "Euler",
      "Fermi",
      "Fibonacci",
      "Galileo",
      "Gauss",
      "Gödel",
      "Hawking",
      "Heisenberg",
      "Hume",
      "Kant",
      "Kepler",
      "Leibniz",
      "Locke",
      "Maxwell",
      "Newton",
      "Nietzsche",
      "Pascal",
      "Plato",
      "Ptolemy",
      "Pythagoras",
      "Russell",
      "Sartre",
      "Schrödinger",
      "Turing",
      "von Neumann",
    ],
    "person"
  );
  // Ideas - Philosophical and scientific concepts
  setTypeOnEntities(
    [
      "Atomism",
      "Determinism",
      "Dualism",
      "Empiricism",
      "Free Will",
      "Idealism",
      "Materialism",
      "Monism",
      "Nominalism",
      "Rationalism",
      "Realism",
      "Relativism",
      "Skepticism",
      "Structuralism",
      "Transcendental Idealism",
      "Vitalism",
    ],
    "idea"
  );
  // Fields - Academic and scientific disciplines
  // graph.createNodeIfMissing("Mathematics", { type: "field" });
  setTypeOnEntities(
    [
      "Acoustics",
      "Cybernetics",
      "Mathematics",
      "Physics",
      "Logic",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Information Theory",
      "Quantum Theory",
      "Statistics",
      "Topology",
      "Game Theory",
      "Set Theory",
      "Number Theory",
    ],
    "field"
  );
  // Written Works - Books and publications
  setTypeOnEntities(
    [
      "A Brief History of Time",
      "Being and Time",
      "Critique of Pure Reason",
      "Ethics",
      "Principia Mathematica",
      "The Republic",
      "Thus Spoke Zarathustra",
      "Tractatus",
      "Computing Machinery and Intelligence",
      "Origin of Species",
    ],
    "written work"
  );
  // Inventions - Technologies and tools
  setTypeOnEntities(
    [
      "Turing machine",
      "Computer architecture",
      "Difference engine",
      "FORTRAN",
      "Boolean algebra",
      "Calculus",
      "Binary number system",
    ],
    "invention"
  );
  // Other - Institutions and organizations
  setTypeOnEntities(
    [
      "Accademia dei Lincei",
      "Berlin Academy",
      "French Academy of Sciences",
      "Royal Society",
      "Vienna Circle",
      "Cambridge School",
      "Copenhagen School",
    ],
    "other"
  );
  setTypeOnEntities(
    [
      "Adorno",
      "Al-Farabi",
      "Al-Ghazali",
      "Al-Khwarizmi",
      "Al-Kindi",
      "Albertus Magnus",
      "Alexander the Great",
      "Althusser",
      "Ampère",
      "Anaxagoras",
      "Anaximander",
      "Anaximenes",
      "Anna Comnena",
      "Anselm",
      "Antisthenes",
      "Apollonius",
      "Aquinas",
      "Archimedes",
      "Archytas",
      "Arethas of Caesarea",
      "Aristippus",
      "Aristotle",
      "Aristoxenus",
      "Augustine",
      "Austin",
      "Averroes",
      "Avicenna",
      "Babbage",
      "Bachelard",
      "Backus",
      "Bacon",
      "Bardeen",
      "Bateson",
      "Bayes",
      "Bergson",
      "Berkeley",
      "Bernard",
      "Bessarion",
      "Boas",
      "Boccaccio",
      "Boethius",
      "Bohr",
      "Boltzmann",
      "Boole",
      "Borelli",
      "Born",
      "Boyle",
      "Brentano",
      "Brouwer",
      "Bruno",
      "Butler",
      "Campbell",
      "Camus",
      "Cantor",
      "Cardinal Richelieu",
      "Carnap",
      "Cassiodorus",
      "Cassirer",
      "Cauchy",
      "Chandrasekhar",
      "Charles II",
      "Chomsky",
      "Chrysippus",
      "Church",
      "Cleanthes",
      "Colbert",
      "Comte",
      "Conway",
      "Cooper",
      "Copernicus",
      "Cosimo de Medici",
      "Crick",
      "Cuvier",
      "Dalton",
      "Dante",
      "Dante Alighieri",
      "Darwin",
      "Davidson",
      "de Broglie",
      "De Morgan",
      "Dedekind",
      "Deleuze",
      "Demetrius of Phalerum",
      "Democritus",
      "Dennett",
      "Derrida",
      "Descartes",
      "Dewey",
      "Dicaearchus",
      "Dijkstra",
      "Dilthey",
      "Diogenes of Sinope",
      "Dirac",
      "Dobzhansky",
      "Dummett",
      "Duns Scotus",
      "Durkheim",
      "Einstein",
      "Empedocles",
      "Epicurus",
      "Erasistratus",
      "Erasmus",
      "Euclid",
      "Eudoxus",
      "Euler",
      "Eustathius of Thessalonica",
      "Fabricius",
      "Faraday",
      "Fermi",
      "Feyerabend",
      "Feynman",
      "Fibonacci",
      "Fichte",
      "Fisher",
      "Foucault",
      "Fourier",
      "Francesco Guicciardini",
      "Francis Bacon",
      "Frederick I",
      "Frege",
      "Freud",
      "Gadamer",
      "Galen",
      "Galileo",
      "Galois",
      "Gassendi",
      "Gauss",
      "Gell-Mann",
      "Gemistus Pletho",
      "Gentzen",
      "George of Trebizond",
      "Giacomo Zabarella",
      "Glashow",
      "Gramsci",
      "Grassmann",
      "Grice",
      "Gödel",
      "Habermas",
      "Halley",
      "Hamilton",
      "Hamming",
      "Harvey",
      "Hausdorff",
      "Hawking",
      "Hegel",
      "Heidegger",
      "Heisenberg",
      "Helmholtz",
      "Henry More",
      "Heraclitus",
      "Hermarchus",
      "Hero of Alexandria",
      "Herophilus",
      "Hertz",
      "Hilbert",
      "Hipparchus",
      "Hippocrates",
      "Hobbes",
      "Hooke",
      "Hubble",
      "Humboldt",
      "Hume",
      "Husserl",
      "Huxley",
      "Huygens",
      "Hypatia",
      "Iamblichus",
      "Ibn al-Haytham",
      "Isidore of Seville",
      "Jabir ibn Hayyan",
      "James",
      "Jean Bodin",
      "John Italus",
      "John Philoponus",
      "John of Damascus",
      "Jordan",
      "Juan Luis Vives",
      "Jung",
      "Kant",
      "Kepler",
      "Keynes",
      "Kierkegaard",
      "Kleene",
      "Kolmogorov",
      "Kripke",
      "Kuhn",
      "Lagrange",
      "Lakatos",
      "Lamarck",
      "Landau",
      "Laplace",
      "Lavoisier",
      "Leibniz",
      "Lenin",
      "Leonardo Bruni",
      "Leonardo Fibonacci",
      "Leucippus",
      "Levinas",
      "Lewis",
      "Locke",
      "Lorenzo Valla",
      "Lovelace",
      "Lucretius",
      "Lyell",
      "Lévi-Strauss",
      "Mach",
      "Machiavelli",
      "Maimonides",
      "Malebranche",
      "Malinowski",
      "Malpighi",
      "Mandelbrot",
      "Manuel Chrysoloras",
      "Marsilio Ficino",
      "Marx",
      "Maxwell",
      "Mayr",
      "McCarthy",
      "Mead",
      "Mendel",
      "Mendeleev",
      "Menger",
      "Merleau-Ponty",
      "Mersenne",
      "Metrodorus of Lampsacus",
      "Michael Psellos",
      "Mill",
      "Minkowski",
      "Minsky",
      "Montaigne",
      "More",
      "Morgan",
      "Muller",
      "Newton",
      "Nicholas of Cusa",
      "Nietzsche",
      "Ockham",
      "Panaetius",
      "Panofsky",
      "Paracelsus",
      "Parmenides",
      "Parsons",
      "Pascal",
      "Pasteur",
      "Paul of Middelburg",
      "Pauli",
      "Pauling",
      "Peano",
      "Peirce",
      "Pelagius",
      "Penrose",
      "Peter Abelard",
      "Peter Lombard",
      "Petrarch",
      "Philolaus",
      "Photius",
      "Pico della Mirandola",
      "Pierre Charron",
      "Pietro Pomponazzi",
      "Planck",
      "Plato",
      "Plotinus",
      "Polanyi",
      "Polemon",
      "Popper",
      "Porphyry",
      "Posidonius",
      "Post",
      "Princess Elisabeth",
      "Proclus",
      "Pseudo-Dionysius",
      "Ptolemy",
      "Putnam",
      "Pythagoras",
      "Radcliffe-Brown",
      "Ranke",
      "Rawls",
      "Regiomontanus",
      "Rheticus",
      "Ricardo",
      "Riemann",
      "Roger Bacon",
      "Roger Cotes",
      "Rorty",
      "Russell",
      "Salutati",
      "Sartre",
      "Saussure",
      "Schelling",
      "Schleiermacher",
      "Schlick",
      "Schopenhauer",
      "Schröder",
      "Schrödinger",
      "Searle",
      "Shannon",
      "Simon",
      "Simplicius",
      "Smith",
      "Socrates",
      "Speusippus",
      "Spinoza",
      "Strato of Lampsacus",
      "Tarski",
      "Thales",
      "Theodorus the Atheist",
      "Theon of Alexandria",
      "Theophrastus",
      "Thomas Aquinas",
      "Thomas More",
      "Torricelli",
      "Turing",
      "Tycho Brahe",
      "van Helmont",
      "Venter",
      "Vesalius",
      "Viviani",
      "Von Bertalanffy",
      "von Neumann",
      "Wallace",
      "Watson",
      "Weber",
      "Wegener",
      "Weinberg",
      "Wheeler",
      "Whitehead",
      "Wiener",
      "William Gilbert",
      "William Harvey",
      "William Roper",
      "William of Ockham",
      "Wittgenstein",
      "Wolff",
      "Wright",
      "Xenocrates",
      "Xenophon",
      "Yukawa",
      "Zabarella",
      "Zeno of Citium",
      "Zeno of Elea",
    ],
    "person"
  );
  setTypeOnEntities(
    [
      "Absolutism",
      "Atomism",
      "Atomistic Hedonism",
      "Christian Aristotelianism",
      "Christian Platonism",
      "Coherentism",
      "Compatibilism",
      "Cosmic Infinity",
      "Cosmic Mind",
      "Determinism",
      "Divine Illumination",
      "Dualism",
      "Empiricism",
      "Essentialism",
      "Eternalism",
      "Ethical Asceticism",
      "Forms",
      "Free Will",
      "Hedonism",
      "Heliocentrism",
      "Historical Materialism",
      "Idealism",
      "Incompatibilism",
      "Internalism",
      "Islamic Occasionalism",
      "Islamic Rationalism",
      "Material Monism",
      "Material Principle",
      "Materialism",
      "Mathematical Platonism",
      "Modal Realism",
      "Monadology",
      "Monism",
      "Natural Law",
      "Natural Selection",
      "Natural Theology",
      "Neo-Aristotelianism",
      "Neoplatonism",
      "Nominalism",
      "Number Mysticism",
      "Particularism",
      "Philosophical Absurdism",
      "Platonic Christianity",
      "Positivism",
      "Pragmaticism",
      "Pragmatism",
      "Presentism",
      "Probabilistic Faith",
      "Rational Dualism",
      "Rational Faith",
      "Rational Islam",
      "Rational Monism",
      "Rational Theology",
      "Rationalism",
      "Realism",
      "Relativism",
      "Skepticism",
      "Structuralism",
      "Substance Monism",
      "Subjective Idealism",
      "Transcendental Idealism",
      "Universal Harmony",
      "Universal Mechanics",
      "Universalism",
      "Verificationism",
      "Vitalism",
      "Will to Power",
      "anomalous monism",
      "anti-realism",
      "cultural relativism",
      "fallibilism",
      "falsificationism",
      "functionalism",
      "historicism",
      "instrumentalism",
      "intentionality",
      "intuitionism",
      "mind-body dualism",
      "naturalism",
      "perspectivism",
      "positivism",
      "process philosophy",
      "radical empiricism",
      "radical interpretation",
      "scientific revolution concept",
      "speech acts",
      "wave-particle duality",
    ],
    "idea"
  );
  setTypeOnEntities(
    [
      "Acoustics",
      "Cybernetics",
      "Economic Theory",
      "Field Theory",
      "Game Theory",
      "Gas Theory",
      "Information Theory",
      "Medical Chemistry",
      "Nuclear Physics",
      "Physics",
      "Political Philosophy",
      "Quantum Electrodynamics",
      "Quantum Theory",
      "Wave Analysis",
      "Wave Mechanics",
      "abstract algebra",
      "algebraic logic",
      "analytical mechanics",
      "archetypal psychology",
      "binary number system",
      "boolean algebra",
      "calculus",
      "calculus of variations",
      "chemical bond theory",
      "chromosome theory",
      "cognitive science",
      "complex analysis",
      "computability theory",
      "computer architecture",
      "computer programming",
      "computer science",
      "conditional probability",
      "cultural hegemony theory",
      "depth psychology",
      "descriptive psychology",
      "differential geometry",
      "formal language theory",
      "formal logic",
      "fractal geometry",
      "functionalist anthropology",
      "fundamental ontology",
      "generative grammar",
      "germ theory",
      "graph theory",
      "group theory",
      "hermeneutics",
      "linear algebra",
      "logical atomism",
      "logical empiricism",
      "logical positivism",
      "matrix mechanics",
      "meson theory",
      "natural deduction",
      "non-euclidean geometry",
      "normal distribution",
      "ordinary language philosophy",
      "paradigm theory",
      "performativity theory",
      "periodic law",
      "phenomenology",
      "predicate logic",
      "probability theory",
      "psychoanalysis",
      "quantum gravity",
      "quantum logic",
      "recursive function theory",
      "semantic theory",
      "semiotics",
      "set theory",
      "social reality theory",
      "social theory",
      "sociology",
      "statistical mechanics",
      "stellar evolution theory",
      "structural anthropology",
      "structural functionalism",
      "structural marxism",
      "symbolic logic",
      "theory of forms",
      "theory of imperialism",
      "topology",
      "twistor theory",
      "type theory",
      "universal grammar",
    ],
    "field"
  );
  setTypeOnEntities(
    [
      "A Brief History of Time",
      "A Theory of Justice",
      "Anarchy, State, and Utopia",
      "Being and Nothingness",
      "Being and Time",
      "Book of Optics",
      "City of God",
      "Computing Machinery and Intelligence",
      "Confessions",
      "Course in General Linguistics",
      "Critique of Pure Reason",
      "De Humani Corporis Fabrica",
      "De Magnete",
      "De Motu Cordis",
      "De revolutionibus",
      "Discourse on Method",
      "Elements",
      "Elements of Chemistry",
      "Essay Concerning Human Understanding",
      "Ethics",
      "Fear and Trembling",
      "Guide for the Perplexed",
      "Harmonie Universelle",
      "Incompleteness Theorems",
      "Language Games",
      "Laws of Inheritance",
      "Learned Ignorance",
      "Logical Investigations",
      "Naming and Necessity",
      "On the Heavens",
      "On the Hypotheses which lie at the Bases of Geometry",
      "On the Plurality of Worlds",
      "Oration on Human Dignity",
      "Origin of Species",
      "Pensées",
      "Phenomenology of Spirit",
      "Principia",
      "Principia Mathematica",
      "Structure of Scientific Revolutions",
      "Summa Theologica",
      "Syntactic Structures",
      "The Book of Healing",
      "The Incoherence of the Philosophers",
      "The Republic",
      "The Second Sex",
      "The Virtuous City",
      "Thus Spoke Zarathustra",
      "Totality and Infinity",
      "Tractatus",
      "Treatise of Human Nature",
      "Truth and Meaning",
      "Two New Sciences",
      "Word and Object",
      "World as Will",
    ],
    "written work"
  );
  setTypeOnEntities(
    [
      "FORTRAN",
      "Turing machine",
      "computing machine",
      "difference engine",
      "Begriffsschrift",
      "Cartesian coordinate system",
      "Corpuscular Theory",
      "Electromagnetic Theory",
      "Electromagnetic Unity",
      "Geocentric System",
      "binary number system",
      "boolean algebra",
      "calculus",
      "concept script",
      "quaternions",
    ],
    "invention"
  );
  setTypeOnEntities(
    [
      "Accademia dei Lincei",
      "Austrian School",
      "Berlin Academy",
      "Berlin University",
      "Byzantine Philosophy",
      "Byzantine Scholars",
      "Cambridge School",
      "Copenhagen Interpretation",
      "Copenhagen School",
      "French Academy",
      "French Academy of Sciences",
      "French Sociology",
      "Frankfurt School",
      "German Sociology",
      "Italian Humanists",
      "Italian Renaissance",
      "Latin Alchemists",
      "Latin Scholastics",
      "Phenomenological Movement",
      "Renaissance Science",
      "Renaissance Scientists",
      "Royal Society",
      "Thomistic Synthesis",
      "Vienna Circle",
    ],
    "other"
  );

  setTagOnEntities(["Euclid"], "ancient greek");

  forceConsistencyOnGraph(graph);

  const thinkers2Graph: SceneGraph = new SceneGraph({
    graph,
    metadata: {
      name: "Greatest Minds",
      description: "A graph of the greatest minds in history",
    },
  });

  const nodeNames = new Set();
  graph.getNodes().forEach((node) => nodeNames.add(node.getId()));

  const majorWorks = new Set();
  for (const person of people) {
    for (const work of person.majorWorks) {
      majorWorks.add(`${person.name}: ${work.name}, ${work.year}`);
    }
  }

  const islands = graph.getIslands();

  const toExpand = new Set();
  const types = new Set();
  for (const island of islands) {
    if (island.length < 5) {
      for (const node of island) {
        toExpand.add(node.getId());
        types.add(node.getType());
      }
    }
    for (const edge of graph.getEdges()) {
      types.add(edge.getType());
    }
  }

  return thinkers2Graph;
};
