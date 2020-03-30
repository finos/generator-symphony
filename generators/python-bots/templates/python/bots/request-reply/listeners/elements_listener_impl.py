import logging
from sym_api_client_python.clients.sym_bot_client import SymBotClient
from sym_api_client_python.listeners.elements_listener import ElementsActionListener


class ElementsListenerImpl(ElementsActionListener):
    def __init__(self, sym_bot_client):
        self.bot_client = sym_bot_client

    async def on_elements_action(self, action):
        logging.debug('Elements Action Received', action)
