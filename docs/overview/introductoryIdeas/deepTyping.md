---
title: Deep Typing
nav_order: 11
parent: "Overview"
---

## Semantic and Structural Typing<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;and combining the two

### **1. Structural Typing vs. Semantic Typing**

#### **Structural Typing**

- _Definition_: A system is _structurally typed_ when the compatibility of types is determined by their _structure_, not by their declared name.
- _Example_: If two types have the same fields and field types, they are considered compatible, even if they are declared independently.
- _Common in_: TypeScript, OCaml, Go.

> "If it looks like a duck and quacks like a duck, it’s a duck."

#### **Semantic Typing**

- _Definition_: A system is _semantically typed_ when types have _meaning_, often by being identified with formal ontologies or conceptual categories, not just their structural shape.
- _Example_: In RDF/OWL, `foaf:Person` means "Person" as defined by the FOAF ontology, regardless of what properties it happens to have.
- _Common in_: Semantic Web (RDF, OWL), Description Logics.

> "If it _is_ a duck (per ontology), it is a duck, even if you can’t see its feathers yet."

---

### **2. The Semantic Web's Type System**

### The Semantic Web, powered by RDF(S) and OWL, **only** supports _semantic typing_, not structural typing.

- RDF Classes (`rdfs:Class`) are essentially _semantic labels_.
- Membership in a class is declared via triples:
  `ex:Bob rdf:type foaf:Person.`
- RDF does not care _what properties_ Bob has to be considered a `foaf:Person`.
- OWL can specify _restrictions_ on classes (e.g., "all Persons have a name"), but it does not cause the system to behave like a structurally-typed one — it stays at the _inference level_, not the _validation level_.

So, **RDF is not structurally typed** because:

- There is no notion of a required _shape_ or _field set_ for types.
- Inference is driven by semantic relationships, not structural compatibility.

---

### **3. Why isn't there a common term for combining structural and semantic typing?**

### The key reason is **historical separation**:

- **Programming languages** mostly developed structural type systems (especially in ML-family languages, TypeScript, etc.) for reasoning about _code_.
- **Semantic web / AI** focused on _meaning_ and _knowledge representation_, which is often incomplete and open-world (you might not know all fields).
- There's been little cross-pollination because:
  - Structural typing is fundamentally a _closed-world_ assumption: "I know everything about this value."
  - Semantic typing is fundamentally an _open-world_ assumption: "I may not know all properties, but I know it is a `Person`."

Combining them is non-trivial because they seem to philosophically contradict:

- Structural typing assumes you know the complete shape.
- Semantic typing assumes you _don’t necessarily_ know the complete shape.

---

### **4. Proposal: "Deep Type System"**

### If you want to **merge both**:

> A **Deep Type System** is a type system where entities are characterized both by their _structure_ (fields and field types) and by their _semantic role_ (their membership in ontologies), and both are enforceable.

Such a system would:

- Treat _semantic typing_ as a superclass layer.
- Treat _structural typing_ as a subclass refinement.
- Allow types to be validated both by _ontology membership_ and _structure conformity_.
- Support _open-world inference_ combined with _closed-world validation_.

---

### **5. Why is this valuable?**

- Semantic web can be made _stronger_, by being able to check that an `ex:Person` actually has the structural properties you'd expect.
- Programming languages could become _ontology-aware_, allowing knowledge graphs to directly inform type checkers and IDEs.
- AI reasoning could better _interoperate_ with code-level systems.

---

### **TL;DR**

- Structural typing = shape-based
- Semantic typing = meaning-based
- Semantic Web = only semantic typing
- Deep Type System = hybrid of both
