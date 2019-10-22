"use strict";

import { GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4';

// Demo users
let users = [
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

let posts = [
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

let comments = [
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
    post: '3'
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
    createUser(data: CreateUserInput!): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput!): Post!
    deletePost(id: ID!): Post!
    createComment(data: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }

  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
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
      const emailTaken = users.some((user) => user.email === args.data.email );

      if (emailTaken) {
        throw new Error('email taken.');
      }

      const user = {
        id: uuidv4(),
        ...args.data
      };

      users.push(user);

      return user;
    },
    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex((user) => user.id === args.id );

      if (userIndex === -1) {
        throw new Error('User not found!');
      }

      const deleted = users.splice(userIndex, 1);

      posts = posts.filter((post) => {
        const match = post.author === args.id;

        if (match) {
          comments = comments.filter((comment) => comment.post !== post.id );
        }

        return !match;
      });

      comments = comments.filter((comment) => comment.author !== args.id );


      return deleted [0];
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author );

      if (!userExists) {
        throw new Error('User not found!');
      }

      const post = {
        id: uuidv4(),
        ...args.data
      };

      posts.push(post);

      return post;
    },
    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex((post) => post.id == args.id);

      if (postIndex === -1) {
        throw new Error('Post not found!');
      }

      const deletedPosts = posts.splice(postIndex, 1);

      comments = comments.filter((comment) => comment.post !== args.id);

      return deletePosts [0];
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author );

      if (!userExists) {
        throw new Error('User not found!');
      }

      const postExists = posts.some((post) => post.id === args.data.post && post.published );

      if (!postExists) {
        throw new Error('Post not found!');
      }

      const comment = {
        id: uuidv4(),
        ...args.data
      };

      comments.push(comment);

      return comment;
    },
    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex((comment) => comment.id == args.id);

      if (commentIndex === -1) {
        throw new Error('Comment not found!');
      }

      return comments.splice(commentIndex, 1) [0];
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
