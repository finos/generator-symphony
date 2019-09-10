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
        # self.im_stream = self.bot_client.get_stream_client().create_im([SymElementsParser().get_initiator_user_id(action)])
        if SymElementsParser().get_form_values(action)['action'] == 'submit_button':
            self.bot_client.get_message_client().send_msg(SymElementsParser().get_stream_id(action), self.action_processed_message)
            form_contents = SymElementsParser().get_form_values(action)
            print(form_contents)
            self.response_message = MessageFormatter().format_message('Captured: {}'.format(form_contents))
            self.bot_client.get_message_client().send_msg(SymElementsParser().get_stream_id(action), self.response_message)

        elif SymElementsParser().get_form_values(action)['action'] == 'submit-expense':
            self.employee_id = SymElementsParser().get_initiator_user_id(action)
            self.employee_name = SymElementsParser().get_initiator_display_name(action)
            self.employee_stream = SymElementsParser().get_stream_id(action)

            self.manager_id = SymElementsParser().get_form_values(action)['person-selector']
            self.manager_username = self.bot_client.get_user_client().get_user_from_id(self.manager_id)['displayName']

            self.submit_message = MessageFormatter().format_message('Your expense has been submitted to {}'.format(self.manager_username))
            self.manager_recieve_message = MessageFormatter().format_message('{} submitted an expense report that needs your approval: '.format(self.employee_name))

            self.bot_client.get_message_client().send_msg(self.employee_stream, self.submit_message)
            self.im_stream = self.bot_client.get_stream_client().create_im(SymElementsParser().get_form_values(action)['person-selector'])

            self.bot_client.get_message_client().send_msg(self.im_stream['id'], self.manager_recieve_message)
            self.bot_client.get_message_client().send_msg(self.im_stream['id'], render_expense_approval_form('listeners/expense_approval_form/html/manager_expense_approval_form.html'))
