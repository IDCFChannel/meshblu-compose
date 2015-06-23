local function getUUID()
    local client = require "redisClient"
    local red, err = client.Connect(31556926)
    if not red then
        return
    end

    local m,err = ngx.re.match(ngx.var.uri,"(data|devices)/((action|trigger)-\\d)")

    if not m then 
        ngx.say("not matched!")
        return
    end

    local uuid_key = m[2]
    local res, err = red:hmget(uuid_key,"uuid")

    red:close()

    if not res then
        ngx.exit(ngx.HTTP_FORBIDDEN) 
    end

    ngx.var.device_uri = "/" .. m[1] .. "/" .. unpack(res)

end

getUUID()
