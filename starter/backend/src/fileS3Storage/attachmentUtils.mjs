import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {createLogger} from "../utils/logger.mjs";

const s3Client = new S3Client({ region: "us-east-1" });
const logger = createLogger('attachmentUtils')

export async function getUploadUrl(attachmentId) {
    try {
        const uploadObjectCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: attachmentId,
        });
        const generatedSignedUrl  = await getSignedUrl(s3Client, uploadObjectCommand, { expiresIn: 3600 });
        logger.info(`Generated signed URL: ${generatedSignedUrl }`);

        return generatedSignedUrl;
    } catch (error) {
        logger.error(`Failed to generate signed URL: ${error.message}`, { error });
        throw new Error("An error occurred while generating the signed URL");
    }
}