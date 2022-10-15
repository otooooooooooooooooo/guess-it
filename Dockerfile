FROM node:14.17.6-alpine

# create workdir
WORKDIR usr/src/app

# copy package.json and package-lock.json if present
COPY package*.json ./

RUN apk add --no-cache git

RUN git --version

# install dependencies
RUN npm install

# copy source code
COPY . .

# build
RUN npm run build

# expose port
EXPOSE 3000

# run development build
CMD ["node", "dist/main"]
