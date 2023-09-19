#!/usr/bin/env python3
import logging.config
import asyncio
from pathlib import Path

from aiohttp import web
from aiohttp_middlewares import cors_middleware
from aiohttp_middlewares.cors import DEFAULT_ALLOW_HEADERS
from symphony.bdk.core.config.loader import BdkConfigLoader

from .ext_app_be import CircleOfTrustService, CircleOfTrustHandler, APP_BASE_PATH

CURRENT_DIR = Path(__file__).parent.parent
RESOURCES_FOLDER = Path.joinpath(CURRENT_DIR, "resources")

async def run_app():
    await web._run_app(create_app(), port=8080)


def create_app():
    config = BdkConfigLoader.load_from_file(Path.joinpath(RESOURCES_FOLDER, 'config.yaml'))
    cot_service = CircleOfTrustService(config)
    cot_handler = CircleOfTrustHandler(cot_service)

    app = web.Application(middlewares=[cors_middleware(origins=["https://localhost:4000"])])
    app.on_shutdown.append(cot_service.close)
    app.add_routes([web.post(f"{APP_BASE_PATH}/auth", cot_handler.authenticate),
                    web.post(f"{APP_BASE_PATH}/tokens", cot_handler.tokens),
                    web.post(f"{APP_BASE_PATH}/jwt", cot_handler.jwt)])
    return app


logging.config.fileConfig(Path.joinpath(RESOURCES_FOLDER, 'logging.conf'), disable_existing_loggers=False)

asyncio.run(run_app())
