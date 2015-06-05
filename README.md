# Meshblu Compose

Bootstrap your [Meshblu](https://github.com/octoblu/meshblu/) IoT Platform with [Docker Compose](https://github.com/docker/compose). 

## Instrallation

1. Make sure git is installed

```sh
$ sudo apt-get update && sudo apt-get install -y git
```

2. Git clone a repository and run bootstrap.sh

```sh
$ git clone https://github.com/masato/meshblu-compose
$ cd meshblu-compose
$ ./bootstrap.sh
```

After installation you will some lines from docker-compose ps command on the display.

```sh
      Name             Command             State              Ports
-------------------------------------------------------------------------
meshblucompose_m   npm start          Up                 0.0.0.0:1883->18
eshblu_1                                                 83/tcp, 9000/tcp
meshblucompose_m   /entrypoint.sh     Up                 27017/tcp
ongo_1             mongod
meshblucompose_o   nginx -c /etc/ng   Up                 0.0.0.0:443->443
penresty_1         inx/nginx.conf                        /tcp, 0.0.0.0:80
                                                         ->80/tcp
meshblucompose_r   /entrypoint.sh     Up                 6379/tcp
edis_1             redis-server
```

3. Registers

```sh
$ docker-compose run --rm iotutil register
> iotutil@0.0.1 start /app
> node app.js "register"

devices registered successfully, owner is { meshblu_auth_uuid: '9e55cd50-05de-11e5-ad60-69b28a150c14', meshblu_auth_token: 'b24f0ba5' }
Removing meshblucompose_iotutil_run_1...
```

4. Get Owner UUID

A pair of token and uuid is for an upstream service.

```sh
$ curl --insecure "https://localhost/owner/uuid?token=b24f0ba5&keyword=owner"
{"uuid":"9e55cd50-05de-11e5-ad60-69b28a150c14"}
```

5. Check your public IP address

Visit your cloud console page and check an assigned public IP address to your virtual machine. This IP address should be opened to other services which want to connect to your Meshblu brokers.

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[Masato Shimizu](https://github.com/masato)
