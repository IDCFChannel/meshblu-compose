local _M = {}

function _M.Connect(timeout)
    local redis = require "resty.redis"
    local red = redis:new()
    red:set_timeout(timeout*1000)

    local ok, err = red:connect(os.getenv("REDIS_PORT_6379_TCP_ADDR"), tonumber(os.getenv("REDIS_PORT_6379_TCP_PORT")))

    if not ok then
        return nil, "Failed to connect to Redis: " .. err
    else
        return red
    end
end

return _M