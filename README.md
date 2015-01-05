Ape
===

Archimedes Physics Engine written in JavaScript

## Installation

Copy the folder to a local web server or set up a little web server (if you have python installed) with the following command:

```bash
python -m SimpleHTTPServer
```

## Development

It's required that you have the following:

- NodeJS > 0.10
- npm

Install the required node modules with:

```
npm install
```

From the command line run:

```bash
grunt
```

To generate a standalone file which is then included on the projects that want to use the engine

Also run:

```bash
grunt docs
```

To generate the documentation for the engine (powered by jsduck)

## Folder description

```
thesis/Thesis.pdf: The thesis document (in spanish)
demos: Examples of usage of the engine
demos/js: Source code of the engine
demos/T3: Little library which creates the environment for the demos
dist: source code concatenated and minified
images: images used in the presentations
lib: libraries used during the development of the framework
```