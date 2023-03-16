const express = require('express')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql')
const app = express()
const port = 4000
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const User = require('./schema/user')
const mongoose = require('mongoose')

mongoose
  .connect("mongodb://localhost:27017/graphQL-crud", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLID
  } = require('graphql');
  
  // Define the schema types
  const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLID) },
      name: { type: GraphQLString },
      email: { type: GraphQLString },
    }),
  });
  
  // Define the queries
  const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      users: {
        type: new GraphQLList(UserType),
       async resolve() {
            return await User.find({});
        },
      },
      user: {
        type: UserType,
        args: {
          _id: { type: GraphQLNonNull(GraphQLString) },
        },
       async resolve(parent, args) {
            const { _id } = args;
            return await User.findOne({_id:_id})
        },
      },
    },
  });
  
  // Define the mutations
  const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
      fields: {
          addUser: {
              type: UserType,
              args: {
                  name: { type: GraphQLNonNull(GraphQLString) },
                  email: { type: GraphQLNonNull(GraphQLString) },
              },
              async resolve(parent, args) {
                  let result = await User.create(args);
                  return result
              },
          },
          updateUser: {
              type: UserType,
              args: {
                  _id: { type: GraphQLNonNull(GraphQLString) },
                  name: { type: GraphQLString },
                  email: { type: GraphQLString },
              },
              async resolve(parent, args) {
                  const { _id, name, email } = args;
                  const updatedUser = await User.findByIdAndUpdate(
                      _id,
                      { name, email },
                      { new: true }
                  );
                  return updatedUser;
              },
          },
          deleteUser: {
              type: UserType,
              args: {
                  _id: { type: GraphQLNonNull(GraphQLString) },
              },
              async resolve(parent, args) {
                  const { _id } = args;
                  const deletedUser = await User.findByIdAndDelete(_id);
                  return deletedUser;
              },
          }
      }
  });
  
  // Define the schema
  const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
  });
  
  // Mount the GraphQL endpoint to the Express server
  app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
  }));
  
app.use(cors())



app.listen(port, () => {
  console.log(`Running a server at http://localhost:${port}`)
})