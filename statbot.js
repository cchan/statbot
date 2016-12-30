let Botkit = require('botkit');

module.exports = function(options){
  if(!options.verify_token || !options.page_token || !options.app_secret || !options.page_scoped_user_id || !options.port)
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
  
  var bot = controller.spawn({});
  
  //Set up receive webhook for Facebook
  controller.setupWebserver(options.port, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
      console.log('Ready to receive messages');
    });
  });
  
  //Catch-all from user
  controller.on('message_received', function(bot, message) {
      bot.reply(message, 'Unknown command.');
      return false;
  });
  
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
    port: options.port
  };
}