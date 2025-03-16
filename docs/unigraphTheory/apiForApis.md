---
title: An API for APIs
nav_order: 4
parent: "Theory"
---

## An API for APIs

**Unigraph is a solution to eliminate the multiplicative redundancy in building message translation layers across organizational scopes.**

Lets start with a basic use case for Unigraph.<br>
Amazon S3 is a storage service, and has created a worldwide standard for managing permissions through policies, which are simply files of a certain format. Any other service understands what the structure and semantics of a policy file are, so they are free to use it in their own implementations.<br>

Ceph [implementation INCOMPLETE, model INCOMPLETE, format **X** response]<br>
-> boto3 [implementation INCOMPLETE, model COMPLETE, format **Y** response]<br>
-> API (reverse proxy, format **Y** or **Z** response)<br>

**_Unigraph: Define the policy as a Unigraph model to act as a message translation layer module. This module can be published so that any system may use it to interface with other systems outside of its organizational scope._**

Amazon -> Publish model to Unigraph<br>
-> boto3<br>
-> Ceph<br>
-> any other system<br>

Ceph [implementation INCOMPLETE, model COMPLETE, format **T** response]<br>
-> boto3 [implementation COMPLETE, model COMPLETE, format **T** response]<br>
-> API (reverse proxy, format **T** response)<br>

### @ChatGPT Conversation

**Why do you think Ceph returns lifecycle policies in snake_case, but boto3 returns in camelCase**

The difference in naming conventions—**snake_case** for Ceph and **CamelCase** for Boto3—likely stems from the development philosophies and language ecosystems of each project:

1. **Ceph follows Pythonic conventions**

   - Ceph is deeply integrated with Linux-based environments and open-source ecosystems, which typically favor `snake_case` for readability and consistency with Python's PEP 8 style guide.
   - Many open-source projects, particularly in C++ and Python (Ceph’s main languages), use `snake_case` for APIs and configuration settings.

1. **Boto3 aligns with AWS conventions**

   - Boto3 is the official Python SDK for AWS and follows AWS’s API design principles, which often use **CamelCase** for JSON responses and API field names.
   - This is partly because AWS services, including S3 (which Ceph aims to be compatible with), are implemented in multiple languages where CamelCase is the standard, especially in Java-based and web API ecosystems.

1. **S3 compatibility vs. Python conventions**

   - Ceph's lifecycle policies likely **mirror Amazon S3's API structure** but use `snake_case` to fit more naturally within the Ceph ecosystem.
   - Boto3, as an AWS SDK, remains **faithful to AWS API responses**, which are structured in `CamelCase`.

Even though Ceph is designed for S3 compatibility, it may internally store and process lifecycle policies in snake_case for consistency with the rest of its codebase. It likely translates between the two formats when interfacing with S3 clients

The true power of a **shared model** lies in its ability to **reduce the complexity of interoperability from O(N²) to O(N), or even O(1)**. Instead of each of the N services in a mesh writing N-1 message adaptors, each service only needs to implement one at most, or none if they use the Unigraph model out of the box. (One reason to adapt from the Unigraph model and not use it directly is if the implementing system is incomplete, and does not want to misrepresent itself by using a complete Unigraph model in its code when features aren't supported).

Let's assume we have **five different services in a mesh network** that work with the same common model, like the GS1 standard for product and shipment tracking. For the sake of simplicity, lets assume they all have different serialization conventions for their apis. More complex examples could involve different representation formats that manifest from specific implementations and different supported features per service.

- **Service 1** (Snake Case)
- **Service 2** (Camel Case)
- **Service 3** (Pascal Case)
- **Service 4** (Kebab Case)
- **Service 5** (Upper Snake Case)<br>

For `N = 5` services:

- **Without Unigraph (worst case)**: Each service must write 4 conversion functions → **20 total conversions**
- **With Unigraph**: Each service only converts once to/from Unigraph → **5 total conversions**
- Using the Unigraph Model as single source of truth → **0 conversions**

Unigraph models would exist as published package libraries with semantic versioning, and have code generation for many languages. FastAPI is a related technology that has multi-language codegen for messaging apis based on yaml-defined schemas, but Unigraph wants to take things further by creating model definitions with functional behaviors and semantic layering.

### **_Unigraph is a solution to building models that are structurally and semantically typed, and functional_**

| Feature                  | Python Dataclass    | Unigraph Model |
| ------------------------ | ------------------- | -------------- |
| Field Existence Check    | ✅ Yes (via typing) | ✅ Yes         |
| ---                      | ---                 | ---            |
| Type Checking            | ✅ Yes              | ✅ Yes         |
| Format Validation        | ✅ Yes              | ✅ Yes         |
| Logical Relationships    | ❌ No               | ✅ Yes         |
| Cross-Field Constraints  | ❌ No               | ✅ Yes         |
| Computed Properties      | ❌ No               | ✅ Yes         |
| Rule Execution Model     | ❌ No               | ✅ Yes         |
| Multi-language Libraries | ❌ No               | ✅ Yes         |

Behavior definitions in Unigraph models unlock an entire semantic layer of reasoning that goes beyond just validation. They allow attributes to self-describe their relationships in a larger ontology, even when those relationships extend beyond the immediate scope of a single service.

**Pydantic models** handle **runtime validation** at the **individual object level**, ensuring **type correctness, required fields, and format validation**. However, they **lack a connection to the broader semantic web**, meaning:

1. They **don’t understand relationships** between different entities.
2. They **can’t enforce constraints** that depend on external context.
3. They **only validate within the scope of a single object**, not across an **interconnected system**.

On the other hand, Unigraph models can be **embedded within the semantic web**, allowing:

1. **Cross-Entity Reasoning** – Attributes can be **validated in the context of the entire system**.
2. **Ontology Integration** – Entities are **aware of their relationships** with other entities.
3. **Behavioral Constraints** – A model doesn’t just check its own fields, it **knows how it should behave** in the context of a system.
