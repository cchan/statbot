module.exports = function(options){ // For example, statbot.use(logtail({file:"/var/log/secure"}))
  let Tail = require('tail').Tail;
  let tail = new Tail(options.file, {follow: true});
  
  return function(say){
    tail.on('line', (data) => say(data));
    tail.on('err', (data) => say('[ERR] ' + data));
  }
}
