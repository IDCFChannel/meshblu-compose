local function getStatus()
    local cjson = require "cjson"
    local args = ngx.req.get_uri_args()

    local client = require "redisClient"
    local red, err = client.Connect(31556926)

    local uuid_key = args.keyword .. ":" ..args.token
    local res, err = red:hmget(uuid_key,"uuid")

    if not res then
        ngx.say("failed to get uuid: ", err)
        return
    end

    ngx.header.content_type = "application/json; charset=utf-8"
    ngx.say(cjson.encode({uuid = unpack(res)}))
    red:close()
end
getStatus()