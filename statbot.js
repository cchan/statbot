let Botkit = require('botkit');

//todo: unit test with https://github.com/spchuang/fb-local-chat-bot

module.exports = function(options){
  if(!options.verify_token || !options.page_token || !options.app_secret || !options.page_scoped_user_id)
    throw new Error("Fatal: missing required options for statbot initialization.");
  
  let controller = Botkit.facebookbot({
    debug: false,
    log: true,
    access_token: options.page_token,
    verify_token: options.verify_token,
    app_secret: options.app_secret,
    validate_requests: true,
    require_delivery: true,
    receive_via_postback: true
  });
  
  let bot = controller.spawn({});
  
  function listen(port){
    //Catch-all from user (needs to be set up last I think?)
    controller.on('message_received', function(bot, message) {
      if(message.user == options.page_scoped_user_id)
        bot.reply(message, 'Unknown command.');
    });
    
    //Set up receive webhook for Facebook
    controller.setupWebserver(port, function(err, webserver) {
      controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('Ready to receive messages on port ' + port);
      });
    });
  }
  
  //Say things
  function say(channel, thing){
    bot.say({
      text: '[' + channel + '] ' + JSON.stringify(thing),
      channel: options.page_scoped_user_id
    });
  }
  
  //Say things when heard things [this is just a special case; maybe make this a middleware?]
  function hears(channel, matches, callback){
    controller.hears(matches, 'message_received', function(bot, message){
      if(message.user == options.page_scoped_user_id)
        callback(message.text, (text)=>{bot.reply(message, '[' + channel + '] ' + text);});
    });
  }
  
  function use(channel, middleware){
    middleware(say.bind(channel));
  }
  
  return {
    say: say,
    hears: hears,
    listen: listen,
    use: use
  };
}

module.exports.logtail = require('./botbits/logtail');
