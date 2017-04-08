module.exports = function(options){ // For example, statbot.use(logtail({file:"/var/log/secure"}))
  let Tail = require('tail').Tail;
  let tailer = new Tail(options.file, {follow: true});
  
  return function(say){
    tailer.on('line', (data) => say(options.file, data));
    tailer.on('err', (data) => say(options.file + ' err', data));
  }
};
