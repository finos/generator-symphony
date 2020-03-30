import logging
from sym_api_client_python.clients.sym_bot_client import SymBotClient
from sym_api_client_python.listeners.connection_listener import ConnectionListener


class ConnectionListenerImpl(ConnectionListener):
    def __init__(self, sym_bot_client):
        self.bot_client = sym_bot_client

    async def on_connection_accepted(self, connection):
        logging.debug('Connection Request Accepted', connection)

    async def on_connection_requested(self, connection):
        logging.debug('Connection Request Received', connection)
