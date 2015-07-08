# Meshblu Docker Compose

[Meshblu](https://github.com/octoblu/meshblu/) IoT Platform を[Docker Compose](https://github.com/docker/compose)で構成管理するためのツールです。


## インストール

DockerホストはUbuntu 14.04を使います。DockerとDocker Composeのバージョンは以下でテストしています。

* Docker: 1.7.0
* Docker Compose: 1.3.1

1. Dockerをインストールするサーバーにgitをインストールします。

```sh
$ sudo apt-get update && sudo apt-get install -y git
```

2. このリポジトリをcloneしてbootstrap.shを実行します。

```sh
$ git clone --recursive https://github.com/IDCFChannel/meshblu-compose
$ cd meshblu-compose
$ ./bootstrap.sh
```

インストールが成功するとdocker-compose psコマンドの結果が表示されます。コンテナが4つ起動していることを確認してください。

```sh
$ docker-compose ps
        Name                 Command                 State                  Ports
-----------------------------------------------------------------------------------------
meshblucompose_meshb   npm start              Up                     0.0.0.0:1883->1883/t
lu_1                                                                 cp, 80/tcp
meshblucompose_mongo   /entrypoint.sh         Up                     27017/tcp
_1                     mongod
meshblucompose_openr   nginx -c /etc/nginx/   Up                     0.0.0.0:443->443/tcp
esty_1                 nginx.conf                                    , 0.0.0.0:80->80/tcp
meshblucompose_redis   /entrypoint.sh         Up                     6379/tcp
_1                     redis-server
```

Mesubluサーバーのステータスを表示します。

```sh
$ curl --insecure https://localhost/status
{"meshblu":"online"}
```

パブリックIPアドレスを使って外部のネットワークから接続する場合は、ファイアウォールの設定とプライベートIPアドレスへのポートフォワードを事前に行ってください。


```sh
$ curl --insecure https://xxx.xxx.xxx/status
{"meshblu":"online"}
```

3. デバイスの登録

すべてのデバイスにメッセージを送信できるマスターの`owner`デバイスと、action-*を5つ、trigger-*を5つコマンドで作成します。また末尾の番号が同じ組み合わせでaction-*からtrigger-*へもメッセージが送信できます。

```sh
$ docker-compose build iotutil
$ docker-compose run --rm iotutil register
> iotutil@0.0.1 start /app
> node app.js "register"

┌─────────┬────────────────────┬──────────────────────────────────────┐
│ keyword │ meshblu_auth_token │ meshblu_auth_uuid                    │
├─────────┼────────────────────┼──────────────────────────────────────┤
│ owner   │ 7552521b           │ 72006d15-40cc-47ab-b58e-b2a940038460 │
└─────────┴────────────────────┴──────────────────────────────────────┘
```

デバイスの登録が終了するとマスターownerの認証情報が表示されます。この情報は以下のコマンドを実行しても出力できます。

```sh
$ docker-compose run  --rm iotutil  owner

> iotutil@0.0.1 start /app
> node app.js "owner"

┌─────────┬────────────────────┬──────────────────────────────────────┐
│ keyword │ meshblu_auth_token │ meshblu_auth_uuid                    │
├─────────┼────────────────────┼──────────────────────────────────────┤
│ owner   │ 7552521b           │ 72006d15-40cc-47ab-b58e-b2a940038460 │
└─────────┴────────────────────┴──────────────────────────────────────┘
```

5. Whitelistを追加する

任意のデバイス間のメッセージ送信を許可することができます。たとえばaction-1からtrigger-3へのメッセージ送信を許可します。

```sh
$ docker-compose run --rm iotutil whiten -- -f action-1 -t trigger-3
```

6. CLIを使ってデバイスのUUIDを取得する

`list`コマンドを実行すると登録されているデバイス情報を取得できます。

```sh
$ docker-compose run  --rm iotutil owner

> iotutil@0.0.1 start /app
┌───────────┬──────────┬──────────────────────────────────────┐
│ keyword   │ token    │ uuid                                 │
├───────────┼──────────┼──────────────────────────────────────┤
│ trigger-1 │ 43778029 │ 8d5c4f0a-1884-4fdf-82ea-3f0e61377523 │
├───────────┼──────────┼──────────────────────────────────────┤
│ trigger-2 │ 8ff4e865 │ d3a60222-17a8-4d8c-b09b-533aa7fbf339 │
├───────────┼──────────┼──────────────────────────────────────┤
│ trigger-3 │ 3ec4141f │ 48a37f58-2eda-4ef0-939d-6473ded77c5a │
├───────────┼──────────┼──────────────────────────────────────┤
...
```

`show`コマンドを実行すると個別のデバイスの情報を表示します。

```sh
$ docker-compose run --rm iotutil show -- --keyword action-3

> iotutil@0.0.1 start /app
> node app.js "show" "--keyword" "action-3"

┌──────────┬──────────┬──────────────────────────────────────┐
│ keyword  │ token    │ uuid                                 │
├──────────┼──────────┼──────────────────────────────────────┤
│ action-3 │ ac4d9e73 │ 6f75566e-9e69-4582-a718-cfb0939369c4 │
└──────────┴──────────┴──────────────────────────────────────┘
```

7. APIを使ってデバイスのUUIDを取得する

ownerデバイスの場合は、`/owner/uuid`、通常のデバイスは`/device/uuid`に対してクエリ文字列にキーワードとtokenを渡してHTTP GETします。

```sh
$ curl --insecure "https://localhost/owner/uuid?token=b24f0ba5&keyword=owner"
{"uuid":"72006d15-40cc-47ab-b58e-b2a940038460"}
```

8. デバイスの削除

`del`コマンドで登録してあるデバイスをすべて削除します。削除後は`regiser`コマンドを実行してデバイスを再作成します。

```sh
$ docker-compose run --rm iotutil del

> iotutil@0.0.1 start /app
> node app.js "del"

trigger-1, trigger-2, trigger-3, trigger-4, trigger-5, action-1, action-2, action-3, action-4, action-5, owner are deleted.
```


## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[Masato Shimizu](https://github.com/masato)
