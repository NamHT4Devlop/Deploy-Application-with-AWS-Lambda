import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import {createTodo} from '../../crudLogic/todo.mjs';
import {getUserId} from '../utils.mjs';
import {createLogger} from "../../utils/logger.mjs";

const logger = createLogger('createTodo')

const createTodoHandler = async (event) => {
    try {
        const userId = getUserId(event);
        const createTodoItems = JSON.parse(event.body);
        logger.info(`New todo item created: ${JSON.stringify(createTodoItems)}`);
        logger.info(`User ID associated with the new todo: ${userId}`);
        const newTodoItem = await createTodo(userId, createTodoItems);
        return {
            statusCode: 201, body: JSON.stringify({
                item: newTodoItem
            })
        };
    } catch (error) {
        logger.error(`An error occurred: ${error}`);
        return {
            statusCode: 500, body: JSON.stringify({
                message: "Failed to create the todo item."
            })
        };
    }
};

export const handler = middy(createTodoHandler)
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }));