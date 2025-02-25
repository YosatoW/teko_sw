import { db } from '../database'
import { postsTable, commentsTable, usersTable } from '../db/schema'
import { desc, eq } from 'drizzle-orm'
import chalk from 'chalk'

const showSentiments = async () => {
    try {
        // Fetch posts with user info
        const posts = await db
            .select({
                id: postsTable.id,
                content: postsTable.content,
                username: usersTable.username,
                sentiment: postsTable.sentiment,
                correction: postsTable.correction,
            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
            .orderBy(desc(postsTable.createdAt))

        console.log(chalk.bold('\n=== Posts Sentiment Analysis ===\n'))

        for (const post of posts) {
            console.log(chalk.bold('Post #' + post.id + ' by ' + post.username))
            console.log('Content:', post.content)
            console.log('Sentiment:', getSentimentColor(post.sentiment))
            if (post.correction) {
                console.log('Suggestion:', chalk.blue(post.correction))
            }
            console.log('---')

            // Fetch comments for this post
            const comments = await db
                .select({
                    id: commentsTable.id,
                    content: commentsTable.content,
                    username: usersTable.username,
                    sentiment: commentsTable.sentiment,
                    correction: commentsTable.correction,
                })
                .from(commentsTable)
                .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
                .where(eq(commentsTable.postId, post.id))
                .orderBy(desc(commentsTable.createdAt))

            if (comments.length > 0) {
                console.log(chalk.bold('Comments:'))
                for (const comment of comments) {
                    console.log(`  └─ #${comment.id} by ${comment.username}`)
                    console.log('     Content:', comment.content)
                    console.log('     Sentiment:', getSentimentColor(comment.sentiment))
                    if (comment.correction) {
                        console.log('     Suggestion:', chalk.blue(comment.correction))
                    }
                }
                console.log()
            }
            console.log('================\n')
        }
    } catch (error) {
        console.error('Error fetching sentiment data:', error)
    }
}

const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return chalk.gray('Not analyzed')
    
    switch (sentiment.toLowerCase()) {
        case 'positive':
            return chalk.green('Positive')
        case 'negative':
            return chalk.red('Negative')
        case 'neutral':
            return chalk.yellow('Neutral')
        case 'hate_speech':
            return chalk.bgRed.white('HATE SPEECH')
        default:
            return chalk.gray(sentiment)
    }
}

showSentiments()
