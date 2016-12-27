require('dotenv-safe').load();
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
app.use(bodyParser.json());

app.all('/fb', function(req, res){
  if(req.body && req.body.message)
    console.log(req.body.message.text);
  res.sendStatus(200);
});

let listener = app.listen(process.env.PORT, function(){
  console.log("listening at :" + listener.address().port);
});
