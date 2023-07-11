from symphony.bdk.core.activity.command import CommandActivity, CommandContext
from symphony.bdk.core.activity.user_joined_room import UserJoinedRoomActivity, UserJoinedRoomContext
from symphony.bdk.core.service.message.message_service import MessageService
from symphony.bdk.core.service.user.user_service import UserService


class EchoCommandActivity(CommandActivity):
    """Example of a complex command that just echoes what is after @bot-name /echo
    """
    command_name = "/echo "

    def __init__(self, messages: MessageService):
        self._messages = messages
        super().__init__()

    def matches(self, context: CommandContext) -> bool:
        return context.text_content.startswith("@" + context.bot_display_name + " " + self.command_name)

    async def on_activity(self, context: CommandContext):
        text_to_echo = context.text_content[context.text_content.index(self.command_name) + len(self.command_name):]
        await self._messages.send_message(context.stream_id, f"<messageML>{text_to_echo}</messageML>")


class GreetUserJoinedActivity(UserJoinedRoomActivity):
    """Greets a user when joining a room
    """

    def __init__(self, messages: MessageService, users: UserService):
        super().__init__()
        self._messages = messages
        self._users = users

    def matches(self, context: UserJoinedRoomContext) -> bool:
        return True

    async def on_activity(self, context: UserJoinedRoomContext):
        user_details = await self._users.get_user_detail(context.affected_user_id)
        await self._messages.send_message(context.stream_id,
                                          f"<messageML>Hello {user_details.user_attributes.display_name}!</messageML>")
