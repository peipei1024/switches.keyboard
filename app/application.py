import base64
import json
import os
import time
import uuid
from datetime import datetime
from typing import Optional
from urllib.parse import urlencode

import requests
from fastapi import FastAPI, Request, Form, Query, UploadFile
from pydantic.main import BaseModel
from sqlalchemy import select, insert, func, and_, or_, update
from starlette import status
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, RedirectResponse, Response, JSONResponse, FileResponse
from starlette.routing import Mount

# from app.config.setting import log_path
from starlette.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles
import logging
from app import routes
from loguru import logger
import sys

from app.core.config import app_config
from app.core.database import SqlSession
from app.core.response import RedirectResponseWraper
from app.core.snowflake_id import id_worker
from app.model import KeyboardSwitch, Keyword, sqlm_keyboard_switch, sqlm_keyword, Etd, sqlm_etd

templates = Jinja2Templates(directory='front/templates')

def register_route(app):
    # app.include_router(routes.router, tags=['app'])
    app.mount('/js', StaticFiles(directory='front/js'), name='js')
    app.mount('/css', StaticFiles(directory='front/css'), name='css')
    app.mount('/plugins', StaticFiles(directory='front/plugins'), name='plugins')
    app.mount('/img', StaticFiles(directory='front/img'), name='img')
# app.mount('/fonts', StaticFiles(directory='front/fonts'), name='fonts')
    logger.debug('route_provider registering')
    if app.debug:
        for route in app.routes:
            if type(route) == Mount:
                logger.info({'path': route.path, 'name': route.name})
            else:
                logger.info({'path': route.path, 'name': route.name, 'methods': route.methods})

def register_logging(app):
    pass
    # logging.getLogger().handlers = [InterceptHandler()]
    # logger.configure(
    #     handlers=[{'sink': sys.stdout, 'level': logging.DEBUG}]
    # )
    # if not os.path.exists(log_path):
    #     os.mkdir(log_path)
    # log_file = '{0}/web-{1}.log'.format(log_path, datetime.now().strftime('%Y%m%d'))
    # logger.add(log_file, encoding='utf-8', rotation='500MB', retention='6 months', enqueue=True)
    # logger.debug('logging_provider registering')
    # logging.getLogger('uvicorn.access').handlers = [InterceptHandler()]
    # logging.getLogger('peewee').handlers = [InterceptHandler()]
    # logging.getLogger('sqlalchemy')

def register_app(app):
    logger.debug('app_provider registering')
    app.add_middleware(CORSMiddleware, allow_origins=["*"],
                       allow_credentials=True,
                       allow_methods=["*"],
                       allow_headers=["*"])

def init_app():
    app = FastAPI(title='文档', description='描述demo', docs_url='/docs', debug=True)
    register_logging(app)
    register_app(app)
    register_route(app)
    return app

app = init_app()

@app.middleware('http')
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers['X-Process-Time'] = str(process_time)
    return response

@app.middleware('http')
async def del_blank_str_query_param(request: Request, call_next):
    q_params = {}
    query_params = request.query_params
    for k in query_params.keys():
        v = query_params.get(k)
        if v != '':
            q_params[k] = v
    request.scope['query_string'] = urlencode(q_params).encode('utf-8')
    # print(str(request.scope))
    response = await call_next(request)
    return response


@app.get("/", response_class=HTMLResponse)
async def index():
    return RedirectResponseWraper(url='/p/mkslist', status_code=status.HTTP_302_FOUND)

