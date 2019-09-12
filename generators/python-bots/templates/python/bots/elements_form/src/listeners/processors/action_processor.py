import xml.etree.ElementTree as ET
import logging
import base64
import json
from sym_api_client_python.processors.message_formatter import MessageFormatter
from sym_api_client_python.processors.sym_elements_parser import SymElementsParser
from ..simple_form.render import form_data, render_simple_form

class ActionProcessor:

    def __init__(self, bot_client):
        self.bot_client = bot_client
        self.action_processed_message = MessageFormatter().format_message('Your action has been processed')

    def process_im_action(self, action):
        
        logging.debug('action_processor/im_process')
        logging.debug(json.dumps(action, indent=4))

        if SymElementsParser().get_form_values(action)['action'] == 'submit_button':
            self.bot_client.get_message_client().send_msg(SymElementsParser().get_stream_id(action), self.action_processed_message)
            form_contents = SymElementsParser().get_form_values(action)
            print(form_contents)
            self.response_message = MessageFormatter().format_message('Captured: {}'.format(form_contents))
            self.bot_client.get_message_client().send_msg(SymElementsParser().get_stream_id(action), self.response_message)
