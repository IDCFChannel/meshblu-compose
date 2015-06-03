local function getUUID()
    local client = require "redisClient"
    local red, err = client.Connect(31556926)
    if not red then
        return
    end

    local m,err = ngx.re.match(ngx.var.uri,"(trigger-\\d)")

    if not m then 
        ngx.say("not matched!")
        return
    end

    local uuid_key = m[0]
    local res, err = red:hmget(uuid_key,"uuid")
    ngx.say(res)

    if not res then
        ngx.say("failed to get uuid: ", err)
        return
    end

    red:close()
    return
end

getUUID()
