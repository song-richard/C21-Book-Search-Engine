const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

//Apollo Server
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

//Auth
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

//New instance of Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

//Establish connection with Apollo Server
const connectToApollo = async () => {
  await server.start();
  // Apply Apollo Server as middleware to Express app
  server.applyMiddleware({ app });
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
  
// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
};

// Call connectToApollo function to start the server and apply middleware
connectToApollo().then(() => {
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`GraphQL started on: http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
});
