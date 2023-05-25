# serverless-offline-dynamodb
A serverless plugin to create and manage local and offline DynamoDB.

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

## Features

* Create local DynamoDB Tables without any extra configuration
* Seed initial data easily.

## Docs
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Data Seed](#data-seed)




## Prerequisites

This plugin expects a [`amazon/dynamodb-local`](https://hub.docker.com/r/amazon/dynamodb-local/) container running and [`serverless-offline`](https://github.com/dherault/serverless-offline) properly configured.

Here is a `docker-compose.yml` example:

```
version: '3'
services:
  dynamodb:
    container_name: logistics-api-offline-dynamodb
    image: amazon/dynamodb-local
    ports:
      - '8000:8000'
    working_dir: /home/dynamodblocal
    command: '-jar DynamoDBLocal.jar -sharedDb -dbPath ./'
```

[optional] You can use `npx dynamodb-admin -H localhost` to view and access your database.

## Installation

```sh
npm i -D serverless-offline-dynamodb
```

Add `serverless-offline-dynamodb` into plugins section of your serverless configuration
(be sure to include it BEFORE serverless-offline)


## Data Seed:

To seed data, just create a folder called `seed` on project root and put a json file with exact same name of table you want to seed.