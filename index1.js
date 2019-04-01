var express = require('express'),
    app     = express(),
    morgan  = require('morgan');

var cors = require('cors')
	
const dialogflow = require('dialogflow');
const bodyParser = require("body-parser");

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

const uuid = require('uuid');

const keyPath = 'auth1.json'; //process.env.DF_SERVICE_ACCOUNT_PATH;

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: keyPath
})

const sessionId = uuid.v4();

const projectId = 'slothambassador';

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

app.use(cors())

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

// Serve static html files for the customer and operator clients
app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/static/index1.html`);
});

app.post('/', (req, res)=>{
	runSample(req.body.text, res);
});

async function runSample(msg, res) {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: msg,
        languageCode: 'en-US',
      },
    },
  };
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  if (result.intent) {
	res.json({'status':true, 'data': result});
  } else {
	res.json({'status':false, 'data': 'Sorry. I didn\'t get it'});
    //console.log(`  No intent matched.`);
  }
}


app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;