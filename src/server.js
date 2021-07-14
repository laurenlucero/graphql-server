import { ApolloServer, gql } from 'apollo-server'
import GraphQLJSON from 'graphql-type-json'
import fetch from 'node-fetch'

async function getPeople(limit = 10) {
  const api = await fetch(`https://randomuser.me/api/?results=${limit}`)
  const json = await api.json()
  return json.results.map(person => ({
    name: Object.values(person.name).join(' '),
    email: person.email,
    age: getRandomNumber(100),
  }))
}

function getRandomNumber(max = 10) {
  return Math.floor(Math.random() * max)
}

const server = new ApolloServer({
typeDefs: gql`
scalar JSON
type Person {
  name: String
  email: String
  age: Int
} # custom type
  type Query {
    randomNumber: Int
    timestamp: String
    people(limit: Int): [Person]
    info: JSON
}
`, // describes types of data to return
resolvers: {
  JSON: GraphQLJSON,
  Query: {
    randomNumber: () => getRandomNumber(),
    timestamp: () => new Date().toISOString(),
    people: (root, args, context) => getPeople(args?.limit),
    info: (root, args, context) => context,
  }
}, // what the server does to fulfill the request
context: ({req}) => {
  return {
    ...req.headers,
    hello: "Static hello",
    magicNumber: getRandomNumber(111),
  }
}
})

server.listen().then(r => {
  console.log(`Listening at ${r.url}`)
})