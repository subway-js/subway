# POC (Proof of Concept) projects

Here's some details about the projects that are helping me shaping SubwayJS:

- this [nice tutorial](https://cqrs.nu/tutorial/cs/01-design) guides the reader toward the design of a system in a 'CQRS' way: `/example/event-sourcing/` is a playground for SubwayJS API and a very basic implementation of such tutorial

- `/example/micro-frontend/` is a playground for the micro-frontends support of SubwayJS

- I implemented the [tutorial mentioned before](https://cqrs.nu/tutorial/cs/01-design) as a [react web application](https://github.com/subway-js/subway-react-restaurant), to start understanding how SubwayJS development looks like with ReactJS - I am not updating this project anymore

- I started implementing an actual use case, an [ecommerce react website](https://github.com/subway-js/subway-react-ecommerce), to understand the value of the library in a real use-case (session, API calls, communication between sub-systems), and also to start thinking about a possible subway-react utility library.

- I am investigating micro frontends in React in the [subway-react-ecommerce-microfrontends repository](https://github.com/subway-js/subway-react-ecommerce-microfrontends) by splitting the react ecommerce website into micro frontends (possibly in multiple ways)