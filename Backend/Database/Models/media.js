const { DataTypes } = require('sequelize');
const sequelize = require('../Config/config');

const Media = sequelize.define('Media', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    mediaLink: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Task','Build')
    },
    taskOrBuildId: {
        type: DataTypes.INTEGER,
    },
    mediaType: {
        type: DataTypes.ENUM('Image','Video')
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
    tableName: 'teams_media_table',
    timestamps: false
});

module.exports = Media;
