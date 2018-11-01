const Symphony = require('symphony-api-client-node')
const path = require('path')
const AWS = require('aws-sdk')
const nba = require('nba')

AWS.config.update({region: 'us-west-2'})

const getYesterdaysDate = () => {
  let date = new Date()
  date.setDate(date.getDate() - 1)
  return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
}

const botHearsSomething = (event, messages) => {
  var comprehend = new AWS.Comprehend()

  messages.forEach((message, index) => {
    let params = {
      LanguageCode: 'en',
      Text: message.messageText
    }
    comprehend.detectEntities(params, function (err, data) {
      if (err) {
        console.log(err, err.stack) // an error occurred
      } else {
        console.log(data) // successful response
        let org = data.Entities.find(obj => obj.Type === 'ORGANIZATION')
        let replyMessage = ''
        if (org != null && org.Text === 'nba') {
          nba.stats.scoreboard({
            LeagueID: '00',
            DayOffset: '0',
            gameDate: getYesterdaysDate()
          }).then((nbaResults) => {
            let gameSequence = 0
            nbaResults.lineScore.forEach((game, idx) => {
              if (gameSequence !== game.gameSequence) {
                replyMessage += '<br/>' + game.teamCityName + ' ' + game.pts
                gameSequence = game.gameSequence
              } else {
                replyMessage += ' - ' + game.pts + ' ' + game.teamCityName
              }
            })
            Symphony.sendMessage(message.stream.streamId, replyMessage, null, Symphony.MESSAGEML_FORMAT)
          })
        } else {
          replyMessage = 'Sorry ' + message.user.firstName + ', I can\'t understand your request'
          Symphony.sendMessage(message.stream.streamId, replyMessage, null, Symphony.MESSAGEML_FORMAT)
        }
      }
    })
  })
}

Symphony.setDebugMode(true)

Symphony.initBot(path.join(__dirname, '/config.json')).then((symAuth) => {
  Symphony.getDatafeedEventsService(botHearsSomething)
})
