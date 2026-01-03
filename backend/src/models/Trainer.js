import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Trainer = sequelize.define('Trainer', {
  trainer_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    // references: { model: User, key: 'user_id' }
  },
  organization_name: {
    type: DataTypes.STRING(200)
  },
  contact_info: {
    type: DataTypes.TEXT
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'trainers',
  timestamps: false
});

export default Trainer;
