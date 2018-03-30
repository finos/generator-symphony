const Symphony = require('symphony-api-client-node');

const botHearsSomething = ( event, messages ) => {
    messages.forEach( (message, index) => {
      let reply_message = 'Hello ' + message.initiator.user.firstName + ', hope you are doing well!!'
      Symphony.sendMessage( '4t_gCZNFAl0BMjzFUj3i43___qLn3FQbdA', reply_message, {});
    })
}

Symphony.initBot(__dirname + '/config.json')
  .then( (symAuth) => {
    Symphony.getDatafeedEventsService( botHearsSomething );
  })
