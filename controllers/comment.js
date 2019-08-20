const Comment = require('../models/comment')
const Article = require('../models/article')



module.exports.createComment = async (req) => {
    let articleId = null
    const article = await Article.findOne({
        ownerId: req.article.ownerId
    })
    if (!article) {
        const article = new Article({
            ownerId: req.article.ownerId,
            title: req.article.title
        })
        const middleResult = await article.save()
        articleId = middleResult._id
        //console.log('middleResult', middleResult)
        //return null
    } else {
        articleId = article._id
    }
    const comment = new Comment({
        author: req.author.id,
        content: req.comment.content,
        article: articleId
    })
    try {
        await comment.save()
        return {comment}
    } catch (e) {
        return {errorMessage: e.message}
    }
}

module.exports.getCommentsByArticleOwnerId = async (req) => {

    try {
        const article = await Article.findOne({
            ownerId: req
        })
        if (!article) return []

        class CleanedComment {
            constructor(content, author, datetime) {
                this.content = content
                this.author = author.name
                this.avatar = author.avatar
                this.datetime = datetime
            }
        }
        const comments = await Comment.find({
            article: article._id
        })
        .populate('author', 'avatar name')

        return comments.map(c => {
            return new CleanedComment(c.content, c.author, c.datetime)
        })
    } catch (e) {
        return {errorMessage: e.message}
    }
}

