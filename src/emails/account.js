var api_key = process.env.MAILGUN_API_KEY;
var domain = process.env.MAILGUN_DOMAIN;
var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });

// var data = {
//   from: "Excited User <yasmin@hyerdev.com>",
//   to: "yasmin@hyerdev.com",
//   subject: "Hello",
//   text: "Testing some Mailgun awesomeness!",
// };

// mailgun.messages().send(data, function (error, body) {
//   if (error) {
//     console.log(error);
//   }
//   console.log(body);
// });

//welcom email
const sendWelcomeEmail = (email, name) => {
  var data = {
    from: "Yas <yasmin@hyerdev.com>",
    to: email,
    subject: "Welcome to de app!",
    text: `Welcome ${name}, Let me know how you get along with the app.`,
  };

  mailgun.messages().send(data, function (error, body) {
    if (error) {
      console.log(error);
    }
  });
};

const sendCancelationEmail = (email, name) => {
  var data = {
    from: "Yas <yasmin@hyerdev.com>",
    to: email,
    subject: "Sorry to see you go",
    text: `Goodbye ${name} :(, Is there anything we could have done to kept you on board?
        Hope to see you back soon...`,
  };

  mailgun.messages().send(data, function (error, body) {
    if (error) {
      console.log(error);
    }
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
