import os
import sys
import asyncio
import logging
from pathlib import Path
from sym_api_client_python.configure.configure import SymConfig
from sym_api_client_python.auth.auth import Auth
from sym_api_client_python.auth.rsa_auth import SymBotRSAAuth
from sym_api_client_python.clients.sym_bot_client import SymBotClient
from listeners.im_listener_impl import IMListenerImpl
from listeners.room_listener_impl import RoomListenerImpl
from listeners.elements_listener_impl import ElementsListenerImpl


def configure_logging():
    log_dir = os.path.join(os.path.dirname(__file__), "logs")
    if not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
    logging.basicConfig(
        filename=os.path.join(log_dir, 'bot.log'),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filemode='w', level=logging.DEBUG
    )
    logging.getLogger("urllib3").setLevel(logging.WARNING)

def main():
        # Configure log
        configure_logging()

        # Load configuration
        configure = SymConfig('../resources/config.json')
        configure.load_config()

        # Authenticate based on authType in config
        if ('authType' not in configure.data or configure.data['authType'] == 'rsa'):
            print('Python Client runs using RSA authentication')
            auth = SymBotRSAAuth(configure)
        else:
            print('Python Client runs using certificate authentication')
            auth = Auth(configure)
        auth.authenticate()

        # Initialize SymBotClient with auth and configure objects
        bot_client = SymBotClient(auth, configure)

        # Initialize datafeed service
        datafeed_event_service = bot_client.get_async_datafeed_event_service()

        # Initialize listener objects and append them to datafeed_event_service
        # Datafeed_event_service polls the datafeed and the event listeners
        # respond to the respective types of events
        datafeed_event_service.add_im_listener(IMListenerImpl(bot_client))
        datafeed_event_service.add_room_listener(RoomListenerImpl(bot_client))

        # Create and read the datafeed
        print('Starting datafeed')
        try:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(datafeed_event_service.start_datafeed())
        except (KeyboardInterrupt, SystemExit):
            None
        except:
            raise


if __name__ == "__main__":
    main()
