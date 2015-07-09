# Meshblu Docker Compose

[Meshblu](https://github.com/octoblu/meshblu/) IoT Platform を[Docker Compose](https://github.com/docker/compose)で構成管理するためのツールです。

Ubuntu 14.04のDockerホストを新しく用意します。GitHubのリポジトリからcloneするので最初にGitをインストールします。

```sh
$ sudo apt-get update && sudo apt-get install -y git
```

適当なディレクトリに[リポジトリ](https://github.com/IDCFChannel/meshblu-compose)から`git clone`します。

```sh
$ mkdir ~/iot_apps && cd ~/iot_apps
$ git clone --recursive https://github.com/IDCFChannel/meshblu-compose
```

cloneしたディレクトリに移動してbootstrapのシェルスクリプトを実行します。MeshbluのビルドやMongoDB、Redis、OpenRestyなどのコンテナが自動的に起動します。初回起動時はNode.jsのネイティブのビルドに少し時間がかかる場合があります。

```sh
$ cd meshblu-compose
$ ./bootstrap.sh
```

### インストールの確認

インストールが成功すると`docker-compose ps`コマンドの結果が表示されます。コンテナが4つ起動しました。

```sh
$ docker-compose ps
      Name             Command             State              Ports
-------------------------------------------------------------------------
meshblucompose_m   npm start          Up                 0.0.0.0:1883->18
eshblu_1                                                 83/tcp, 80/tcp
meshblucompose_m   /entrypoint.sh     Up                 27017/tcp
ongo_1             mongod
meshblucompose_o   nginx -c /etc/ng   Up                 0.0.0.0:443->443
penresty_1         inx/nginx.conf                        /tcp, 0.0.0.0:80
                                                         ->80/tcp
meshblucompose_r   /entrypoint.sh     Up                 6379/tcp
edis_1             redis-server
```

DockerとDocker Composeのバージョンは以下のようになっています。

```bash
$ docker version
Client version: 1.7.0
...
$ docker-compose --version
docker-compose version: 1.3.1
```

DockerホストのcurlコマンドからMesubluサーバーが起動していることを確認します。

```sh
$ curl --insecure https://localhost/status
{"meshblu":"online"}
```

Dockerホストがプライベートネットワーク上にある場合は、外部からパブリックIPアドレスで接続ができるようにファイアウォールとポートフォワードの設定をしておきます。今回はHTTPSとMQTTを使うため`443`と`1883`のポートが使えるようにします。

```sh
$ curl --insecure https://xxx.xxx.xxx.xxx/status
{"meshblu":"online"}
```

## サーバーの起動と再起動

停止状態からサービスを起動するときはOpenRestyサービスを`up`コマンドから起動します。

```bash
$ docker-compose up -d openresty
```

サービスを再起動するときは`restart`コマンドを実行します。

```bash
$ docker-compose restart
```

## デバイスの登録

はじめに`iotutil`サービスの`register`コマンドを実行して初期設定を行います。すべてのデバイスにメッセージを送信できるマスターの`owner`デバイスと、action-*を5つ、trigger-*を5つコマンドで作成します。

```sh
$ docker-compose run --rm iotutil register
> iotutil@0.0.1 start /app
> node app.js "register"

┌─────────┬────────────────────┬──────────────────────────────────────┐
│ keyword │ meshblu_auth_token │ meshblu_auth_uuid                    │
├─────────┼────────────────────┼──────────────────────────────────────┤
│ owner   │ 052cb87a           │ bfbe30e3-18af-4f79-97d8-3c70744e5dc5 │
└─────────┴────────────────────┴──────────────────────────────────────┘
```

デバイスの登録が終了すると`owner`デバイスの認証情報が表示されます。以下のコマンドを実行しても確認ができます。

```sh
$ docker-compose run --rm iotutil owner

> iotutil@0.0.1 start /app
> node app.js "owner"

┌─────────┬────────────────────┬──────────────────────────────────────┐
│ keyword │ meshblu_auth_token │ meshblu_auth_uuid                    │
├─────────┼────────────────────┼──────────────────────────────────────┤
│ owner   │ 052cb87a           │ bfbe30e3-18af-4f79-97d8-3c70744e5dc5 │
└─────────┴────────────────────┴──────────────────────────────────────┘
```

### デバイスのメッセージを許可する

末尾の番号が同じ番号の場合は、`trigger-*`から`action-*`へメッセージが送信できるように設定されています。(例: triggger-1からaction-1)。任意のデバイス間のメッセージ送信を許可する場合は以下のコマンドを実行たとえばaction-1からtrigger-3へのメッセージ送信を許可します。

```sh
$ docker-compose run --rm iotutil whiten -- -f action-1 -t trigger-3

> iotutil@0.0.1 start /app
> node app.js "whiten" "-f" "action-1" "-t" "trigger-3"

action-1 can send message to trigger-3
```

## CLIからデバイスのUUIDを取得する

`iotutil`サービスの`list`コマンドを実行すると登録されているデバイス情報を取得できます。

```sh
$ docker-compose run --rm iotutil list

> iotutil@0.0.1 start /app
┌───────────┬──────────┬──────────────────────────────────────┐
│ keyword   │ token    │ uuid                                 │
├───────────┼──────────┼──────────────────────────────────────┤
│ trigger-1 │ bfdc54e3 │ 8383dee6-31d5-43d0-aee7-4abc21aa19c2 │
├───────────┼──────────┼──────────────────────────────────────┤
│ trigger-2 │ 18b0ee41 │ a32d604e-b9e3-4584-9f10-30d2925d634d │
├───────────┼──────────┼──────────────────────────────────────┤
│ trigger-3 │ 701fc8da │ 5cee22da-b9c0-4746-8876-4017ca0d8cf0 │
...
```

`show`コマンドを実行すると個別のデバイスの情報を表示します。

```sh
$ docker-compose run --rm iotutil show -- --keyword action-1

> iotutil@0.0.1 start /app
> node app.js "show" "--keyword" "action-3"

┌──────────┬──────────┬──────────────────────────────────────┐
│ keyword  │ token    │ uuid                                 │
├──────────┼──────────┼──────────────────────────────────────┤
│ action-1 │ b6716f76 │ 32d85553-b41d-4a62-8828-b5f1187768ee │
└──────────┴──────────┴──────────────────────────────────────┘
```

### APIからデバイスのUUIDを取得する

`owner`デバイスの場合は、`/owner/uuid`、通常のデバイスは`/device/uuid`に対してクエリ文字列に`keyword`と`token`を渡してHTTP GETします。

```sh
$ curl --insecure "https://xxx.xxx.xxx.xxx/owner/uuid?token=052cb87a&keyword=owner"
{"uuid":"bfbe30e3-18af-4f79-97d8-3c70744e5dc5"}
```

## デバイスの削除

`del`コマンドで登録してあるデバイスをすべて削除します。削除後は`regiser`コマンドを実行してデバイスを再作成します。

```sh
$ docker-compose run --rm iotutil del

> iotutil@0.0.1 start /app
> node app.js "del"

are you sure?: [Yn]:  Y
trigger-1, trigger-2, trigger-3, trigger-4, trigger-5, action-1, action-2, action-3, action-4, action-5, owner are deleted.
```

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[Masato Shimizu](https://github.com/masato)