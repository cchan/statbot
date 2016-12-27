require('dotenv-safe').load();
let Botkit = require('botkit');

let controller = Botkit.facebookbot({
  debug: true,
  log: true,
  access_token: process.env.FB_PAGE_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN,
  app_secret: process.env.FB_APP_SECRET,
  validate_requests: true,
});

let bot = controller.spawn({});

controller.setupWebserver(process.env.PORT, function(err, webserver) {
  controller.createWebhookEndpoints(webserver, bot, function() {
    console.log('ONLINE!');
  });
});


