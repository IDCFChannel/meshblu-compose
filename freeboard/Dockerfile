FROM node:7.1-onbuild
MAINTAINER Masato Shimizu <ma6ato@gmail.com>

RUN git clone --depth 1 https://github.com/Freeboard/freeboard.git public
RUN sed -i -e 's/skynet\.\(createConnection\)/meshblu\.\1/' public/js/freeboard_plugins.min.js
RUN sed -i -e 's/http:\/\/meshblu\.octoblu\.com\/js\/meshblu\.js/https:\/\/cdn\.octoblu\.com\/js\/meshblu\/latest\/meshblu\.bundle\.js/g' public/js/freeboard_plugins.min.js
RUN cat /dev/null > public/favicon.ico

EXPOSE 8080
