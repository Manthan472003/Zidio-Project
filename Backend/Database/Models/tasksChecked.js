const { DataTypes } = require('sequelize');
const sequelize = require('../Config/config');

const TasksChecked = sequelize.define('TasksChecked', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  taskName: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  checkedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  buildId:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isWorking: {
    type: DataTypes.BOOLEAN
  }
}, {
  tableName: 'teams_tasks_checked_table',
  timestamps: true, // Enables automatic createdAt and updatedAt fields
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = TasksChecked;
