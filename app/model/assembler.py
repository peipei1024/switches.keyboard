import json
from datetime import datetime

from app.model.domain import KeyboardSwitch, Keyword, Switches
from app.model.request import KeywordRequest
from app.model.vo import MksVO, KeywordVO


def convert_vo(model: Switches) -> Switches:
    if model.pic is None or model.pic == '':
        model.pic = '/bfs/fs/dummy_image.jpg'
    model.id = str(model.id)
    return model
    # return MksVO(
    #     id=str(model.id), name=model.name, pic=model.pic, studio=model.studio, manufacturer=model.manufacturer,
    #     type=model.type, tag=model.tag, quantity=model.quantity, price=model.price, desc=model.desc,
    #     specs=json.loads(model.specs), create_time=model.create_time, update_time=model.update_time,
    #     stash=model.stash, logo=model.logo, variation=model.variation
    # )

def convert_sqlm(mks: MksVO) -> KeyboardSwitch:
    pass

def convert_keywrod_sqlm(v: KeywordRequest) -> Keyword:
    now = datetime.now().timestamp()
    return Keyword(word=v.word, type=v.type, rank=v.rank, deleted=0, create_time=now, update_time=now, memo=v.memo)



def convert_swtiches(model: KeyboardSwitch) -> Switches:
    specs=json.loads(model.specs)
    pins = None
    if specs['pin'] == '三脚':
        pins = 3
    elif specs['pin'] == '五脚':
        pins = 5

    act_force = format_base_value(specs['actuation_force'])
    bot_force = format_base_value(specs['end_force'])
    act_dist = format_base_value(specs['pre_travel'])
    total_dist = format_base_value(specs['total_travel'])

    act_force_tol = append_add_sub(specs['actuation_force_p'])
    bot_force_tol = append_add_sub(specs['end_force_p'])
    act_dist_tol = append_add_sub(specs['pre_travel_p'])
    total_dist_tol = append_add_sub(specs['total_travel_p'])

    if is_whole_fomart(specs['actuation_force']):
        act_force, act_force_tol = format_base_value_tol(specs['actuation_force'])
    if is_whole_fomart(specs['end_force']):
        bot_force, bot_force_tol = format_base_value_tol(specs['end_force'])
    if is_whole_fomart(specs['pre_travel']):
        bot_force, bot_force_tol = format_base_value_tol(specs['pre_travel'])
    if is_whole_fomart(specs['total_travel']):
        bot_force, bot_force_tol = format_base_value_tol(specs['total_travel'])

    print(f'{act_force} {bot_force} {act_dist} {total_dist} {act_force_tol}  {bot_force_tol}  {act_dist_tol} {total_dist_tol}')
    return Switches(
        id=model.id,
        name=model.name, studio=model.studio, manufacturer=model.manufacturer,
        pic=model.pic, num=model.quantity, type=model.type, mark=model.logo,
        top_mat=specs['top'], bottom_mat=specs['bottom'], stem_mat=specs['stem'], spring=specs['spring'],
        actuation_force=act_force, actuation_force_tol=act_force_tol,
        bottom_force=bot_force, bottom_force_tol=bot_force_tol,
        pre_travel=act_dist, pre_travel_tol=act_dist_tol,
        total_travel=total_dist, total_travel_tol=total_dist_tol,
        light_style=specs['light_pipe'], pins=pins,
        stor_loc_box=model.stash, price=model.price,
        desc=model.desc,
        create_time=model.create_time, update_time=model.update_time, deleted=model.deleted
    )

def is_whole_fomart(d1):
    if '-' in d1:
        return True
    if len(d1) >= 3 and '.' not in d1:
        return True
    else:
        return False

def format_base_value_tol(data):
    if '.' not in data:
        return float(data[:2]), data[2:]
    else:
        return float(data[:3]), data[3:]

def format_base_value(data):
    if data == '' or data is None:
        return None
    elif len(data) >= 3 and '.' not in data:
        print(f'=======> {data}')
    elif '-' in data:
        print(f'======> -{data}')
    else:
        return float(data)

def append_add_sub(data):
    if data == '' or data is None:
        return ''
    else:
        return '±' + data