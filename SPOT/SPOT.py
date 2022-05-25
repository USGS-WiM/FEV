#!/usr/bin/python3

import os
import configparser
import requests
import json

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(ROOT_DIR, "SPOT.cfg")

config = configparser.ConfigParser()
config.read(config_path)

url = config.get('general', 'url')
token_header = { 'token': config.get('general', 'token')}
response = requests.get(url, headers=token_header)

print("Content-type: application/json", end="\r\n\r\n", flush=True)
print(json.dumps(response.json()))
