import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import {updateTodoForUser} from '../../crudLogic/todo.mjs';
import {getUserId} from '../utils.mjs';
import {createLogger} from "../../utils/logger.mjs";

const logger = createLogger(' updateTodo')

const updateTodoHandler = async (event) => {
    try {
        const userId = getUserId(event);
        const todoId = event.pathParameters.todoId;
        const requestData = JSON.parse(event.body);
        await updateTodoForUser(userId, todoId, requestData);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "The todo item has been updated successfully."
            })
        };
    } catch (error) {
        logger.error(`An error occurred: ${error.message}`, { error });
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to update the todo item."
            })
        };
    }
};

export const handler = middy(updateTodoHandler)
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }));