import { TodoAccesss } from '../databaseAccess/todoAccess.mjs';
import { v4 as uuidv4 } from 'uuid';
import {createLogger} from "../utils/logger.mjs";
const logger = createLogger('createTodo')
export const createTodo = async (userId, newTodo) => {
    const todoId = uuidv4();
    const createdAt = new Date().toISOString();

    const todoItem = {
        userId,
        todoId,
        createdAt,
        ...newTodo,
        attachmentUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${todoId}`
    };
    logger.info(`Logging the details of todoItem: ${JSON.stringify(todoItem)}`);
    return await TodoAccesss.createTodo(todoItem);
};

export const getTodosForUser = async (userId) => {
    return await TodoAccesss.getAll(userId);
};

export const updateTodoForUser = async (userId, todoId, updatedTodo) => {
    return await TodoAccesss.updateTodo(userId, todoId, updatedTodo);
};

export const deleteTodoForUser = async (userId, todoId) => {
    await TodoAccesss.deleteTodo(userId, todoId);
};

export const generateUploadUrl = async (todoId, userId) => {
    return await TodoAccesss.getUploadUrl(todoId, userId);
};