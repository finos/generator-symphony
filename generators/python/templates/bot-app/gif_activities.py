import os

from jinja2 import Template

from symphony.bdk.core.activity.command import SlashCommandActivity, CommandContext
from symphony.bdk.core.activity.form import FormReplyActivity, FormReplyContext
from symphony.bdk.core.service.message.message_service import MessageService


class GifSlashCommand(SlashCommandActivity):
    # Sends a form when sending @bot-name /gif

    def __init__(self, messages: MessageService):
        super().__init__("/gif", True, self.display_gif_form)
        self._messages = messages
        self.template = Template(open('resources/gif.jinja2').read(), autoescape=True)

    async def display_gif_form(self, context: CommandContext):
        message = self.template.render(name=context.initiator.user.display_name)
        await self._messages.send_message(context.stream_id, message)


class GifFormReplyActivity(FormReplyActivity):
    # Sends back the selected value on form submission

    def __init__(self, messages: MessageService):
        self._messages = messages

    def matches(self, context: FormReplyContext) -> bool:
        return context.form_id == "gif-category-form" \
            and context.form_values["action"] == "submit" \
            and context.form_values["category"]

    async def on_activity(self, context: FormReplyContext):
        category = context.form_values["category"]
        await self._messages.send_message(context.source_event.stream.stream_id,
                                          f"<messageML>Category is {category}</messageML>")
