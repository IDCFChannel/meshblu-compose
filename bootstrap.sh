#!/bin/sh -
set -o nounset

# Docker
wget -qO- https://get.docker.com/ | sh

# Docker Compose
curl -L https://github.com/docker/compose/releases/download/1.4.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose; chmod +x /usr/local/bin/docker-compose

# SSL Certificate
cd ./nginx/conf/certs

openssl genrsa  -out server.key 4096
openssl req -new -batch -key server.key -out server.csr
openssl x509 -req -days 3650 -in server.csr -signkey server.key -out server.crt

cd -

docker pull idcfchannel/iotutil
docker pull idcfchannel/meshblu

sleep 15s

docker pull tenstartups/openresty
docker pull redis
docker pull mongo

docker-compose up -d openresty
docker-compose ps
