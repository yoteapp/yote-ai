
FROM node:16
MAINTAINER grant@fugitivelabs.com

RUN npm install -g forever

ADD / ./yoteAi

# RUN cd /server && npm rebuild node-sass node-sass-middleware winston-mongodb 
# RUN cd /yote && npm install @google-cloud/logging
RUN cd /yoteAi/server && npm install babel-runtime

EXPOSE 80

CMD cd /yoteAi/server && forever ./index.js