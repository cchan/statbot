require('dotenv-safe').load();
let Botkit = require('botkit');
let pm2 = require('pm2');

let controller = Botkit.facebookbot({
  debug: false,
  log: true,
  access_token: process.env.FB_PAGE_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN,
  app_secret: process.env.FB_APP_SECRET,
  validate_requests: true,
});

var bot = controller.spawn({
});

controller.setupWebserver(process.env.PORT, function(err, webserver) {
  controller.createWebhookEndpoints(webserver, bot, function() {
    pm2.launchBus((err, bus) => {
      bus.on('log:out', data => {
        //bot.reply...? bot.say?
      });
    });
  });
});

controller.api.thread_settings.greeting('Hello! I\'m a Botkit bot!');
controller.api.thread_settings.get_started('sample_get_started_payload');
controller.api.thread_settings.menu([
    {
        "type":"postback",
        "title":"Hello",
        "payload":"hello"
    },
    {
        "type":"postback",
        "title":"Help",
        "payload":"help"
    },
    {
      "type":"web_url",
      "title":"Botkit Docs",
      "url":"https://github.com/howdyai/botkit/blob/master/readme-facebook.md"
    },
]);

controller.hears(['^hello', '^hi'], 'message_received,facebook_postback', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.on('message_received', function(bot, message) {
    bot.reply(message, 'idk wut that means');
    return false;
});

