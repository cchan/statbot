let Botkit = require('botkit');

//todo: statbot.use(statbot.logwatch({options}))
  //module.exports.logwatch = require("./botbits/logwatch");
//todo: https://github.com/spchuang/fb-local-chat-bot

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
  function say(thing){
    bot.say({
      text: JSON.stringify(thing),
      channel: options.page_scoped_user_id
    });
  }
  
  //Say things when heard things
  function hears(matches, callback){
    controller.hears(matches, 'message_received', function(bot, message){
      if(message.user == options.page_scoped_user_id)
        callback(message.text, (text)=>{bot.reply(message, text);});
    });
  }
  
  return {
    say: say,
    hears: hears,
    listen: listen
  };
}