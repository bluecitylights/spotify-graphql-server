let {
    buildSchema
} = require('graphql');

const schema = buildSchema(`
# The root of all queries:

type Query {
  me: User
  user(id: ID): User
  artists(byName: String = "Red Hot Chili Peppers"): [Artist]
  playlists(userId: ID, limit: Int = 20, offset: Int = 1): [Playlist]
}
type User {
  display_name: String
  id: ID
  image: String
  playlists: [Playlist]
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
