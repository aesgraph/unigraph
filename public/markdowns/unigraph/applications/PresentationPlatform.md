Like the game-engine of powerpoint

### Digitizing educational courses into digital knowledge graphs

Typical research on the internet today involves reading articles across various sites, bookmarking or downloading them, and taking notes using siloed applications.
Unigraph aims to centralize the process of learning and organization within a single application, and is a natural platform for teachers and students to connect.

For example, a university professor may present a syllabus of all the material to be covered in the class, but that syllabus is static content, either on a piece of paper or a web site.
With Unigraph, the university professor could theoretically build a digital knowledge object that encompasses the totality of their course, eliminating the need for students to physically move between textbooks, online resources, and other media. This knowledge object could include specific sections of text to be covered in the class, links to other resources and homework assignments, class discussions, or any other relevant content, all structured for easy discovery and navigation.

### Logical knowledge graphs for developer documentation

Large companies have dedicated teams and pipelines for making internal documentation available to developers to facilitate collaboration and improve productivity.
Unigraph can serve as a layer to codify and validate information that is generated in a compositional manner, as well as be a means to inspect and navigate this information.
Linear documents with tons of hyperlinking can desync, become redundant, or confuse the reader because of information overload and unfamiliarity with the writer's train of thought.
Unigraph offers tools to encode arbitrarily complex data in a way that can be easily understood, where human-centric information interaction is one of its key purposes.

#### Case study for an API team

    There is a ton of information an API team could codify about their product, so let's approach things categorically.
        An API service can be divided into..
            - endpoints: the functional primitives the service provides
            - data model: the ontological data model the api is built around, and how it is managed by the service
            - security: authentication and authorization
            - upstream and downstream callers: where does the api lie in the path of a distributed system

        Library dependencies
        Development platform information
        Debugging tools
        Technical documentation
        Environments
        There can be many API services that interact with each other
        From a development perspective, these services can ...


    All of this information could be codified into a single-source-of-truth object that is actually interpretable.
