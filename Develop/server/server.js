const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

//Apollo Server
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./schemas');

//Auth
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

//New instance of Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers
});

//Establish connection with Apollo Server
const connectToApollo = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  };
  
  app.use('/graphql', expressMiddleware(server,{
    context: authMiddleware
  }));

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`GraphQL started on: http://localhost:${PORT}/graphql`);
    });
  });
};

connectToApollo();