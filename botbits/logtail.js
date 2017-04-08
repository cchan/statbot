module.exports = function(file, options){ // For example, statbot.use(logtail("/var/log/secure"))
  let Tail = require('tail').Tail;
  let tailer = new Tail(file, {follow: true});
  
  return function(say){
    tailer.on('line', (data) => say(file, data));
    tailer.on('err', (data) => say(file + ' err', data));
  }
};
