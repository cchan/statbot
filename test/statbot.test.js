/*
Not a true testing script, more of an example
(it's hard to test fb messenger bot, may need to use ngrok/lt 
as well as other things - https://github.com/spchuang/fb-local-chat-bot)

NOT IMPLEMENTED YET
    statbot.use(statbot.logwatch({options}))
*/

require('dotenv-safe').load();
let ostb = require('os-toolbox');

let statbot = require('statbot')({
  verify_token: process.env.FB_VERIFY_TOKEN,
  page_token: process.env.FB_PAGE_TOKEN,
  app_secret: process.env.FB_APP_SECRET,
  page_scoped_user_id: process.env.FB_USER_ID,
  port: 5812
});

pm2.connect(() => {
  pm2.launchBus((err, bus) => {
    bus.on('log:out', packet => {
      statbot.say('[' + packet.process.name + '] ' + packet.data);
    });
    bus.on('log:err', packet => {
      statbot.say('[' + packet.process.name + '][err] ' + packet.data);
    });
  });
});

statbot.hears(["status"], (text, reply) => {
  reply("Uptime: " + ostb.uptime() + "s");
  ostb.cpuLoad().then(function(cpuusage){
    reply("CPU: " + cpuusage + "%");
  });
  ostb.memoryUsage().then(function(memusage){
    reply("Memory: " + cpuusage + "%");
  });
});

console.log(statbot.port);
