import { Job, Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { db } from '../database'
import { postsTable, commentsTable } from '../db/schema'
import { eq } from 'drizzle-orm'
import { textAnalysis } from '../services/ai'
import { SERVER_ROLE } from '../app'
import { logger } from '../services/logger'


let sentimentQueue: Queue 
let sentimentWorker: Worker 
let commentSentimentQueue: Queue

export const initializeMessageBroker = () => {
    const connection = new IORedis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: null,
    })
    
    sentimentQueue = new Queue('post-sentiment', { connection })
    commentSentimentQueue = new Queue('comment-sentiment', { connection })
    
    sentimentWorker = new Worker('post-sentiment', analyzeSentiment, { connection })
    new Worker('comment-sentiment', analyzeCommentSentiment, { connection })
    
    sentimentQueue = new Queue('sentiment', { connection })
    logger.info('Message broker initialized')
    if (SERVER_ROLE === 'all' || SERVER_ROLE === 'worker') {
        sentimentWorker = new Worker('sentiment', analyzeSentiment, { connection })
        logger.info('Sentiment worker initialized')
    }
}

const analyzeSentiment = async (job: Job) => {
    const { postId } = job.data
    
    try {
        const [post] = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.id, postId))
            .limit(1)

        if (!post) {
            throw new Error(`Post ${postId} not found`)
        }

        const analysis = await textAnalysis(post.content)

        await db
            .update(postsTable)
            .set({
                sentiment: analysis.sentiment,
                correction: analysis.correction
            })
            .where(eq(postsTable.id, postId))

        logger.info(`Sentiment analysis completed for post ${postId}`)
    } catch (error) {
        console.error('Error in sentiment analysis:', error)
        throw error
    }
}

const analyzeCommentSentiment = async (job: Job) => {
    const { commentId } = job.data
    
    try {
        const [comment] = await db
            .select()
            .from(commentsTable)
            .where(eq(commentsTable.id, commentId))
            .limit(1)

        if (!comment) {
            throw new Error(`Comment ${commentId} not found`)
        }

        const analysis = await textAnalysis(comment.content)

        await db
            .update(commentsTable)
            .set({
                sentiment: analysis.sentiment,
                correction: analysis.correction
            })
            .where(eq(commentsTable.id, commentId))

        logger.info(`Sentiment analysis completed for comment ${commentId}`)
    } catch (error) {
        console.error('Error in comment sentiment analysis:', error)
        throw error
    }
}

export { sentimentQueue, commentSentimentQueue }


