# serverless-offline-dynamodb

! This plugin is under development. Feel free to use it and collaborate!

## How to use:

1) Start a container of amazon/dynamodb-local:

docker-compose.yml example:

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

2) Add 'serverless-offline-dynamodb' in plugins section of serverless (be sure to add ir BEFORE serverless-offline) 

3) The Plugin will create all tables

 - Tip: You can run `npx dynamodb-admin -H localhost` to check your database 

## How to Seed data:

To seed data, just create a folder called `seed` on project root and put a json file with exact same name of table you want to seed.