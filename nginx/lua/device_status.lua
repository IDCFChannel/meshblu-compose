local function getStatus()
    local cjson = require "cjson"
    local args = ngx.req.get_uri_args()

    local client = require "redisClient"
    local red, err = client.Connect(31556926)

    local namespace 
    if string.sub(args.keyword,1,string.len('action'))=='action' then
        namespace = 'actions:'
    else
        namespace = 'triggers:'
    end

    local uuid_key = namespace .. args.keyword .. ':' .. args.token
    local res, err = red:hmget(uuid_key,"uuid")

    ngx.log(ngx.ERR, "uuid_key ", uuid_key)

    if not res then
        ngx.say("failed to get uuid: ", err)
        return
    end

    ngx.header.content_type = "application/json; charset=utf-8"
    ngx.say(cjson.encode({uuid = unpack(res)}))
    red:close()
end
getStatus()