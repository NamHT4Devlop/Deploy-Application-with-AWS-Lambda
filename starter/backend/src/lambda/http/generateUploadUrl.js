import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import {generateUploadUrl} from '../../crudLogic/todo.mjs';
import {getUserId} from '../utils.mjs';
import {createLogger} from "../../utils/logger.mjs";

const logger = createLogger(' generateUploadUrl')

const generateUploadUrlHandler = async (event) => {
    try {
        const userId = getUserId(event);
        const todoId = event.pathParameters.todoId;
        const newUrl = await generateUploadUrl(todoId, userId);
        return {
            statusCode: 200,
            body: JSON.stringify({
                uploadUrl: newUrl
            })
        };
    } catch (error) {
        logger.error('An error occurred:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to generate upload URL."
            })
        };
    }
};

export const handler = middy(generateUploadUrlHandler)
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }));