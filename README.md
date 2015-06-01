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

3. Registers

```sh
$ docker-compose run --rm iotutil register
> iotutil@0.0.1 start /app
> node app.js "register"

devices registered successfully, owner is { meshblu_auth_uuid: '9e55cd50-05de-11e5-ad60-69b28a150c14', meshblu_auth_token: 'b24f0ba5' }
Removing meshblucompose_iotutil_run_1...
```

4. Get Owner UUID

```sh
$ curl --insecure "https://localhost/owner/uuid?token=b24f0ba5&keyword=owner"
{"uuid":"9e55cd50-05de-11e5-ad60-69b28a150c14"}
```

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[Masato Shimizu](https://github.com/masato)
