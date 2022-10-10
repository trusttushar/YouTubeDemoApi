if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  const express = require("express");
  const app = express();
  const bodyParser = require("body-parser");
  const router = require("./src/routes/router");
  const mongoose = require("mongoose");
  const { graphqlHTTP } = require("express-graphql");

  const userAuth = require("./src/middleware/userAuth");
  const schema = require("./src/graphql/schema");
  const root = require("./src/graphql/resolvers");
  
  const port = process.env.PORT || 3001;
  const DatabaseUrl = "mongodb://localhost:27017/StreamApp";
  const fileUpload = require('express-fileupload');
  const cors = require("cors")
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use('/static', express.static('public'))
  app.use(cors())
  app.use(fileUpload());
  app.use(userAuth);
  
  app.use(router);
  
  app.use(
    "/graphql",
    graphqlHTTP((request) => {
      return {
      schema: schema,
      rootValue: root,
      context: { 
        user: request.user
    },
      graphiql: true
    }
    })
  );
  
  mongoose
    .connect(DatabaseUrl)
    .then((result) => {
      app.listen(port, () => {
        console.log("App is now running at post : ", port);
      });
    })
    .catch((err) => {
      console.log("Error connecting Database", err.message);
    });
  