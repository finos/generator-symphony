import logging
import random
import string

import aiohttp
from aiohttp import web
from symphony.bdk.core.auth.exception import AuthInitializationError
from symphony.bdk.core.config.model.bdk_config import BdkConfig
from symphony.bdk.core.symphony_bdk import SymphonyBdk
from symphony.bdk.gen import ApiException

ONE_DAY_IN_SECONDS = 3600 * 24

APP_BASE_PATH = "/bdk/v1/app"

logger = logging.getLogger(__name__)


class CircleOfTrustService:
    def __init__(self, config: BdkConfig):
        self.app_id = config.app.app_id
        self.symphony_bdk = SymphonyBdk(config)
        self.authenticator = self.symphony_bdk.app_authenticator()

    async def authenticate(self) -> str:
        app_token = "".join(random.choice(string.hexdigits) for i in range(128))
        auth_session = await self.authenticator.authenticate_extension_app(app_token)
        return auth_session.app_token

    async def validate_tokens(self, app_token: str, symphony_token: str) -> None:
        if not await self.authenticator.is_token_pair_valid(app_token, symphony_token):
            raise AuthInitializationError("Failed to validate the tokens")

    async def validate_jwt_and_retrieve_user_id(self, jwt: str) -> int:
        jwt_claims = await self.authenticator.validate_jwt(jwt)
        return jwt_claims["user"]["id"]

    async def close(self, *args):
        await self.symphony_bdk.close_clients()


class CircleOfTrustHandler:
    def __init__(self, circle_of_trust_service: CircleOfTrustService):
        self.circle_of_trust_service = circle_of_trust_service

    async def authenticate(self, request: aiohttp.web.Request):
        app_token = await self.circle_of_trust_service.authenticate()
        return web.json_response({"appToken": app_token})

    async def tokens(self, request: aiohttp.web.Request):
        body = await request.json()
        await self.circle_of_trust_service.validate_tokens(body["appToken"], body["symphonyToken"])

        return web.Response(status=204)

    async def jwt(self, request: aiohttp.web.Request):
        body = await request.json()
        jwt = body["jwt"]

        user_id = await self.circle_of_trust_service.validate_jwt_and_retrieve_user_id(jwt)
        return web.json_response({"userId": user_id})
