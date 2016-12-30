require('dotenv-safe').load();
let Botkit = require('botkit');
let pm2 = require('pm2');

/*
let statbot = require('statbot')({
  //Just pass in the botkit controller?
  //IS THERE A SUCH THING AS BOTKIT MIDDLEWARES? IF SO THEN I NEED THAT.
});


//In statbot.use(statbot.logwatch({options})):
statbot.says(say => {
  pm2.launchBus((err, bus) => {
    bus.on('log:out', data => {
      say(data);
    });
  });
});

statbot.hears(["status"], reply => {
  reply(blah);
});
*/


let controller = Botkit.facebookbot({
  debug: true,
  log: true,
  access_token: process.env.FB_PAGE_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN,
  app_secret: process.env.FB_APP_SECRET,
  validate_requests: true,
});

var bot = controller.spawn({});



module.exports.says = function(callback){
  function say(thing){
    bot.say({
      text: JSON.stringify(thing),
      channel: process.env.FB_USER_ID
    });
  }
  
  callback(say);
};



module.exports.hears(matches, callback){
  controller.hears(matches, 'message_received,facebook_postback', function(bot, message){
    function reply(text){
      bot.reply(message, text);
    }
    callback(reply);
  });
}

controller.setupWebserver(process.env.PORT, function(err, webserver) {
  controller.createWebhookEndpoints(webserver, bot, function() {
    console.log('Ready to receive messages');
  });
});



controller.hears(['^hello', '^hi'], 'message_received,facebook_postback', function(bot, message) {
  bot.reply(message, JSON.stringify(message.user));
  controller.storage.users.get(message.user, function(err, user) {
    if (user && user.name)
      bot.reply(message, 'Hello ' + user.name + '!!');
    else
      bot.reply(message, 'Hello.' + JSON.stringify(user));
  });
});


controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Unknown command.');
    return false;
});
