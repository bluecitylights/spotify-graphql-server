# spotify-graphql-server
This application supports a graphQL API for spotify data and combines it with lyrics database. The orignal code is forked from the repo mentioned in this blog
[english blog post](https://blog.codecentric.de/en/2017/01/lets-build-spotify-graphql-server)
The code for user authentication is inspired by  https://pusher.com/tutorials/spotify-history-react-node

## Get started

### prerequisites

For running this example locally, you must 
[register your own application at spotify](https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app).
Then create an [.env](./.env) file with the generated token, based on the example [.env.example](./.env.example) file.

Have a modern `node.js` version ( >=8 ) installed.

Run `npm install`. 

### run server

`npm start` to start the graphql server, then open http://localhost:4000/

`npm run watch` to start the graphql server which automatically restarts when any sources were changed (driven by `nodemon`)

### run tests

`npm test`

### print GraphQL schema idl

`npm run printSchema`
