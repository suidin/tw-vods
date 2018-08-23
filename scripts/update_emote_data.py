import requests
import json


EMOTE_PATH = "../extension/resources/emotes/"
additional_tw_global_emotes = {":)": 1, ":(": 2, ":D": 3, ">(": 4, ":z": 5, "o_O": 6, "B)": 7, ":o": 8, "<3": 9, ":/": 10, ";)": 11, ":p": 12, ";p": 13, "R)": 14}

def getJson(url):
    response = requests.get(url)
    return response.json()

def convert_sub_emotes(json_dict):
    channel_emotes = {}
    for ch_id, data in json_dict.items():
        if data["broadcaster_type"] != "partner":
            continue
        for emote in data["emotes"]:
            channel_emotes[emote["code"]] = emote["id"]

    return channel_emotes

def convert_twGlobal(json_dict):
    global_emotes = {}
    for emote in json_dict.values():
        global_emotes[emote["code"]] = emote["id"]
    global_emotes.update(additional_tw_global_emotes)
    return global_emotes

def convert_bttv(json_dict):
    bttv_emotes = {}
    arr = json_dict["emotes"];
    for emote in arr:
        bttv_emotes[emote["code"]] = emote["id"]
    return bttv_emotes



def save(converted, filename):
    with open(EMOTE_PATH + filename, "w", encoding='utf-8') as f:
           json.dump(converted, f, ensure_ascii=False) 

DEFS = {
    "sub_emotes": {
        "url": "https://twitchemotes.com/api_cache/v3/subscriber.json",
        "filename": "partner_sub_emotes.json",
        "convert_fn": convert_sub_emotes
    },
    "tw_global": {
        "url": "https://twitchemotes.com/api_cache/v3/global.json",
        "filename": "twGlobal.json",
        "convert_fn": convert_twGlobal
    },
    "bttv_global": {
        "url": "https://api.betterttv.net/2/emotes",
        "filename": "bttv.json",
        "convert_fn": convert_bttv
    }
}


def main():
    for key, val in DEFS.items():
        json_dict = getJson(val["url"])
        converted = val["convert_fn"](json_dict)
        save(converted, val["filename"])

main()
