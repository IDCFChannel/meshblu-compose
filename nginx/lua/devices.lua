local function getUUID()
    local client = require "redisClient"
    local red, err = client.Connect(31556926)
    if not red then
        return
    end

    local m,err = ngx.re.match(ngx.var.uri,"(data|devices)/(trigger-\\d)")

    if not m then 
        ngx.say("not matched!")
        return
    end

    ngx.log(ngx.STDERR, "@@ m1: " .. m[1])
    ngx.log(ngx.STDERR, "@@ m2: " .. m[2])

    local uuid_key = m[2]
    local res, err = red:hmget(uuid_key,"uuid")

    red:close()

    if not res then
        ngx.exit(ngx.HTTP_FORBIDDEN) 
    end


    ngx.log(ngx.STDERR, "/" .. m[1] .. "/" .. unpack(res))
    ngx.var.device_uri = "/" .. m[1] .. "/" .. unpack(res)

end

getUUID()
