import jinja2
from jinja2 import Template

form_data = {
    "simpleForm": {
        "title": "Form-Title",
    }
}

def render_simple_form(path_to_html_form):
    with open(path_to_html_form) as file:
        template = Template(file.read(), trim_blocks=True, lstrip_blocks=True)
    html = template.render(form_data)
    return dict(message = html)
