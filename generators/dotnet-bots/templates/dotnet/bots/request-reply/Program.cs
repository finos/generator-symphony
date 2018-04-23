using System;
using System.IO;
using apiClientDotNet.Models;
using apiClientDotNet;
using apiClientDotNet.Listeners;
using apiClientDotNet.Services;
using apiClientDotNet.Models.Events;
using System.Diagnostics;

namespace RequestResponse
{
    class Program
    {
        static void Main(string[] args)
        {
            string filePath = Path.GetFullPath("config.json");
            SymBotClient symBotClient = new SymBotClient();
            DatafeedEventsService datafeedEventsService = new DatafeedEventsService();
            SymConfig symConfig = symBotClient.initBot(filePath);
            RoomListener botLogic = new BotLogic();
            DatafeedClient datafeedClient = datafeedEventsService.init(symConfig);
            Datafeed datafeed = datafeedEventsService.createDatafeed(symConfig, datafeedClient);
            datafeedEventsService.addRoomListener(botLogic);
            datafeedEventsService.getEventsFromDatafeed(symConfig, datafeed, datafeedClient);
        }
    }

    public class BotLogic : RoomListener
    {
        public void onRoomMessage(Message inboundMessage)
        {
            string filePath = Path.GetFullPath("config.json");
            SymBotClient symBotClient = new SymBotClient();
            SymConfig symConfig = symBotClient.initBot(filePath);
            Message message2 = new Message();
            message2.message = "<messageML> Hi "+inboundMessage.user.firstName+"!</messageML>";
            MessageClient messageClient = new apiClientDotNet.MessageClient();
            messageClient.sendMessage(symConfig, message2, inboundMessage.stream);

        }
        public void onRoomCreated(RoomCreated roomCreated) { }
        public void onRoomDeactivated(RoomDeactivated roomDeactivated) { }
        public void onRoomMemberDemotedFromOwner(RoomMemberDemotedFromOwner roomMemberDemotedFromOwner) { }
        public void onRoomMemberPromotedToOwner(RoomMemberPromotedToOwner roomMemberPromotedToOwner) { }
        public void onRoomReactivated(apiClientDotNet.Models.Stream stream) { }
        public void onRoomUpdated(RoomUpdated roomUpdated) { }
        public void onUserJoinedRoom(UserJoinedRoom userJoinedRoom) { }
        public void onUserLeftRoom(UserLeftRoom userLeftRoom) { }
    }
}
