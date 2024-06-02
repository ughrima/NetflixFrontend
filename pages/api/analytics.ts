import { NextApiResponse, NextApiRequest } from 'next';
import AWS from 'aws-sdk';
import { getSessionId } from '../../utils/session';
import { v4 as uuidv4 } from 'uuid';

const s3 = (process.env.AWS_REGION && process.env.AWS_S3_BUCKET) ? new AWS.S3({ region: process.env.AWS_REGION }) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = getSessionId(req, res);
  const timestamp = new Date().toISOString();
  const activityId = uuidv4();

  const userActivity = {
    activityId,
    sessionId,
    timestamp,
    mediaId: req.body.mediaId,
  };

  if (!s3) {
    console.log('Analytics functionality disabled. Skipping...');
    res.status(200).json(userActivity);
    return;
  }

  const putObjectParams = {
    Bucket: process.env.AWS_S3_BUCKET !== undefined ? process.env.AWS_S3_BUCKET : '',
    Key: `${sessionId}/${activityId}.json`,
    Body: JSON.stringify(userActivity),
    ContentType: 'application/json',
  };

  try {
    await s3.putObject(putObjectParams).promise();
    res.status(200).json({ message: 'User session updated successfully', sessionId });
  } catch (error) {
    console.error('Error updating user session:', error);
    res.status(500).json({ error: 'Error updating user session' });
  }
}
