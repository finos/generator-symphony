const Symphony = require('symphony-api-client-node');
const nlp = require('compromise');
const SymphonyBotNLP = require('./lib/SymphonyBotNLP');

/* Callback function when the BOT hears a request */
const botHearsRequest = ( event, messages ) => {

    messages.forEach( (message, index) => {

      let doc = nlp(message.messageText);

      /* Find grettings */
      let doc_grettings = doc.match('(hello|hi|bonjour)').out('tags');
      if (doc_grettings.length>0) {
        let reply_message = 'Hello ' + message.user.firstName;
        Symphony.sendMessage( message.stream.streamId, reply_message, null, Symphony.MESSAGEML_FORMAT);
      }

      /* Detect & analyze request */
      SymphonyBotNLP.findPattern( doc, message );

    })
}

/* Initialize BOT to Symphony */
Symphony.initBot(__dirname + '/config.json').then( (symAuth) => {
  Symphony.getDatafeedEventsService( botHearsRequest );
})
