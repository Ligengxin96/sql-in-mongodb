import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    creatorId: String,
    tags: [String],
    selectedFile: String,
    likes: { 
        type: [String], 
        default: [] 
    },
    comments: { 
        type: [String], 
        default: [] 
    },
    createdTime: {
        type: Date,
        default: new Date(),
    },
    lastestUpdateTime: {
        type: Date,
        default: new Date(),
    }
})

const PostModel = mongoose.model('PostMessage', postSchema);

export default PostModel;