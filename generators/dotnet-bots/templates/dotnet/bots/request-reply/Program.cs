using apiClientDotNet.Models;
using apiClientDotNet;
using apiClientDotNet.Listeners;
using apiClientDotNet.Services;
using apiClientDotNet.Authentication;


namespace RequestResponse
{
    class Program
    {
        static void Main(string[] args)
        {
            SymConfig symConfig = new SymConfigLoader().loadFromFile("config.json");
            SymBotRSAAuth botAuth = new SymBotRSAAuth(symConfig);
            botAuth.authenticate();
            SymBotClient botClient = SymBotClient.initBot(symConfig, botAuth);

            // start listening for messages
            DatafeedEventsService dataFeedService = botClient.getDatafeedEventsService();
            BotLogic listener = new BotLogic(botClient);

            dataFeedService.addIMListener(listener);
            dataFeedService.getEventsFromDatafeed();
        }
    }

    public class BotLogic : IIMListener
    {
        private SymBotClient symBotClient;

        public BotLogic(SymBotClient symBotClient)
        {
            this.symBotClient = symBotClient;
        }

        public void onIMMessage(Message message)
        {
            OutboundMessage outMessage = new OutboundMessage();
            outMessage.message = "Hello " + message.user.displayName + "!";
            this.symBotClient.getMessagesClient().sendMessage(message.stream.streamId, outMessage, true);
        }

        public void onIMCreated(Stream stream) { }
    }
}