@app.get('/p/mkslist', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse('index.html', context={'request': request})

@app.get("/p/mks", response_class=HTMLResponse)
async def index(request: Request, id: Optional[int]=None):
    with SqlSession() as session:
        if id is not None:
            model = session.fetchone(
                select(sqlm_keyboard_switch).where(sqlm_keyboard_switch.columns.id==id), KeyboardSwitch
            )
        else:
            model = KeyboardSwitch(name='')
        switch_types = session.fetchall(
            select(sqlm_keyword).where(sqlm_keyword.columns.type=='switch_type'),
            Keyword
        )
        manufacturers = session.fetchall(
            select(sqlm_keyword).where(sqlm_keyword.columns.type=='manufacturer'),
            Keyword
        )
    return templates.TemplateResponse('add.html', context={
        'request': request,
        'keyboard_switch': model,
        'switch_types': switch_types,
        'manufacturers': manufacturers,
        'error_msg': []
    })

@app.get('/api/mkslist')
async def axlist(draw: Optional[int]=None, start: Optional[int]=1, length: Optional[int]=10, search: str=Query(alias='s', default=None)):
    with SqlSession() as session:
        stmt_list = select(sqlm_keyboard_switch).offset(start).limit(length)
        stmt_count = select(func.count(sqlm_keyboard_switch.columns.id))
        if search is not None:
            s = '%' + search + '%'
            search_expression = and_(
                or_(
                    sqlm_keyboard_switch.columns.name.like(s),
                    sqlm_keyboard_switch.columns.studio.like(s),
                    sqlm_keyboard_switch.columns.manufacturer.like(s),
                    sqlm_keyboard_switch.columns.tag.like(s)
                )
            )
            stmt_list = stmt_list.where(search_expression)
            stmt_count = stmt_count.where(search_expression)
        list = session.fetchall(stmt_list, KeyboardSwitch)
        total = session.count(stmt_count)
    return {'draw': draw, 'page_list': list, 'recordsTotal': total, 'recordsFiltered': total}

class DownloadRequest(BaseModel):
    url: str
@app.post('/api/download_pic', response_class=JSONResponse)
async def download_pic(req: DownloadRequest):
    temp_image_id = str(id_worker.next_id())
    response = requests.get(req.url)
    with open(app_config.temp_dir + temp_image_id + '.jpg', 'wb') as f:
        f.write(response.content)
    return {'status': 'ok', 'data': '/bfs/t/' + temp_image_id + '.jpg' }

@app.post('/api/upload_pic')
async def upload_pic(image: UploadFile):
    image_id = str(id_worker.next_id())
    with open(app_config.file_dir + image_id + '.jpg', 'wb') as f:
        f.write(await image.read())
    return {'status': 'ok', 'data': '/bfs/fs/' + image_id + '.jpg'}


@app.get('/bfs/{source}/{path}', response_class=FileResponse)
async def show_pic(path: str, source: str):
    if source == 't':
        full_path = app_config.temp_dir + path
    elif source == 'fs':
        full_path = app_config.file_dir + path
    else:
        full_path = ''
    return FileResponse(full_path, media_type='image/jpg')

class Specs(BaseModel):
    actuation_force: str=None
    actuation_force_p: str=None
    end_force: str=None
    end_force_p: str=None
    pre_travel: str=None
    pre_travel_p: str=None
    total_travel: str=None
    total_travel_p: str=None
    pin: str
    top: str=None
    bottom: str=None
    stem: str=None
    spring: str=None
    light_pipe: str=None

class MksRequest(BaseModel):
    id: int=None
    name: str
    pic: str=None
    studio: str
    manufacturer: str=None
    type: str=None
    tag: str=None
    quantity: int
    price: str=None
    desc: str=None
    specs: Specs=None

@app.post('/api/mks', response_class=RedirectResponse)
async def save_mks(req: MksRequest):
    now = datetime.now().timestamp()
    id = req.id
    is_update = True
    if req.id is None or req.id == '':
        is_update = False
        id = id_worker.next_id()
    keyboard_switch = KeyboardSwitch(
        name=req.name, studio=req.studio, manufacturer=req.manufacturer, type=req.type,
        pic=req.pic, tag=req.tag, quantity=req.quantity, price=req.price, desc=req.desc,
        specs=req.specs.json(),
        create_time=now, update_time=now, id=id
    )
    with SqlSession() as session:
        if is_update:
            _ks = session.fetchone(
                select(sqlm_keyboard_switch).where(sqlm_keyboard_switch.columns.name==keyboard_switch.name),
                KeyboardSwitch
            )
            if _ks is None:
                etd = Etd(id=uuid.uuid4(), data=keyboard_switch.json(), error=json.dumps(['不存在的轴体']))
                session.execute(insert(sqlm_etd).values(etd.dict()))
                return RedirectResponseWraper(url='/p/mks?_etd=' + etd.id, status_code=status.HTTP_302_FOUND)
            else:
                session.execute(
                    update(sqlm_keyboard_switch).values(manufacturer=keyboard_switch.manufacturer,
                                                        studio=keyboard_switch.studio,
                                                        pic=keyboard_switch.pic,
                                                        type=keyboard_switch.type,
                                                        tag=keyboard_switch.tag,
                                                        specs=keyboard_switch.specs,
                                                        quantity=keyboard_switch.quantity,
                                                        price=keyboard_switch.price,
                                                        desc=keyboard_switch.desc,
                                                        update_time=keyboard_switch.update_time)
                        .where(sqlm_keyboard_switch.columns.id == id)
                )
                return RedirectResponseWraper(url='/p/mkslist', status_code=status.HTTP_302_FOUND)
        else:
            session.execute(insert(sqlm_keyboard_switch).values(keyboard_switch.dict()))
            return RedirectResponseWraper(url='/p/mkslist', status_code=status.HTTP_302_FOUND)




@app.post("/api/mks", response_class=HTMLResponse)
async def add(request: Request, name=Form(None), studio=Form(None), foundry=Form(None), type=Form(None),
              pic=Form(None), remark=Form(None),
              operating_force=Form(None), pre_travel=Form(None), end_force=Form(None), full_travel=Form(None),
              upper=Form(None), bottom=Form(None), shaft=Form(None), light_pipe=Form(None),
              price=Form(None), desc=Form(None)):


    with SqlSession() as session:
        ax = session.fetchone(
            select(sqlm_keyboard_switch).where(sqlm_keyboard_switch.columns.name==keyboard_switch.name),
            KeyboardSwitch
        )
        if ax is not None:
            pass
            # headers = {'Location': '/add1'}
            # return Response(content={
            #     'axial': '222'
            # }, headers=headers, status_code=status.HTTP_302_FOUND)
            return RedirectResponseWraper(url='/add1', status_code=status.HTTP_302_FOUND, query={
                'axial': ax
            })
        else:
            pass
        # session.execute(
        #     insert()
        # )
        pass
    print(name)
    return RedirectResponse(url='/', status_code=302)


import uvicorn

if __name__ == '__main__':
    uvicorn.run('application:app', host='0.0.0.0', port=8002, access_log=True)