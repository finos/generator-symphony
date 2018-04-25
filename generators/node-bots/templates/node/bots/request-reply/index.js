const Symphony = require('symphony-api-client-node');

const botHearsSomething = ( event, messages ) => {
    messages.forEach( (message, index) => {
      let reply_message = 'Hello ' + message.initiator.user.firstName + ', hope you are doing well!!'
      Symphony.sendMessage( message.payload.messageSent.message.stream.streamId, reply_message, {}, Symphony.MESSAGEML_FORMAT);
    })
}

Symphony.initBot(__dirname + '/config.json')
  .then( (symAuth) => {
    Symphony.getDatafeedEventsService( botHearsSomething );
  })
