<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

Project author - &copy; [Otar Kalandadze](https://www.linkedin.com/in/otokalandadze/)

## Description
Api of the guessing based game just for web backend portfolio

## Installation

```bash
$ npm install
```

## Running the app

```bash
# local (generates typedoc files too)
$ npm run start

# watch mode
$ npm run start:watch

# production mode
$ npm run build && npm run start:prod
```

## Test (Unit tests are not set up)

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Application flow:

* (optional) Create room with POST request on endpoint /rooms
and receive the room key

* Join room by opening websocket (using socket.io)
on namespace /rooms?key=keyReceivedFromApiOrFriend.
If connection was closed immediately, it means that
key was incorrect, room was deleted, room is full or
game is in progress

* Listen to websocket events to receive
your credentials (used to submit word guesses
and adding custom words) and keep updated with
current game state.

* Mark yourself ready by sending PUT request
on endpoint /rooms/ready. (Game will not start until all
players are marked ready before each game)

* (optional) If custom word mode is active, add
custom words with POST request on endpoint /rooms/word (Game
will not start if no custom words are provided)

* (optional) To try and guess the word, submit guess
with POST request on endpoint /rooms/guess

## Documentation

See detailed HTTP documentation in swagger (Will be available on /swagger address
when application is running)

See detailed events information (names and payload types) on /typedoc/modules/rooms_helpers_rooms_events.html
when application is running and typedoc files have been generated

See sample client application on /public address
when application is running.


### Prerequisite
Api uses [Serpapi](https://serpapi.com/) for fetching images
from Google. So api key will be needed in configuration.
You can generate it yourself for free (100 queries = 100games)
by registering on Serpapi.

### Configuration
App configuration is specified in
.env file:
* PORT - number(defaults to 3000)
* CORS - boolean(defaults to false)
* API_KEY - string(API key for Serpapi)

### Credits
Game words list copied from [engichang1467/word-pictionary-list](https://github.com/engichang1467/word-pictionary-list)
