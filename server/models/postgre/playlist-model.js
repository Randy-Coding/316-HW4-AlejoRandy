const { DataTypes } = require('sequelize')
const { sequelize } = require('../../db/postgre/index')

const Playlist = sequelize.define('Playlist', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    songs: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    timestamps: true
})

module.exports = Playlist