// server/utils/s3.js
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION
});

export const uploadToS3 = async (file) => {
  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const key = `images/${fileName}`;

  const result = await s3.upload({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }).promise();

  return { key, url: result.Location };
};

export const deleteFromS3 = async (url) => {
  const key = decodeURIComponent(url.split('/').slice(3).join('/'));

  await s3.deleteObject({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key
  }).promise();
};
