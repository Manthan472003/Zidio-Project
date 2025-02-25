const { DataTypes } = require('sequelize');
const sequelize = require('../Config/config');

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    commentText: {
        type: DataTypes.JSON,
        allowNull: true
    },
    textCommentforViewtask: {
        type: DataTypes.TEXT,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'tasks_table',
            key: 'id'
        }
    },
    createdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'user_table',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
        allowNull: true
    }
}, {
    tableName: 'teams_comments_table',
    timestamps: true
});

module.exports = Comment;