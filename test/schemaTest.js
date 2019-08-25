const mockServer = require('graphql-tools').mockServer;
const {resolvers} = require('../src/schema/resolvers');
const {typeDefs} = require('../src/schema/typeDefs');
const { makeExecutableSchema } = require('graphql-tools');

let cnt = 0;

const schema = makeExecutableSchema({ typeDefs, resolvers});

const simpleMockServer = mockServer(schema, {
    String: () => 'loremipsum ' + (cnt++),
    Album: () => {
        return {
            name: () => {return 'Album#1'}
        };
    }
});

const result = simpleMockServer.query(`{
    artists(byName:"Marilyn Manson") {
        name
        albums {
            name
            tracks {
                name
                artists { name }
            }
        }
    }
}`);

result.then(data => {
    console.log('data: ', JSON.stringify(data, '  ', 1));
}).catch(error => {
    console.log('error: ', error);
});
