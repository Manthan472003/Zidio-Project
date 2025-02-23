const { DataTypes } = require('sequelize');
const sequelize = require('../Config/config');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    taskName: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    idWithPrefix: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT
    },
    dueDate: {
        type: DataTypes.DATE,
    },
    subTask: {
        type: DataTypes.TEXT
    },
    taskAssignedToID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    taskCreatedByID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'On Hold'),
        defaultValue: 'Not Started'
    },
    sectionID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    platformType: {
        type: DataTypes.ENUM('iOS', 'Android', 'Linux', 'WindowsOS', 'MacOS', 'Web', 'Platform-Independent'),
        defaultValue: 'Platform-Independent'
    },
    tagIDs: {
        type: DataTypes.JSON,
        allowNull: true
    },
    notificationIDs: {
        type: DataTypes.JSON,
        allowNull: true
    },
    isDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sentToQA: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
    deletedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
        onUpdate: DataTypes.NOW,
    }
}, {
    tableName: 'teams_tasks_table',
    timestamps: false,
    hooks: {
        beforeCreate: async (instance, options) => {
            // Get the current highest ID from the database
            const [result] = await sequelize.query('SELECT MAX(id) AS maxId FROM teams_tasks_table', {
                type: sequelize.QueryTypes.SELECT
            });

            // Increment the highest ID by 1 to get the new ID
            const newId = (result.maxId || 0) + 1;

            // Generate the idWithPrefix with the incremented ID
            instance.idWithPrefix = 'A-' + newId;
        }
    }
});

module.exports = Task;
