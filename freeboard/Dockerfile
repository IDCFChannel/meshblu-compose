FROM iojs:2.3-onbuild
MAINTAINER Masato Shimizu <ma6ato@gmail.com>

RUN git clone --depth 1 https://github.com/Freeboard/freeboard.git public
RUN sed -i -e 's/skynet\.\(createConnection\)/meshblu\.\1/' public/js/freeboard+plugins.min.js
RUN cat /dev/null > public/favicon.ico

EXPOSE 8080
