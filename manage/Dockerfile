FROM node:4.1
MAINTAINER Masato Shimizu <ma6ato@gmail.com>

RUN mkdir -p /app
WORKDIR /app

RUN adduser --disabled-password --gecos '' --uid 1000 docker && \
    mkdir -p /dist/node_modules /dist/bower_components && \
    chown -R docker:docker /app && \
    ln -s /dist/node_modules /app/node_modules && \
    ln -s /dist/bower_components /app/bower_components && \
    chown -R docker:docker /app /dist/node_modules /dist/bower_components

USER docker
COPY package.json /app/
COPY bower.json /app/

RUN  npm install

COPY . /app
CMD ["npm","start"]