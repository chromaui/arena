const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const basicAuth = require('express-basic-auth');

module.exports = function() {
  const hbs = exphbs.create({
    defaultLayout: `${__dirname}/views/layout`,
    handlebars,
    partialsDir: `${__dirname}/views/partials/`,
    extname: 'hbs',
  });

  require('handlebars-helpers')({ handlebars });

  const app = express();

  const defaultConfig = require(path.join(__dirname, 'config', 'index.json'));

  const Queues = require('./queue');
  const queues = new Queues(defaultConfig);
  require('./views/helpers/handlebars')(handlebars, { queues });
  app.locals.Queues = queues;
  app.locals.appBasePath = '';

  app.set('views', `${__dirname}/views`);
  app.set('view engine', 'hbs');
  app.set('json spaces', 2);

  app.engine('hbs', hbs.engine);

  app.use(bodyParser.json());

  if (process.env.ADMIN_AUTH_PASSWORD) {
    app.use((req, res, next) => {
      console.log(req.headers);
      if (req.path === '/') {
        return next();
      }

      basicAuth({
        users: { admin: process.env.ADMIN_AUTH_PASSWORD },
        challenge: true,
      })(req, res, next);
    });
  }

  return {
    app,
    Queues: app.locals.Queues,
  };
};
