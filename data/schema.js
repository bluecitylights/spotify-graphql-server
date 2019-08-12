let {
    buildSchema
} = require('graphql');

const schema = buildSchema(`
# The root of all queries:

type Query {
  # Just returns "Hello world!"
  hi(message: String = "Hi"): String
  Artists(byName: String = "Red Hot Chili Peppers"): [Artist]
  Playlists(limit: Int = 20, offset: Int = 1): [Playlist]
}
type Artist {
  name: String!
  id: ID
  image: String
  albums(limit: Int = 10): [Album]
}
type Album {
  name: String
  id: ID
  image: String
  tracks: [Track]
}
type Track {
  name: String!
  artists: [Artist]
  preview_url: String
  id: ID
},
type Playlist {
  name: String
  id: ID,
  image: String
  collaborative: Boolean
  tracks: [Track]
}
`);

module.exports = schema;
