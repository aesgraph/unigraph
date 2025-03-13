---
title: "Unigraph: The Theory"
nav_order: 6
---

## Unigraph: The Theory

### Particulation and Recombination

### Organizational Complexity and Graph Engines

### Organizational Bridging via Dynamic and Strongly Typed Models

**Unigraph is a solution to eliminate the multiplicative redundancy in building message translation layers across organizational scopes.**

Lets start with a basic use case for Unigraph.<br>
Amazon S3 is a storage service, and has created a worldwide standard for managing permissions through policies, which are simply files of a certain format.<br>
Any other service understands what the structure and semantics of a policy file are, so they are free to use it in their own implementations.<br>

Ceph [implementation INCOMPLETE, model INCOMPLETE, format X response]<br>
-> boto3 [implementation INCOMPLETE, model COMPLETE, format Y response]<br>
-> API (reverse proxy, format Y or Z response)<br>
WHYYY<br>
Why would Ceph not match boto3? (investigate)

Unigraph: Define the policy as a Unigraph model to act as a message translation layer module. This module can be published so that any system may use it to interface with other systems outside of its organizational scope.

Amazon -> Publish model to Unigraph<br>
-> boto3<br>
-> Ceph<br>
-> any other system<br>

Ceph [implementation INCOMPLETE, model COMPLETE, format T response]<br>
-> boto3 [implementation COMPLETE, model COMPLETE, format T response]<br>
-> API (reverse proxy, format T response)<br>

\*check if true: The truth of the matter is even boto3 is always battling to keep up with the standard, since Amazon is a massive org with many systems constantly evolving. and so this is where semantic versioning of the model becomes important.
