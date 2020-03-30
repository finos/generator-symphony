import logging
from sym_api_client_python.clients.sym_bot_client import SymBotClient
from sym_api_client_python.listeners.room_listener import RoomListener
from sym_api_client_python.processors.sym_message_parser import SymMessageParser


class RoomListenerImpl(RoomListener):
    def __init__(self, sym_bot_client):
        self.bot_client = sym_bot_client
        self.message_parser = SymMessageParser()

    async def on_room_msg(self, room_message):
        logging.debug('Room Message Received')

        msg_text = self.message_parser.get_text(room_message)
        first_name = self.message_parser.get_im_first_name(room_message)
        stream_id = self.message_parser.get_stream_id(room_message)

        message = f'<messageML>Hello {first_name}, hope you are doing well!</messageML>'
        self.bot_client.get_message_client().send_msg(stream_id, dict(message=message))

    async def on_room_created(self, room_created):
        logging.debug('Room Created', room_created)

    async def on_room_updated(self, room_updated):
        logging.debug('Room Updated', room_updated)

    async def on_user_joined_room(self, user_joined_room):
        logging.debug('User Joined Room', user_joined_room)

    async def on_user_left_room(self, user_left_room):
        logging.debug('User Left Room', user_left_room)

    async def on_room_member_demoted_from_owner(self, room_member_demoted_from_owner):
        logging.debug('Room Member Demoted From Owner', room_member_demoted_from_owner)

    async def on_room_member_promoted_to_owner(self, room_member_promoted_to_owner):
        logging.debug('Room Member Promoted To Owner', room_member_promoted_to_owner)

    async def on_room_deactivated(self, room_deactivated):
        logging.debug('Room Deactivated', room_deactivated)

    async def on_room_reactivated(self, room_reactivated):
        logging.debug('Room Reactivated', room_reactivated)
