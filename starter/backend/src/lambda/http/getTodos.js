import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import {getTodosForUser} from '../../crudLogic/todo.mjs';
import {getUserId} from '../utils.mjs';
import {createLogger} from "../../utils/logger.mjs";

const logger = createLogger('getTodos')

const getTodosHandler = async (event) => {
    try {
        const userId = getUserId(event);
        logger.info(`Processing request for user with ID: ${userId}`);

        const userTodos = await getTodosForUser(userId);
        logger.info(`List of todos: ${JSON.stringify(userTodos)}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                items: userTodos
            })
        };
    } catch (error) {
        logger.error(`An error occurred: ${error.message}`, {error});
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to retrieve the list of todos."
            })
        };
    }
};

export const handler = middy(getTodosHandler)
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }));