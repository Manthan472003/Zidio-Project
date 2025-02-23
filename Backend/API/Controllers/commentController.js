const Comment = require('../../Database/Models/comment');
const Task = require('../../Database/Models/task');
const User = require('../../Database/Models/user');
const multer = require('multer');
require('dotenv').config(); 
const s3 = require('../../Database/Config/s3Config');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path); // Set ffmpeg path

const BUCKET = process.env.AWS_BUCKET_NAME;


const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fieldSize: 5 * 1024 * 1024 }
});

// Helper function to compress video
const compressVideo = (mediaFile) => {
    return new Promise((resolve, reject) => {
        const tempDir = path.join(__dirname, '../../temp');
        const inputPath = path.join(tempDir, `input_${Date.now()}_${mediaFile.originalname}`);
        const outputPath = path.join(tempDir, `output_${Date.now()}_${mediaFile.originalname}`);

        // Ensure the temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write the input buffer to a temporary file
        fs.writeFile(inputPath, mediaFile.buffer, (err) => {
            if (err) return reject(err);

            ffmpeg(inputPath)
                .output(outputPath)
                .videoCodec('libx264')
                .size('640x?') // Compress to 640px width, keeping aspect ratio
                .on('end', () => {
                    const compressedBuffer = fs.readFileSync(outputPath); // Read the compressed file
                    fs.unlinkSync(inputPath); // Clean up the input file
                    fs.unlinkSync(outputPath); // Clean up the output file
                    resolve(compressedBuffer);
                })
                .on('error', (err) => {
                    fs.unlinkSync(inputPath); // Clean up the input file on error
                    reject(err);
                })
                .run();
        });
    });
};

// Get all comments
const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.findAll();

        // Format the commentText to return as an array of URLs (if it's a media comment)
        const formattedComments = comments.map(comment => {
            let commentText = comment.commentText;

            // If commentText is a valid JSON string (array of URLs), parse it
            if (typeof commentText === 'string') {
                try {
                    commentText = JSON.parse(commentText);
                } catch (err) {
                    // If it's not a JSON array, treat it as regular text
                    commentText = [commentText];
                }
            } else if (!Array.isArray(commentText)) {
                // If it's neither a JSON string nor an array, convert it into an array
                commentText = [commentText];
            }

            return {
                id: comment.id,
                commentText,  // This will be the array of URLs or regular text
                textCommentforViewtask: comment.textCommentforViewtask,
                taskId: comment.taskId,
                createdByUserId: comment.createdByUserId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
            };
        });

        return res.status(200).json(formattedComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'Error fetching comments', error });
    }
};

// Get comment by ID
const getCommentById = async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        return res.status(200).json(comment);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching comment', error });
    }
};

// Get comments by taskId
const getCommentsByTaskId = async (req, res) => {
    const { taskId } = req.params;
    if (taskId) {
        const commentTaskId = await Task.findOne({
            where: { id: taskId }
        });
        if (!commentTaskId) {
            return res.status(404).json({ message: 'Task does not exist.' });
        }
    }

    try {
        const comments = await Comment.findAll({ where: { taskId } });
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching comments by taskId', error });
    }
};

// Create a comment
const createComment = async (req, res) => {
    const { commentText, taskId, createdByUserId } = req.body;
    if (taskId) {
        const commentTaskId = await Task.findOne({
            where: { id: taskId }
        });
        if (!commentTaskId) {
            return res.status(404).json({ message: 'Task does not exist.' });
        }
    }

    if (createdByUserId) {
        const commentUserId = await User.findOne({
            where: { id: createdByUserId }
        });
        if (!commentUserId) {
            return res.status(404).json({ message: 'User does not exist.' });
        }
    }

    try {
        const newComment = await Comment.create({
            textCommentforViewtask : commentText,
            taskId,
            createdByUserId,
        });
        return res.status(201).json(newComment);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating comment', error });
    }
};

