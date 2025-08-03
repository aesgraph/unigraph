/* eslint-disable unused-imports/no-unused-vars */
import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { createStoryCardsFromDocsDirectory } from "../../../components/applets/StoryCards/cards/utils";
import { EntitiesContainer } from "../../../core/model/entity/entitiesContainer";
import { Graph } from "../../../core/model/Graph";
import { createEdgesTo } from "../../../core/model/GraphUtils";
import { Node, NodeId } from "../../../core/model/Node";
import { SceneGraph } from "../../../core/model/SceneGraph";

export const demo_Unigraph_Applications = () => {
  const graph = new Graph();

  const storyCards = graph.createNode({
    id: "Story Cards",
    type: "storyCard",
    userData: {
      title: "Story Cards",
      description:
        "Story cards are a way to represent complex information in a fun and interactive way.\nThey give creators a new paradigm for communicating information that allows users to explore different narratives that interest them.",
      tags: ["unigraph", "story cards", "interactive"],
    },
  });

  const interactiveHarryPotterTimeTravelAnalysis = graph.createNode({
    id: "Interactive Harry Potter Time Travel Analysis",
    type: "storyCard",
    userData: {
      title: "Interactive Harry Potter Time Travel Analysis",
      description:
        "An interactive analysis of time travel in the Harry Potter series, allowing users to explore different timelines and outcomes based on character decisions. Unigraph allows this thing to be easily codified, shared, and extendend to arbitrary complexity.",
      tags: ["harry potter", "time travel", "interactive"],
    },
  });

  const howToCreateRealMagic = graph.createNode({
    id: "Magic Explained",
    type: "storyCard",
    userData: {
      title: "Magic Explained",
      description:
        "What would it take to create real magic? How would we technically achieve transfiguration?",
      tags: ["unigraph", "magic", "applications"],
      markdownFile: "/storyCardFiles/magicExplained/intro.md",
    },
  });

  const fieldTheoreticalFrameworksAndComputationalPhilosophy = graph.createNode(
    {
      id: "Field Theoretical Frameworks and Computational Philosophy",
      type: "storyCard",
      userData: {
        title: "Field Theoretical Frameworks and Computational Philosophy",
        description:
          "Field theoretical frameworks and computational philosophy provide a way to understand and model complex systems, allowing for the exploration of ideas and concepts in a structured and interactive way. Unigraph leverages these frameworks to create a unified platform for codifying, inspecting, and navigating information.",
        tags: ["unigraph", "field theory", "computational philosophy"],
        markdownFile: "unigraph/fieldTheoreticalFrameworks.md",
      },
    }
  );

  const theInspirationOfStoryCardsInUnigraph = graph.createNode({
    id: "The Inspiration of Story Cards in Unigraph",
    type: "storyCard",
    userData: {
      title: "The Inspiration of Story Cards in Unigraph",
      description:
        "The inspiration for story cards in Unigraph comes from various sources, including interactive fiction, choose-your-own-adventure books, and the desire to create engaging, branching narratives that allow users to explore complex information in a fun and interactive way. Furthermore, taking a scientific approach to the codification, inspection, and navigation of information.",
      tags: ["unigraph", "story cards", "inspiration"],
      markdownFile: "unigraph/inspiration.md",
    },
  });

  const scientificChallengeIsOrganizationalComplexity = graph.createNode({
    id: "Scientific Challenge is Organizational Complexity",
    type: "storyCard",
    userData: {
      title: "Scientific Challenge is Organizational Complexity",
      description:
        "The scientific challenge of our time is not just about discovering new facts, but about organizing and making sense of the vast amount of information we have. Unigraph provides a platform for codifying, inspecting, and navigating this information in a unified way.",
      tags: ["unigraph", "scientific challenge", "organizational complexity"],
      markdownFile: "unigraph/scientificChallenge.md",
    },
  });

  const accessibleComputationForWeb30 = graph.createNode({
    id: "Accessible Computation for Web 3.0",
    type: "storyCard",
    userData: {
      title: "Accessible Computation for Web 3.0",
      description:
        "Unigraph aims to make computation accessible for everyone, enabling users to create and share complex applications without needing deep technical knowledge. This democratizes access to powerful tools and allows for a more inclusive approach to software development.",
      tags: ["unigraph", "web 3.0", "accessible computation"],
      markdownFile: "unigraph/accessibleComputation.md",
    },
  });

  createEdgesTo(
    graph,
    theInspirationOfStoryCardsInUnigraph.getId(),
    [
      scientificChallengeIsOrganizationalComplexity,
      accessibleComputationForWeb30,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  const anIdea = graph.createNode({
    id: "An Idea",
    type: "storyCard",
    userData: {
      title: "An Idea",
      description:
        "An idea is a thought or suggestion as to a possible course of action. It can be a starting point for creating something new, or a way to solve a problem.",
      tags: ["idea", "thought", "suggestion"],
      markdownFile: "quips/anIdea.md",
    },
  });

  // Add a node that references a markdown file
  const numerologyInformation = graph.createNode({
    id: "Numerology Information",
    type: "storyCard",
    userData: {
      title: "Reading e",
      markdownFile: "numerology.md", // This will be loaded from /public/posts/numerology.md
      tags: ["numerology", "belief systems", "markdown"],
    },
  });

  // Connect it to the story cards node
  graph.createEdge(storyCards.getId(), numerologyInformation.getId(), {
    type: "StoryChoice",
    label: "Learn about Numerology",
  });

  const astrologyInformation = graph.createNode({
    id: "Astrology Information",
    type: "storyCard",
    userData: {
      title: "Legitimacy in Astrology",
      markdownFile: "astrology.md", // This will be loaded from /public/posts/astrology.md
      tags: ["astrology", "belief systems", "markdown"],
    },
  });

  const aboutTheAlethiometer = graph.createNode({
    id: "About the Alethiometer",
    type: "storyCard",
    tags: ["EntryPoint"],
    userData: {
      title: "About the Alethiometer",
      description:
        "The alethiometer, or golden compass, is a fictional device from Philip Pullman's 'His Dark Materials' series. It is used to find truth and navigate complex moral landscapes.",
      tags: ["alethiometer", "golden compass", "fiction"],
      markdownFile: "alethiometer/intro.md", // This will be loaded from /public/posts/aboutTheAlethiometer.md
    },
  });

  const simpleCaseAlethiometer = graph.createNode({
    id: "Simple Case Alethiometer",
    type: "storyCard",
    userData: {
      title: "Simple Case Alethiometer",
      description:
        "A simple case of using the alethiometer to answer a question about the legitimacy of astrology.",
      tags: ["alethiometer", "factor graph", "simple case"],
      markdownFile: "alethiometer/simpleCase.md", // Make sure this path matches your directory structure
    },
  });

  const advancedCaseAlethiometer = graph.createNode({
    id: "Advanced Case Alethiometer",
    type: "storyCard",
    userData: {
      title: "Advanced Case Alethiometer",
      description:
        "An advanced case of using the alethiometer to answer a question about the legitimacy of astrology, involving multiple layers of complexity and decision-making.",
      tags: ["alethiometer", "astrology", "advanced case"],
      markdownFile: "alethiometer/advancedCase.md", // This will be loaded from /public/posts/advancedCaseAlethiometer.md
    },
  });

  const constraintGraph = graph.createNode({
    id: "Constraint Graph",
    type: "storyCard",
    userData: {
      title: "Constraint Graph",
      description:
        "A constraint graph is a way to represent relationships between different entities in a system, allowing for complex decision-making and analysis.",
      tags: ["constraint graph", "decision making", "analysis"],
      markdownFile: "constraintGraph.md", // This will be loaded from /public/posts/constraintGraph.md
    },
  });

  const factorGraph = graph.createNode({
    id: "Factor Graph",
    type: "storyCard",
    userData: {
      title: "Factor Graph",
      description:
        "A factor graph is a bipartite graph that represents the factorization of a function into a product of smaller functions, allowing for efficient computation and analysis of complex systems.",
      tags: ["factor graph", "computation", "analysis"],
      markdownFile: "factorGraph.md", // This will be loaded from /public/posts/factorGraph.md
    },
  });

  graph.createEdge(simpleCaseAlethiometer.getId(), constraintGraph.getId(), {
    type: "StoryChoice",
  });

  graph.createEdge(advancedCaseAlethiometer.getId(), factorGraph.getId(), {
    type: "StoryChoice",
  });

  const alethiometerCases = createEdgesTo(
    graph,
    aboutTheAlethiometer.getId(),
    [simpleCaseAlethiometer, advancedCaseAlethiometer].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  graph.createEdge(
    numerologyInformation.getId(),
    astrologyInformation.getId(),
    {
      type: "StoryChoice",
      label: "expansion",
    }
  );

  const conceptAlbumGallery = graph.createNode({
    id: "Concept Album Gallery",
    type: "storyCard",
    userData: {
      title: "Concept Album Gallery",
      description:
        "A gallery of concept albums, showcasing the intersection of music and storytelling through thematic and narrative coherence.",
      tags: ["concept album", "gallery", "music"],
      markdownFile: "conceptAlbum/gallery.md", // This will be loaded from /public/posts/conceptAlbumGallery.md
    },
  });

  const aboutUnigraph = graph.createNode({
    id: "About Unigraph",
    type: "storyCard",
    userData: {
      title: "About Unigraph",
      description:
        "Unigraph is a platform for creating and sharing interactive stories, allowing users to explore complex information in a fun and engaging way. It provides tools for codifying, inspecting, and navigating information, enabling a new paradigm for communication and interaction.",
      tags: ["unigraph", "platform", "interactive stories"],
      markdownFile: "unigraph/about.md", // This will be loaded from /public/posts/aboutUnigraph.md
    },
  });

  const unifiedDataPlatform = graph.createNode({
    id: "Unified Data Platform",
    type: "storyCard",
    userData: {
      title: "Unified Data Platform",
      description:
        "Unigraph serves as a unified data platform, allowing users to create, share, and interact with complex data structures in a modular and composable way. This enables a new level of flexibility and extensibility in application development, making it easier to build and maintain complex systems.",
      tags: ["unigraph", "data platform", "modular development"],
      markdownFile: "unigraph/unifiedDataPlatform.md", // This will be loaded from /public/posts/unifiedDataPlatform.md
    },
  });

  const unigraphTypeSystem = graph.createNode({
    id: "Unigraph Type System",
    type: "storyCard",
    userData: {
      title: "Unigraph Type System",
      description:
        "The Unigraph type system provides a way to define and enforce the structure of data in Unigraph, allowing for better organization and interaction with complex information. It enables users to create rich, structured data that can be easily navigated and understood.",
      tags: ["unigraph", "type system", "data structure"],
      markdownFile: "unigraph/typeSystem.md", // This will be loaded from /public/posts/unigraphTypeSystem.md
    },
  });

  const modelAndSceneGraphs = graph.createNode({
    id: "Model and Scene Graphs",
    type: "storyCard",
    userData: {
      title: "Model and Scene Graphs",
      description:
        "Model and scene graphs are fundamental components of Unigraph, providing a way to represent and navigate complex information structures. They enable users to create, share, and interact with rich, structured data in a unified way, allowing for better organization and understanding of complex systems.",
      tags: ["unigraph", "model graph", "scene graph"],
      markdownFile: "unigraph/modelAndSceneGraphs.md", // This will be loaded from /public/posts/modelAndSceneGraphs.md
    },
  });

  const annotations = graph.createNode({
    id: "Annotations",
    type: "storyCard",
    userData: {
      title: "Annotations",
      description:
        "Annotation trees are a way to represent hierarchical relationships between different pieces of information, allowing for complex data structures to be easily navigated and understood. They are a key feature of Unigraph, enabling users to create and interact with rich, structured data in a unified way.",
      tags: ["unigraph", "annotation trees", "hierarchical relationships"],
      markdownFile: "unigraph/annotationTrees.md", // This will be loaded from /public/posts/annotationTrees.md
    },
  });

  const imageBoxes = graph.createNode({
    id: "Image Boxes",
    type: "storyCard",
    userData: {
      title: "Image Boxes",
      description:
        "Image boxes are a way to represent images and their associated metadata in a structured way, allowing users to easily navigate and interact with visual information. They are a key feature of Unigraph, enabling users to create rich, interactive visualizations and galleries.",
      tags: ["unigraph", "image boxes", "visual information"],
      markdownFile: "unigraph/imageBoxCreator.md", // This will be loaded from /public/posts/imageBoxes.md
    },
  });

  const documents = graph.createNode({
    id: "Documents",
    type: "storyCard",
    userData: {
      title: "Documents",
      description:
        "Documents in Unigraph are structured representations of information, allowing users to create, share, and interact with complex data in a modular and composable way. They serve as the foundation for building rich, interactive applications and stories, enabling a new level of flexibility and extensibility in information management.",
      tags: ["unigraph", "documents", "information management"],
      markdownFile: "unigraph/documents.md", // This will be loaded from /public/posts/documents.md
    },
  });

  const songAnnotations = graph.createNode({
    id: "Song Annotations",
    type: "storyCard",
    userData: {
      title: "Song Annotations",
      description:
        "Song annotations are a way to represent and interact with musical information, allowing users to create, share, and explore complex musical structures in a unified way. They enable a new level of flexibility and extensibility in music applications, making it easier to build and maintain complex systems.",
      tags: ["unigraph", "song annotations", "music applications"],
      markdownFile: "unigraph/songAnnotations.md", // This will be loaded from /public/posts/songAnnotations.md
    },
  });

  const termDefinitions = graph.createNode({
    id: "Term Definitions",
    type: "storyCard",
    userData: {
      title: "Term Definitions",
      description:
        "Term definitions in Unigraph provide a way to codify and standardize the meaning of terms and concepts, enabling users to create, share, and interact with complex information in a unified way. This allows for better communication and understanding across different domains and applications.",
      tags: ["unigraph", "term definitions", "standardization"],
      markdownFile: "unigraph/termDefinitions.md", // This will be loaded from /public/posts/termDefinitions.md
    },
  });

  createEdgesTo(
    graph,
    annotations.getId(),
    [imageBoxes, documents, songAnnotations, termDefinitions].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  const composabilityInUnigraph = graph.createNode({
    id: "Composability in Unigraph",
    type: "storyCard",
    userData: {
      title: "Composability in Unigraph",
      description:
        "Composability in Unigraph refers to the ability to create complex applications by combining simple, reusable components. This allows for flexible and modular development, enabling users to build applications that can be easily extended and customized.",
      tags: ["unigraph", "composability", "modular development"],
      markdownFile: "unigraph/composability.md", // This will be loaded from /public/posts/composabilityInUnigraph.md
    },
  });

  const entityComponentSystem = graph.createNode({
    id: "Entity Component System",
    type: "storyCard",
    userData: {
      title: "Entity Component System",
      description:
        "An Entity Component System (ECS) is a software architectural pattern that allows for the composition of complex systems from simple, reusable components. It is widely used in game development and other domains where flexibility and modularity are important.",
      tags: ["unigraph", "entity component system", "ecs"],
      markdownFile: "unigraph/entityComponentSystem.md", // This will be loaded from /public/posts/entityComponentSystem.md
    },
  });

  createEdgesTo(
    graph,
    composabilityInUnigraph.getId(),
    [entityComponentSystem].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  const unigraphIsIntermediateRepresentationLanguage = graph.createNode({
    id: "Intermediate Representation Language",
    type: "storyCard",
    userData: {
      title: "Unigraph is an Intermediate Representation Language",
      description:
        "Unigraph serves as an intermediate representation language, allowing for the codification and inspection of information in a unified way. This enables users to create complex applications that can interact with various data formats and systems, providing a flexible and extensible platform for information management.",
      tags: [
        "unigraph",
        "intermediate representation",
        "information management",
      ],
      markdownFile: "keyTerms/intermediateRepresentationLanguage.md", // This will be loaded from /public/posts/unigraphIsIntermediateRepresentationLanguage.md
    },
  });

  const unigraphCopilot = graph.createNode({
    id: "Unigraph Copilot",
    type: "storyCard",
    userData: {
      title: "Unigraph Copilot",
      description:
        "Unigraph Copilot is an AI-powered assistant that helps users navigate and interact with Unigraph. It provides intelligent suggestions and insights, making it easier to explore complex information and build applications.",
      tags: ["unigraph", "copilot", "ai assistant"],
      markdownFile: "unigraph/copilot.md", // This will be loaded from /public/posts/unigraphCopilot.md
    },
  });

  const unigraphChromeExtension = graph.createNode({
    id: "Unigraph Chrome Extension",
    type: "storyCard",
    userData: {
      title: "Unigraph Chrome Extension",
      description:
        "The Unigraph Chrome Extension allows users to interact with Unigraph directly from their browser, enabling seamless integration with web applications and services. It provides a powerful tool for codifying, inspecting, and navigating information in a unified way.",
      tags: ["unigraph", "chrome extension", "browser integration"],
      markdownFile: "unigraph/chromeExtension.md", // This will be loaded from /public/posts/unigraphChromeExtension.md
    },
  });

  const interspection = graph.createNode({
    id: "Interspection in Unigraph",
    type: "storyCard",
    userData: {
      title: "Interspection in Unigraph",
      description:
        "Interspection is the entire gamut of inspecting, navigating, and interacting with information in Unigraph. People can use Unigraph to inter information - codifying it in a standard language that allows it to be intered on in a unified application ecosystem. This spans from creating fun interactive stories, to complex linking annotation schemes across previously disparate data formats, or creating complex data science tools.",
      tags: ["unigraph", "interspection", "information", "codification"],
      markdownFile: "alethiometer/interspection.md", // This will be loaded from /public/posts/interspection.md
    },
  });

  const test = graph.createNode({
    id: "Test",
    type: "storyCard",
    userData: {
      title: "Test",
      description: "This is a test node for demonstration purposes.",
      tags: ["test", "demo"],
      markdownFile: "docs/applets/applets.md", // This will be loaded from /public/posts/test.md
    },
  });

  const bigScienceAndOrganizationalComplexity = graph.createNode({
    id: "Big Science and Organizational Complexity",
    type: "storyCard",
    userData: {
      title: "Big Science and Organizational Complexity",
      description:
        "Big science projects often face challenges related to organizational complexity, requiring innovative approaches to manage and navigate large-scale collaborations. Unigraph provides tools for codifying, inspecting, and navigating complex information structures, enabling better organization and understanding of complex systems.",
      tags: ["unigraph", "big science", "organizational complexity"],
      markdownFile: "unigraph/bigScience.md", // This will be loaded from /public/posts/bigScienceAndOrganizationalComplexity.md
    },
  });

  createEdgesTo(
    graph,
    aboutUnigraph.getId(),
    [
      interspection,
      unigraphTypeSystem,
      composabilityInUnigraph,
      annotations,
      unigraphIsIntermediateRepresentationLanguage,
      modelAndSceneGraphs,
      unigraphCopilot,
      unigraphChromeExtension,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  createStoryCardsFromDocsDirectory(graph).then(
    (docsNodes: EntitiesContainer<NodeId, Node>) => {
      createEdgesTo(
        graph,
        storyCards.getId(),
        [docsNodes.first()!].map((node: Node) => node.getId()),
        { type: "StoryChoice", tags: ["EntryPoint"] }
      );
    }
  );

  const demo_stories = createEdgesTo(
    graph,
    storyCards.getId(),
    [
      interactiveHarryPotterTimeTravelAnalysis,
      howToCreateRealMagic,
      fieldTheoreticalFrameworksAndComputationalPhilosophy,
      theInspirationOfStoryCardsInUnigraph,
      aboutTheAlethiometer,
      anIdea,
      conceptAlbumGallery,
      aboutUnigraph,
      test,
      bigScienceAndOrganizationalComplexity,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  console.log("reached here");

  return new SceneGraph({
    graph,
    metadata: {
      name: "Unigraph Applications Story Cards",
      description:
        "An actual version for explaining how Unigraph Story Cards work.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: "dot",
      activeView: "ReactFlow",
    },
  });
};
