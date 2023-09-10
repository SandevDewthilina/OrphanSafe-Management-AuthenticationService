FROM node:18


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=development
ENV JWT_SECRET=9f4i3j9iSAAfAS3iGFD9jmicj4SAA3x8
ENV POSTGRESQL_HOST=localhost
ENV POSTGRESQL_PORT=5432
ENV POSTGRESQL_USERNAME=postgres
ENV POSTGRESQL_DATABASE=OrphanSafeCentralDB
ENV POSTGRESQL_PASSWORD=root123
ENV MESSAGE_BROKER_URL=amqps://sjyjmufp:uq4lzXCjODpADHBMQFIBGk2ofUaDmo8A@lionfish.rmq.cloudamqp.com/sjyjmufp
ENV EXCHANGE_NAME=ORPHAN_SAFE_MANAGEMENT_EXCHANGE
ENV AUTH_SERVICE_BINDING_KEY=AUTH_SERVICE
ENV AUTH_SERVICE_RPC=AUTH_SERVICE_RPC
ENV PROFILE_SERVICE_BINDING_KEY=PROFILE_SERVICE
ENV PROFILE_SERVICE_RPC=PROFILE_SERVICE_RPC
ENV NOTIFICATION_SERVICE_BINDING_KEY=NOTIFICATION_SERVICE
ENV NOTIFICATION_SERVICE_RPC=NOTIFICATION_SERVICE_RPC


CMD [ "node", "src/server.js" ]
