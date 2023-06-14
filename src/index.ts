import fs from 'fs'
import path from 'path'

import {
  CreateTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import Serverless from 'serverless'

class OfflineDynamoDB {

  serverless: Serverless
  dynamoDBClient: DynamoDBClient
  hooks: { [key: string]: () => Promise<void> }

  constructor(serverless: Serverless) {
    this.serverless = serverless

    console.log('Initializing Offline DynamoDB Plugin...')

    const { service: { custom: { 'serverless-offline-dynamodb': offlineDynamoDBConfig } } } = serverless

    const { dynamoDBEndpoint } = offlineDynamoDBConfig ?? {}

    if (!dynamoDBEndpoint) {
      throw new Error('Missing dynamoDBEndpoint config')
    }

    this.dynamoDBClient = new DynamoDBClient({
      endpoint: dynamoDBEndpoint,
      credentials: {
        accessKeyId: 'DEFAULT_ACCESS_KEY',
        secretAccessKey: 'DEFAULT_SECRET',
      },
    })

    this.hooks = {
      'offline:start': () => this.migrate(),
    }
  }

  get tablesToCreate() {
    const resources = this.serverless.service.resources.Resources ?? []
    const tableTypes = ['AWS::DynamoDB::Table', 'AWS::DynamoDB::GlobalTable']
    const tables = []
    for (const key in resources) {
      const resource = resources[key]
      if (tableTypes.includes(resource.Type)) {
        if (resource.Properties.BillingMode === 'PAY_PER_REQUEST') {
          delete resource.Properties.BillingMode

          const defaultProvisioning = {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          }
          resource.Properties.ProvisionedThroughput = defaultProvisioning
        }

        delete resource.Properties.Replicas

        tables.push(resource.Properties)
      }
    }
    return tables
  }

  async migrate() {
    const listTablesCommand = new ListTablesCommand({})
    const { TableNames: existingTableNames } = await this.dynamoDBClient.send(
      listTablesCommand,
    )

    for (const table of this.tablesToCreate) {
      try {
        if (!existingTableNames?.includes(table.TableName)) {
          console.log('Creating Table:', table.TableName)
          const createGlobalTableCommand = new CreateTableCommand(table)
          await this.dynamoDBClient.send(createGlobalTableCommand)
          await this.seed(table.TableName)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  async seed(tableName: string) {
    const filePath = path.join(process.cwd(), `/seed/${tableName}.json`)
    if (fs.existsSync(filePath)) {
      const seedData = require(filePath)
      for (const data of seedData) {
        console.log('Seeding Table:', tableName, data)
        const putItemCommand = new PutItemCommand({
          TableName: tableName,
          Item: marshall(data),
        })
        await this.dynamoDBClient.send(putItemCommand)
      }
    }
  }
}

export = OfflineDynamoDB