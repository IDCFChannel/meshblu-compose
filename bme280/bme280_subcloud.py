# -*- coding: utf-8 -*-
import paho.mqtt.client as mqtt
import json
import requests
from config import conf

url = "http://{0}/data/{1}".format(conf["IDCF_CHANNEL_URL"],
                                       conf["TRIGGER_1_UUID"])
headers = {
    "meshblu_auth_uuid": conf["TRIGGER_1_UUID"],
    "meshblu_auth_token": conf["TRIGGER_1_TOKEN"]
}

payload = "trigger on"

def on_connect(client, userdata, rc):
    print("Connected with result code {}".format(rc))
    client.subscribe(conf["TRIGGER_1_UUID"])

def on_subscribe(client, userdata, mid, granted_qos):
    print("Subscribed mid: {0},  qos: {1}".format(str(mid), str(granted_qos)))

def on_message(client, userdata, msg):
    print("topic: {}".format(msg.topic))
    print("msg: {}".format(msg.payload))

    payload = json.loads(msg.payload)
    data = payload["data"]
    if data:
        retval = data["payload"]
        if retval:
            print("temperature: {}".format(retval["temperature"]))
            if float(retval["temperature"]) > conf["THRESHOLD"]:
                print("threshold over: {0} > {1}".format(float(retval["temperature"]),
                                                         conf["THRESHOLD"]))
                r = requests.post(url, headers=headers, data=payload)

def main():
    # MQTT
    client = mqtt.Client(client_id='',
                         clean_session=True, protocol=mqtt.MQTTv311)
    client.username_pw_set(conf["TRIGGER_1_UUID"], conf["TRIGGER_1_TOKEN"])
    client.on_connect = on_connect
    client.on_subscribe = on_subscribe
    client.on_message = on_message

    client.connect(conf["IDCF_CHANNEL_URL"], 1883, 60)
    client.loop_forever()

if __name__ == '__main__':
    main()
