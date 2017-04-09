module.exports = function(file, options){ // For example, statbot.use(logtail("/var/log/secure"))
  let Tail = require('tail').Tail;
  let tailer = new Tail(file, {follow: true});
  
  return function(say){
    tailer.on('line', (data) => {
      if(options && typeof options.transform === "function")
        data = options.transform(data);
      if(data)
        say(file, data);
    });
    tailer.on('err', (data) => {
      if(options && typeof options.transform === "function")
        data = options.transform(data);
      if(data)
        say(file + ' err', data);
    });
  };
};
