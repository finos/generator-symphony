var https = require('https');
const Q = require('kew');
const Symphony = require('symphony-api-client-node');

var SymphonyBotActions = {}

SymphonyBotActions.buyShares = (tags, context_params, message) => {

  /* Define the reply message */
  let reply_message = 'You want to buy <b>' + context_params.amount + '</b> of <b>' + tags[1].text + '</b> shares';

  /* Reply to the initiator */
  Symphony.sendMessage( message.stream.streamId, reply_message, null, Symphony.MESSAGEML_FORMAT);

};

SymphonyBotActions.sellShares = (tags, context_params, message) => {

  /* Define the reply message */
  let reply_message = 'You want to sell <b>' + context_params.amount + '</b> of <b>' + tags[1].text + '</b> shares';

  /* Reply to the initiator */
  Symphony.sendMessage( message.stream.streamId, reply_message, null, Symphony.MESSAGEML_FORMAT);

};

SymphonyBotActions.getPrice = (tags, context_params, message) => {

  var body = {};
  var options = {
      hostname: 'api.iextrading.com',
      port: 443,
      path: "/1.0/stock/" + tags[1].text + "/delayed-quote",
      method: 'GET',
      json: true
  };

  var req = https.request(options, function(res) {
      var str = '';
      res.on('data', function(chunk) {
          str += chunk;
      });
      res.on('end', function() {
          var json_str = JSON.parse(str);
          console.log(str);

          /* Define the reply message */
          let reply_message = 'The current price of <b>' + tags[1].text + '</b> is <b>$' + json_str.delayedPrice + '</b>' +
                              '<br/>(high: <span class="tempo-text-color--green"><b>$' + json_str.high + '</b></span>) ' +
                              '(low: <span class="tempo-text-color--red"><b>$' + json_str.low + '</b></span>)';

          /* Reply to the initiator */
          Symphony.sendMessage( message.stream.streamId, reply_message, null, Symphony.MESSAGEML_FORMAT);

      });
      res.on('error', function(e) {
          console.log('Error', e);
      });
  });

  req.write( JSON.stringify(body) );
  req.end();

};

module.exports = SymphonyBotActions;
