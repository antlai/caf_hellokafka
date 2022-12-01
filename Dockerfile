# VERSION 0.1
# DOCKER-VERSION  1.7.0
# AUTHOR:
# DESCRIPTION:    Cloud Assistants application hellokafka
# TO_BUILD:        cafjs mkImage . gcr.io/cafjs-k8/<user>-hellokafka
# TO_RUN:         cafjs run --appImage gcr.io/cafjs-k8/<user>-hellokafka hellokafka

FROM node:16

EXPOSE 3000

RUN mkdir -p /usr/src

ENV PATH="/usr/src/node_modules/.bin:${PATH}"

RUN apt-get update && apt-get install -y rsync

ENV PATH="/usr/local/bin:${PATH}"

RUN yarn config set prefix /usr/local

RUN yarn global add caf_build@0.4.1 browserify@17.0.0 uglify-es@3.3.9  && yarn cache clean

COPY . /usr/src

RUN cd /usr/src/app && yarn install --production --ignore-optional && cafjs build && yarn cache clean

WORKDIR /usr/src/app

ENTRYPOINT ["node"]

CMD [ "./index.js" ]