const uploadMediaAsComment = async (req, res) => {
    const { taskId, createdByUserId, textCommentforViewtask } = req.body;
    const mediaFiles = req.files;

    // Check if mediaFiles are provided
    if (!mediaFiles || mediaFiles.length === 0) {
        return res.status(400).json({ message: 'At least one media file is required.' });
    }

    try {
        // Check if task exists
        const taskExists = await Task.findOne({ where: { id: taskId } });
        if (!taskExists) {
            return res.status(404).json({ message: 'Task does not exist.' });
        }

        // Check if user exists
        const userExists = await User.findOne({ where: { id: createdByUserId } });
        if (!userExists) {
            return res.status(404).json({ message: 'User does not exist.' });
        }

        const mediaLinks = [];
        // Process each file
        for (const mediaFile of mediaFiles) {
            let buffer;
            let mediaType;

            // Determine media type and process the file accordingly
            if (mediaFile.mimetype.startsWith('image/')) {
                // Compress image
                buffer = await sharp(mediaFile.buffer)
                    .resize(1024) // Resize image to a width of 1024px, keeping aspect ratio
                    .toBuffer();
                mediaType = 'Image';
            } else if (mediaFile.mimetype.startsWith('video/')) {
                // Compress video
                buffer = await compressVideo(mediaFile);
                mediaType = 'Video';
            } else {
                return res.status(400).json({ message: 'Unsupported media type.' });
            }

            const params = {
                Bucket: BUCKET,
                Key: `media/${Date.now()}_${mediaFile.originalname}`,
                Body: buffer,
                ContentType: mediaFile.mimetype,
                ContentDisposition: 'inline',
            };

            try {
                // Upload to S3
                const data = await s3.upload(params).promise();
                const uploadedMediaLink = data.Location;

                // Add the media link to the array
                mediaLinks.push(uploadedMediaLink);
            } catch (uploadError) {
                console.error(`Error uploading file ${mediaFile.originalname}:`, uploadError);
                return res.status(500).json({ message: 'Error uploading media file.', error: uploadError });
            }
        }

        // Create the comment with the media links and text comment
        const newComment = await Comment.create({
            commentText: mediaLinks,  // Store media links as an array of URLs
            textCommentforViewtask,  // Store the text comment here
            taskId,
            createdByUserId,
            isMedia: true,  // Assuming this is a flag to indicate media comment
        });

        // Create the final response object with mediaLinks as an array
        const newCommentResponse = {
            id: newComment.id,
            commentText: mediaLinks,  // media links will be an array
            textCommentforViewtask,   // Text comment to be included
            taskId,
            createdByUserId,
            createdAt: newComment.createdAt,
            updatedAt: newComment.updatedAt,
        };

        // Return the successful response with all media links
        return res.status(201).json({ message: "New media added", newCommentResponse });
    } catch (error) {
        console.error('Error creating comment:', error); // For debugging
        return res.status(500).json({ message: 'Error creating comment', error });
    }
};

// Update a comment
const updateComment = async (req, res) => {
    const { id } = req.params;
    const { commentText, taskId, createdByUserId } = req.body;

    if (id) {
        const commentId = await Comment.findOne({
            where: { id }
        });
        if (!commentId) {
            return res.status(404).json({ message: 'CoomentId does not exist.' });
        }
    }

    if (taskId) {
        const commentTaskId = await Task.findOne({
            where: { id: taskId }
        });
        if (!commentTaskId) {
            return res.status(404).json({ message: 'Task does not exist.' });
        }
    }

    if (createdByUserId) {
        const commentUserId = await User.findOne({
            where: { id: createdByUserId }
        });
        if (!commentUserId) {
            return res.status(404).json({ message: 'User does not exist.' });
        }
    }

    try {
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.commentText = commentText || comment.commentText;
        comment.taskId = taskId || comment.taskId;
        comment.createdByUserId = createdByUserId || comment.createdByUserId;
        await comment.save();
        return res.status(200).json(comment);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating comment', error });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    const { id } = req.params;

    if (id) {
        const commentId = await Comment.findOne({
            where: { id }
        });
        if (!commentId) {
            return res.status(404).json({ message: 'CoomentId does not exist.' });
        }
    }

    try {
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        await comment.destroy();
        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting comment', error });
    }
};

module.exports = {
    upload,
    getAllComments,
    getCommentById,
    getCommentsByTaskId,
    createComment,
    uploadMediaAsComment,
    deleteComment,
    updateComment
}