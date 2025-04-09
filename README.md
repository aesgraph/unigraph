![V0 Progress](https://img.shields.io/github/milestones/progress/aesgraph/unigraph/1?label=V0%3A%20full%20product%20demo&color=blue)
[![codecov](https://codecov.io/gh/aesgraph/unigraph/branch/main/graph/badge.svg)](https://codecov.io/gh/aesgraph/unigraph)
![Discord](https://img.shields.io/discord/1347095524737679380?color=9cf)
[![Build](https://github.com/aesgraph/unigraph/actions/workflows/build.yml/badge.svg)](https://github.com/aesgraph/unigraph/actions)

# Unigraph

Unigraph is a human-centric graph model engine, application library, and information exchange platform.

Unigraph is a general solution for web-based client-side interaction with Graphs. It aims to serve as a framework through which various independently developed graph-based applications can interoperate.

Unigraph provides first-class mechanisms for managing display scenes independently from the underlying graph
model, allowing for highly flexible and interactive representations of complex structured data.

### [Live Demo](https://unigraph.vercel.app/) <br>

#### [Notes and documentation](https://aesgraph.github.io/unigraph/)

#

### Getting started with the browser version

<ins>Running the app locally through the browser</ins><br>

1. `git clone https://github.com/aesgraph/unigraph.git`
2. `cd unigraph`
3. `npm install`<br>
4. `npm start`<br>
5. Open http://localhost:3000/

### Getting started with the Desktop GUI

<ins>Running the desktop app locally</ins><br>

1. `git clone https://github.com/aesgraph/unigraph.git`
2. `cd unigraph-desktop`
3. `npm install`<br>
4. `npm run dev`<br>
5. Wait for the GUI splash screen loader, and desktop version to complete loading uniqgraph

### Getting started with the Documentation locally

<ins>Documentation: Serving Locally</ins><br>
_For developing and previewing documentation locally_<br>

1. `brew install ruby`
2. `gem install jekyll bundler`
3. `cd docs`
4. `bundle install`
5. `bundle exec jekyll serve --livereload`
6. Go to http://localhost:4000/
