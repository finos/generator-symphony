import xml.etree.ElementTree as ET
import logging
import json
from sym_api_client_python.processors.message_formatter import MessageFormatter
from sym_api_client_python.processors.sym_message_parser import SymMessageParser

from ..simple_form.render import form_data, render_simple_form

class IMProcessor:
    def __init__(self, bot_client):
        self.bot_client = bot_client
        # self.msg = msg
        self.message_formatter = MessageFormatter()
        self.sym_message_parser = SymMessageParser()
        # self.process(self.msg)

    #reads message and processes it
    #look inside logs/example.log to see the payload (metadata representing event coming over the datafeed)
    def process(self, msg):
        logging.debug('im_processor/process_im_message()')
        logging.debug(json.dumps(msg, indent=4))
        self.help_message = dict(message = """<messageML>
                                    <h3>Type '/elements' to render a form</h3>
                                              </messageML>
                                           """)

        commands = self.sym_message_parser.get_text(msg)
        if commands[0] == '/elements':
            self.bot_client.get_message_client().send_msg(msg['stream']['streamId'], render_simple_form('listeners/simple_form/html/simple_form.html'))
        else:
            self.bot_client.get_message_client().send_msg(msg['stream']['streamId'], self.help_message)
