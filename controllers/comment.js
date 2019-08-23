const Comment = require('../models/comment')
const Article = require('../models/article')

module.exports.createComment = async (req) => {
    let articleId = null
    const article = await Article.findOne({
        ownId: req.article.ownId
    })
    if (!article) {
        const newArticle = new Article({
            ownId: req.article.ownId,
            title: req.article.title
        })
        const middleResult = await newArticle.save()
        articleId = middleResult._id
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
        throw e
    }
}

module.exports.getCommentsByArticleOwnId = async (req) => {
    try {
        const article = await Article.findOne({ownId: req})
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
        throw e
    }
}

