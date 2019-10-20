"use strict";

import { GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4';

// Demo users
const users = [
  {
    id: '1',
    name: 'Javier Reyes',
    email: 'jreyesribes@gmail.com'
  },
  {
    id: '2',
    name: 'Pepe',
    email: 'pepe@example.com',
    age: 20
  },
  {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com'
  }
];

// Demo posts

const posts = [
  {
    id: '1',
    title: 'First post test',
    body: '',
    published: false,
    author: '1'
  },
  {
    id: '2',
    title: 'Second post test',
    body: 'Content of my second post',
    published: true,
    author: '1'
  },
  {
    id: '3',
    title: 'Third post',
    body: 'Content of the third post',
    published: true,
    author: '2'
  },
];

// Demo comments.

const comments = [
  {
    id: '1',
    text: 'First comment',
    author: '1',
    post: '2'
  },
  {
    id: '2',
    text: 'Second comment',
    author: '1',
    post: '2'
  },
  {
    id: '3',
    text: 'Third comment',
    author: '2',
    post: '3'
  },
  {
    id: '4',
    text: 'Fourth comment',
    author: '3',
    post: '2'
  },
]


// Schema
const typeDefs = `
  type Query {
    greeting(name:String): String!
    me: User!
    post: Post!
    add(nums: [Float!]!): Float!
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
  }

  type Mutation {
    createUser(name: String!, email: String! age: Int): User!
    createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
    createComment(text: String!, author: ID!, post: ID!): Comment!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
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
    },
    add(parent, args, ctx, info) {
      if (args.num.length > 0) {
        return args.num.reduce((accum, curr) => {
          return accum + curr;
        });
      } else {
        return 0;
      }
    },

    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }

      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts;
      }

      return posts.filter((post) => {
        const
          isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase()),
          isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());

        return isTitleMatch || isBodyMatch;
      });
    },
    comments() {
      return comments;
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.post === parent.id;
      });
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id;
      });
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return post.id === parent.post;
      });
    }
  },

  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.email );

      if (emailTaken) {
        throw new Error('email taken.');
      }

      const user = {
        id: uuidv4(),
        name: args.name,
        email: args.email,
        age: args.age
      };

      users.push(user);

      return user;
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.author );

      if (!userExists) {
        throw new Error('User not found!');
      }

      const post = {
        id: uuidv4(),

        title: args.title,
        body: args.body,
        published: args.published,
        author: args.author,
      };

      posts.push(post);

      return post;
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.author );

      if (!userExists) {
        throw new Error('User not found!');
      }

      const postExists = users.some((post) => post.id === args.post && post.published );

      if (!postExists) {
        throw new Error('Post not found!');
      }

      const comment = {
        id: uuidv4(),

        text: args.text,
        author: args.author,
        post: args.post
      };

      comments.push(comment);

      return comment;
    }
  },
};


const server = new GraphQLServer({
  typeDefs,
  resolvers
});


server.start(() => {
  console.log('Server status: UP');
});
