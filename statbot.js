let Botkit = require('botkit');

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
  
  var bot = controller.spawn({});
  
  
  function setupReceive(port){
    controller.setupWebserver(port, function(err, webserver) {
      controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('Ready to receive messages');
      });
    });
  }
  if(options.port)
    setupReceive(options.port);
  else
    require('portfinder').getPort(function(err, port){
      if(err) throw new Error(err);
      options.port = port;
      setupReceive(port);
    });
  
  //Catch-all
  controller.on('message_received', function(bot, message) {
      bot.reply(message, 'Unknown command.');
      return false;
  });
  
  function says(callback){
    callback((thing) => {
      bot.say({
        text: JSON.stringify(thing),
        channel: options.page_scoped_user_id
      });
    });
  }
  
  function hears(matches, callback){
    controller.hears(matches, 'message_received', function(bot, message){
      if(message.user == options.page_scoped_user_id){
        function reply(text){
          bot.reply(message, text);
        }
        callback(message.text, reply);
      }
    });
  }
  
  return {
    says: says,
    hears: hears,
    port: options.port
  };
}