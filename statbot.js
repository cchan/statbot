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
  
  function listen(port, callback){
    callback = callback || function(){};
    
    //Catch-all from user (needs to be set up last I think?)
    controller.on('message_received', function(bot, message) {
      if(message.user == options.page_scoped_user_id)
        bot.reply(message, 'Unknown command.');
    });
    
    //Set up receive webhook for Facebook
    controller.setupWebserver(port, function(err, webserver) {
      if(err)
        callback(err);
      controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('Ready to receive messages on port ' + port);
        callback(null);
      });
    });
  }
  
  //Say things, with caching and a char limit.
  //Channel length must be << CHAR_LIMIT for this to work properly.
  var saycache = {};
  const SAY_CACHE_DELAY = 1500; //ms
  const CHAR_LIMIT = 640; //https://developers.facebook.com/docs/messenger-platform/send-api-reference#request
  function say(channel, thing){
    if(typeof thing !== "string")
      thing = JSON.stringify(thing);
    
    if(!saycache[channel])
      saycache[channel] = {timeout: null, content: '[' + channel + ']'};
    else
      clearTimeout(saycache[channel].timeout);
    
    //Sends only after a delay of no activity.
    saycache[channel].timeout = setTimeout(function(){
      raw_say(saycache[channel].content);
      delete saycache[channel];
    }, SAY_CACHE_DELAY);
    
    //Append to the content.
    saycache[channel].content += '\n' + thing.replace('\\n', '\n');
    
    //If exceeds the CHAR_LIMIT, chunk off the extra from the beginning
    while(saycache[channel].content.length >= CHAR_LIMIT){
      raw_say(saycache[channel].content.slice(0, CHAR_LIMIT - 4) + '\n...');
      saycache[channel].content = '[' + channel + ']\n' + saycache[channel].content.slice(CHAR_LIMIT - 4);
    }
  }
  function raw_say(text){
    bot.say({
      text: text,
      channel: options.page_scoped_user_id
    });
  }
  
  //Say things when heard things [this is just a special case; maybe make this a middleware?]
  function hears(channel, matches, callback){
    controller.hears(matches, 'message_received', function(bot, message){
      if(message.user == options.page_scoped_user_id)
        callback(message.text, say.bind(null, channel));
    });
  }
  
  function use(middleware){
    middleware(say);
  }
  
  return {
    controller: controller,
    say: say,
    hears: hears,
    listen: listen,
    use: use
  };
}

module.exports.logtail = require('./botbits/logtail');
