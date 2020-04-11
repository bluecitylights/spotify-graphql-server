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


## Retrieve all pointlogic discover playlists:
```
POST https://spotify-graphql-3odb3mbbdq-ew.a.run.app/graphql HTTP/1.1
Host: spotify-graphql-3odb3mbbdq-ew.a.run.app
Connection: keep-alive
Content-Length: 993
accept: */*
Sec-Fetch-Dest: empty
Authorization: Bearer BQDJAZ3pf6o1Y9sG7kyqYaTKw_xx7s750UhIApjd-iRfjxkZkL-cVCyuTN3JSX0E_O_WtIyjxxLasTelxeVJMFfUWS8oKZ60mT0bIB-iKqUMpGFPQsxsmA6auhkpp6PxRpGWqFyRHBwAqc0wyRvikqV0ulNvMBjg6d3Q1q3n6jqPFH_HDqsTXoGXBNRfv0KBC1W-0QbA6_il__cJC94YP3I
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36
DNT: 1
content-type: application/json
Origin: https://spotify-graphql-3odb3mbbdq-ew.a.run.app
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Referer: https://spotify-graphql-3odb3mbbdq-ew.a.run.app/graphql?query=query%20playlists%28%24playlistids%3A%20%5BString%5D%29%20%7B%0A%20%20playlists%28ids%3A%20%24playlistids%29%20%7B%0A%20%20%20%20name%0A%20%20%20%20id%0A%20%20%20%20tracks%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20artists%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%7D%0A%09%09%7D%0A%20%20%7D%0A%20%20%20%20%0A%20%20%0A%7D
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9,nl;q=0.8,fr;q=0.7,de;q=0.6

{"operationName":"playlists","variables":{"playlistids":["5oiVUbeQBKAp8rPBuqP2rc","7IZxicknB6NvdeS0pFK6hw","3aVmlULrTxZLkPT1V3tw2r","3KAAmyT8cC2PExBkSYLELu","480U825k3yNkPwabm6H0k9","5e5ia6ssY8VywGgUGyNcXR","355sZcK90HrxDulfLS2DZm","5Qzxy06sBV7k5gptAZ9KYY","7JW4hoHrl4oMngDD82k2tE","2mYGFjyXH00sxIFOhfIBZ2","2p4PGnQyvoOw9NjJAY1uIC","0cxweUp9hijeHkzhrdRsUT","6KQBAJBp3DgLjTVSO4nG8H","3ECt4W2lLvMI9igd9fLxzo","7DL8bJMmq48pp22la2P62c","3oGl63aMwkWTEGrUsWTGCJ","2qMXlG8g2V40rkyXgXElso","7qyTk6Jx28LLTgPc0Krlv9","0jZcenHKAADvLfH1mkHES1","0s3aARtWRAROZl4SBvOiE1","4I55hMRADnJCWo8LDkJOIl","5SFN9pkp3z08DGic7EIAaf","3wEgcNtRNw3xebl8qpO0Rj","10H4fyEPO57nZVkoenC1ge","1lxMVUsqicpp4X7IMwXnRm","6eDPyGhgxF0ius3v3b6j2F","2oMeHAyYesiojzX0O5ZR90","4qkS98UfeuNJ9RcVmw0Zp6","7kUGWUbDtqr31KNWpZMMmq"]},"query":"query playlists($playlistids: [String]) {\n  playlists(ids: $playlistids) {\n    name\n    id\n    tracks {\n      name\n      id\n      artists {\n        name\n        id\n      }\n    }\n  }\n}\n"}
```
