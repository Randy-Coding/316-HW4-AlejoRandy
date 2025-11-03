const { DataTypes } = require('sequelize')
const { sequelize } = require('../../db/postgre/index')

const User = sequelize.define('User', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    playlists: { type: DataTypes.JSON }
}, { timestamps: true })

module.exports = User
