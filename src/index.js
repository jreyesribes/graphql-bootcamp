"use strict";

import { GraphQLServer } from 'graphql-yoga';


// Schema
const typeDefs = `
  type Query {
    greeting(name:String): String!
    me: User!
    post: Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
  }
`;



// Resolvers
const resolvers = {
  Query: {
    greeting(parent, args, ctx, info) {
      if (args.name) {
        return `Hello, ${args.name}!`;
      } else {
        return "hello";
      }
    },
    me() {
      return {
        id: "123098",
        name: "Mike",
        email: "mike@example.com",
        age: 28
      };
    },
    post() {
      return {
        id: "473912",
        title: "Titulo del post",
        body: "Cuerpo del post",
        published: true
      };
    }
  }
};


const server = new GraphQLServer({
  typeDefs,
  resolvers
});


server.start(() => {
  console.log('Server status: UP');
});
