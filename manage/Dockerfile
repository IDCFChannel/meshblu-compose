FROM node:4.1
MAINTAINER Masato Shimizu <ma6ato@gmail.com>

RUN mkdir -p /app
WORKDIR /app

#COPY package.json /app/
#COPY bower.json /app/
#COPY gulpfile.js /app/
#COPY config.js /app/

COPY . /app
RUN npm install && \
    ./node_modules/bower/bin/bower install --allow-root && \
    npm run build

CMD ["npm","start"]
