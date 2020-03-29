
# SubwayJS  &middot; [![Build & Unit Tests](https://github.com/subway-js/subway/workflows/Build%20&%20Unit%20Tests/badge.svg?branch=master)](https://github.com/subway-js/subway/actions?query=workflow%3A%22Build+%26+Unit+Tests%22) [![Codecov](https://codecov.io/gh/subway-js/subway/branch/master/graph/badge.svg)](https://codecov.io/gh/subway-js/subway) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/subway-js/subway/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/%40subway-js%2Fsubway.svg)](https://badge.fury.io/js/%40subway-js%2Fsubway) ![npm version](https://img.shields.io/badge/stability-alpha-green)



Subway is a personal project from [danilorossi](https://github.com/danilorossi) that explores the idea of bringing some of the patterns and benefits of **Domain Driven Design, Event Sourcing and CQRS** to the browsers, for frontend and micro-frontends development.

That's a big statement, so let's first of all clarify how those patterns inspire Subway.

From **Domain Driven Design**:
- Subway promotes a software design that identifies clear sub-systems and boundaries, which not only leads to a more self-explaining codebase structure, it also helps shaping your development team structure, and prepares you for an easy transition to a micro-frontends model

From **Event Sourcing and CQRS**:
- Subway provides a *commands & events* way to describe a system behaviour that's easy to understand and to talk about. It also promotes the decoupling of each sub-system, which makes it easy to switch implementations and add new features


## Disclaimer

> **SubwayJS is an early stage work in progress** 

I am working on some projects (check the SubwayJS GitHub account or keep reading) as a way to shape the final API, architecture, and features of SubwayJS: please be aware that

- the codebase structure, API and this documentation are in a very dynamic state at the moment
- the projects I am working on shouldn't be consider a final example of how to use this library or how to write/organize a codebase in general
- projects themselves are changing frequently and may not be using the latest SubwayJS version when you read this

## Documentation

1. [SubwayJS concepts and design](./docs/concepts.md)
  
    Visit this section to understand what SubwayJS is and the model behind it

2. [Projects](./docs/projects.md)
    List of projects/examples I am working on to shape SubwayJS

3. [How to install & API](./docs/usage.md)

    Very basic API documentation


## Next steps

- Finalise the API design and documentation
- Codebase refactoring & testing
- add CI/CD pipeline
- ...

