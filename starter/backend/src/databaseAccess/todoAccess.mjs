import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { getUploadUrl } from '../fileS3Storage/attachmentUtils.mjs';
import AWSXRay from 'aws-xray-sdk-core';
import {createLogger} from "../utils/logger.mjs";

const logger = createLogger('createTodo')
const xrayCapturedDynamoDBClient = AWSXRay.captureAWSv3Client(new DynamoDB({ region: 'us-east-1' }));
const documentClientWithXRay = DynamoDBDocument.from(xrayCapturedDynamoDBClient);
const todosTable = process.env.TODOS_TABLE;
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;

export const TodoAccesss = {
    async getAll(userId) {
        const result = await documentClientWithXRay.query({
            TableName: todosTable,
            IndexName: todosCreatedAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        });

        return result.Items;
    },

    async createTodo(todoItem) {
        logger.info(`Type of userId in todoItem: ${todoItem.userId.constructor.name}`);
        await documentClientWithXRay.put({
            TableName: todosTable,
            Item: todoItem
        });
        return todoItem;
    },

    async updateTodo(userId, todoId, updatedTodo) {
        await documentClientWithXRay.update({
            TableName: todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ReturnValues: 'ALL_NEW'
        });
        return updatedTodo;
    },


    async deleteTodo(userId, todoId) {
        await documentClientWithXRay.delete({
            TableName: todosTable,
            Key: {
                userId,
                todoId
            }
        });
    },

    async getUploadUrl(todoId) {
        return getUploadUrl(todoId);
    }
};