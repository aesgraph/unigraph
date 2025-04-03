import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

export const semanticWebTechnologiesDiagram = () => {
  const graph = new Graph();

  // Core Semantic Web Standards
  graph.createNode({
    id: "SemanticWeb",
    type: "core concept",
    tags: ["web technology", "story entrypoint"],
  });

  graph.createNode({
    id: "RDF",
    type: "core standard",
    tags: ["data model", "foundation"],
  });

  graph.createNode({
    id: "RDFS",
    type: "core standard",
    tags: ["schema", "vocabulary"],
  });

  graph.createNode({
    id: "OWL",
    type: "core standard",
    tags: ["ontology", "logic"],
  });

  graph.createNode({
    id: "SPARQL",
    type: "core standard",
    tags: ["query language", "data access"],
  });

  graph.createNode({
    id: "LinkedData",
    type: "core concept",
    tags: ["data publishing", "web of data"],
  });

  // RDF Serialization Formats
  graph.createNode({
    id: "RDFXml",
    type: "serialization format",
    tags: ["xml", "data exchange"],
  });

  graph.createNode({
    id: "Turtle",
    type: "serialization format",
    tags: ["human readable", "data exchange"],
  });

  graph.createNode({
    id: "JSONLD",
    type: "serialization format",
    tags: ["json", "data exchange"],
  });

  graph.createNode({
    id: "NTriples",
    type: "serialization format",
    tags: ["simple", "data exchange"],
  });

  graph.createNode({
    id: "TriG",
    type: "serialization format",
    tags: ["named graphs", "data exchange"],
  });

  // Ontologies and Vocabularies
  graph.createNode({
    id: "FOAF",
    type: "ontology",
    tags: ["social", "people"],
  });

  graph.createNode({
    id: "Dublin Core",
    type: "ontology",
    tags: ["metadata", "publishing"],
  });

  graph.createNode({
    id: "SKOS",
    type: "ontology",
    tags: ["knowledge organization", "taxonomy"],
  });

  graph.createNode({
    id: "Schema.org",
    type: "ontology",
    tags: ["structured data", "SEO"],
  });

  graph.createNode({
    id: "GoodRelations",
    type: "ontology",
    tags: ["e-commerce", "product"],
  });

  graph.createNode({
    id: "SIOC",
    type: "ontology",
    tags: ["online communities", "social"],
  });

  // Triple Stores
  graph.createNode({
    id: "Virtuoso",
    type: "triple store",
    tags: ["database", "implementation"],
  });

  graph.createNode({
    id: "Apache Jena",
    type: "triple store",
    tags: ["database", "framework"],
  });

  graph.createNode({
    id: "AllegroGraph",
    type: "triple store",
    tags: ["database", "graph database"],
  });

  graph.createNode({
    id: "Blazegraph",
    type: "triple store",
    tags: ["database", "high performance"],
  });

  graph.createNode({
    id: "Stardog",
    type: "triple store",
    tags: ["database", "knowledge graph"],
  });

  // Semantic Web Services
  graph.createNode({
    id: "DBpedia",
    type: "semantic web service",
    tags: ["knowledge base", "wikipedia extraction"],
  });

  graph.createNode({
    id: "Wikidata",
    type: "semantic web service",
    tags: ["knowledge base", "structured data"],
  });

  graph.createNode({
    id: "YAGO",
    type: "semantic web service",
    tags: ["knowledge base", "ontology"],
  });

  graph.createNode({
    id: "BioPortal",
    type: "semantic web service",
    tags: ["biomedical", "ontologies"],
  });

  // Tools and Frameworks
  graph.createNode({
    id: "Protégé",
    type: "tool",
    tags: ["ontology editor", "development"],
  });

  graph.createNode({
    id: "TopBraid",
    type: "tool",
    tags: ["modeling", "integration"],
  });

  graph.createNode({
    id: "Apache Jena Framework",
    type: "framework",
    tags: ["java", "development"],
  });

  graph.createNode({
    id: "RDFLib",
    type: "framework",
    tags: ["python", "development"],
  });

  graph.createNode({
    id: "rdfjs",
    type: "framework",
    tags: ["javascript", "development"],
  });

  // Reasoning and Rules
  graph.createNode({
    id: "OWLReasoning",
    type: "reasoning technology",
    tags: ["inference", "logic"],
  });

  graph.createNode({
    id: "SWRL",
    type: "rule language",
    tags: ["rules", "logic"],
  });

  graph.createNode({
    id: "RIF",
    type: "rule interchange",
    tags: ["rules", "standard"],
  });

  // Web Technologies Integration
  graph.createNode({
    id: "RDFa",
    type: "web integration",
    tags: ["html", "annotation"],
  });

  graph.createNode({
    id: "Microdata",
    type: "web integration",
    tags: ["html", "structured data"],
  });

  graph.createNode({
    id: "Microformats",
    type: "web integration",
    tags: ["html", "markup"],
  });

  // Applications and Use Cases
  graph.createNode({
    id: "SemanticSearch",
    type: "application",
    tags: ["search", "information retrieval"],
  });

  graph.createNode({
    id: "KnowledgeGraphs",
    type: "application",
    tags: ["knowledge representation", "graph"],
  });

  graph.createNode({
    id: "SemanticIntegration",
    type: "application",
    tags: ["data integration", "interoperability"],
  });

  graph.createNode({
    id: "SemanticAnnotation",
    type: "application",
    tags: ["content enrichment", "metadata"],
  });

  // Related Technologies
  graph.createNode({
    id: "GraphDatabases",
    type: "related technology",
    tags: ["database", "graph"],
  });

  graph.createNode({
    id: "NaturalLanguageProcessing",
    type: "related technology",
    tags: ["AI", "text analysis"],
  });

  graph.createNode({
    id: "MachineLearning",
    type: "related technology",
    tags: ["AI", "data science"],
  });

  graph.createNode({
    id: "BigData",
    type: "related technology",
    tags: ["data processing", "scale"],
  });

  // Future Directions
  graph.createNode({
    id: "SemanticWebOfThings",
    type: "future direction",
    tags: ["IoT", "connected devices"],
  });

  graph.createNode({
    id: "DecentralizedWeb",
    type: "future direction",
    tags: ["web3", "distributed"],
  });

  graph.createNode({
    id: "AIKnowledgeGraphs",
    type: "future direction",
    tags: ["AI", "knowledge representation"],
  });

  graph.createNode({
    id: "SOLID",
    type: "future direction",
    tags: ["data ownership", "privacy"],
  });

  // Core Relationships
  graph.createEdge("SemanticWeb", "RDF", { type: "foundational standard of" });
  graph.createEdge("SemanticWeb", "RDFS", { type: "builds on" });
  graph.createEdge("SemanticWeb", "OWL", { type: "extends with" });
  graph.createEdge("SemanticWeb", "SPARQL", { type: "queried with" });
  graph.createEdge("SemanticWeb", "LinkedData", {
    type: "implemented through",
  });

  // RDF Relationships
  graph.createEdge("RDF", "RDFXml", { type: "serialized as" });
  graph.createEdge("RDF", "Turtle", { type: "serialized as" });
  graph.createEdge("RDF", "JSONLD", { type: "serialized as" });
  graph.createEdge("RDF", "NTriples", { type: "serialized as" });
  graph.createEdge("RDF", "TriG", { type: "serialized as" });
  graph.createEdge("RDFS", "RDF", { type: "extends" });
  graph.createEdge("OWL", "RDF", { type: "built on" });

  // Ontology Relationships
  graph.createEdge("RDFS", "FOAF", { type: "enables creation of" });
  graph.createEdge("OWL", "Dublin Core", { type: "used to define" });
  graph.createEdge("RDFS", "SKOS", { type: "enables creation of" });
  graph.createEdge("Schema.org", "RDFa", { type: "can be embedded using" });
  graph.createEdge("OWL", "GoodRelations", { type: "used to define" });
  graph.createEdge("RDFS", "SIOC", { type: "enables creation of" });

  // Triple Store Relationships
  graph.createEdge("RDF", "Virtuoso", { type: "stored in" });
  graph.createEdge("RDF", "Apache Jena", { type: "stored in" });
  graph.createEdge("RDF", "AllegroGraph", { type: "stored in" });
  graph.createEdge("RDF", "Blazegraph", { type: "stored in" });
  graph.createEdge("RDF", "Stardog", { type: "stored in" });
  graph.createEdge("SPARQL", "Virtuoso", { type: "queried with" });
  graph.createEdge("SPARQL", "Apache Jena", { type: "queried with" });

  // Semantic Web Services Relationships
  graph.createEdge("LinkedData", "DBpedia", { type: "exemplified by" });
  graph.createEdge("LinkedData", "Wikidata", { type: "exemplified by" });
  graph.createEdge("OWL", "YAGO", { type: "used in" });
  graph.createEdge("OWL", "BioPortal", { type: "foundational for" });

  // Tools and Frameworks Relationships
  graph.createEdge("OWL", "Protégé", { type: "edited with" });
  graph.createEdge("RDF", "TopBraid", { type: "managed with" });
  graph.createEdge("RDF", "Apache Jena Framework", {
    type: "manipulated with",
  });
  graph.createEdge("RDF", "RDFLib", { type: "manipulated with" });
  graph.createEdge("RDF", "rdfjs", { type: "manipulated with" });

  // Reasoning Relationships
  graph.createEdge("OWL", "OWLReasoning", { type: "enables" });
  graph.createEdge("OWL", "SWRL", { type: "extended by" });
  graph.createEdge("SemanticWeb", "RIF", { type: "standardized through" });

  // Web Integration Relationships
  graph.createEdge("LinkedData", "RDFa", { type: "published via" });
  graph.createEdge("Schema.org", "Microdata", { type: "embedded using" });
  graph.createEdge("LinkedData", "Microformats", { type: "published via" });

  // Applications Relationships
  graph.createEdge("SemanticWeb", "SemanticSearch", { type: "enables" });
  graph.createEdge("SemanticWeb", "KnowledgeGraphs", { type: "powers" });
  graph.createEdge("LinkedData", "SemanticIntegration", {
    type: "facilitates",
  });
  graph.createEdge("RDF", "SemanticAnnotation", {
    type: "provides foundation for",
  });

  // Related Technology Relationships
  graph.createEdge("SemanticWeb", "GraphDatabases", { type: "related to" });
  graph.createEdge("SemanticWeb", "NaturalLanguageProcessing", {
    type: "complemented by",
  });
  graph.createEdge("KnowledgeGraphs", "MachineLearning", {
    type: "enhanced by",
  });
  graph.createEdge("LinkedData", "BigData", { type: "scales with" });

  // Future Directions Relationships
  graph.createEdge("SemanticWeb", "SemanticWebOfThings", {
    type: "evolving into",
  });
  graph.createEdge("LinkedData", "DecentralizedWeb", { type: "aligns with" });
  graph.createEdge("KnowledgeGraphs", "AIKnowledgeGraphs", {
    type: "advancing toward",
  });
  graph.createEdge("LinkedData", "SOLID", { type: "principles applied in" });

  // Cross-domain Relationships
  graph.createEdge("NaturalLanguageProcessing", "SemanticAnnotation", {
    type: "enables automated",
  });
  graph.createEdge("Wikidata", "KnowledgeGraphs", { type: "exemplifies" });
  graph.createEdge("JSONLD", "Schema.org", { type: "commonly used with" });
  graph.createEdge("BigData", "Blazegraph", { type: "processed with" });
  graph.createEdge("SemanticSearch", "NaturalLanguageProcessing", {
    type: "enhanced by",
  });
  graph.createEdge("DecentralizedWeb", "SOLID", {
    type: "implemented through",
  });
  graph.createEdge("AIKnowledgeGraphs", "MachineLearning", {
    type: "powered by",
  });

  return new SceneGraph({ graph });
};
