FROM node:4.1
MAINTAINER Masato Shimizu <ma6ato@gmail.com>

RUN mkdir -p /app
WORKDIR /app

RUN adduser --disabled-password --gecos '' --uid 1000 docker && \
    chown -R docker:docker /app

USER docker
COPY package.json /app/
RUN  npm install

COPY . /app
CMD ["npm","start"]
