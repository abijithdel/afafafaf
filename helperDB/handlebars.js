const Handlebars = require('handlebars');

// Register a helper to truncate a string
Handlebars.registerHelper('truncate', function (str, length) {
  if (str.length > length) {
    return str.substring(0, length) + '...';
  }
  return str;
});
