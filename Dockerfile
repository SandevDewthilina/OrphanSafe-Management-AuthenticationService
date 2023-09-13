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
ENV JWT_SECRET=fkdjaokfoaksjdfokasjdf
ENV POSTGRESQL_HOST=localhost
ENV POSTGRESQL_PORT=5432
ENV POSTGRESQL_USERNAME=postgres
ENV POSTGRESQL_DATABASE=OrphanSafeCentralDB
ENV POSTGRESQL_PASSWORD=root123


CMD [ "node", "src/server.js" ]
