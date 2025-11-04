const db = require('../db/active');
const { User, Playlist } = db.models;
const auth = require('../auth')
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        });
    }

    try {
        const playlist = await db.create(Playlist, body);
        console.log("playlist: " + playlist.toString());

        const user = await db.findOne(User, { _id: req.userId });
        console.log("user found: " + JSON.stringify(user));

        user.playlists.push(playlist._id);
        await db.update(User, { _id: req.userId }, { playlists: user.playlists });

        return res.status(201).json({
            playlist: playlist
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        });
    }
};
deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    console.log("delete " + req.params.id);
    db.findOne(Playlist, { _id: req.params.id })
        .then((playlist) => {
            console.log("playlist found: " + JSON.stringify(playlist));

            // DOES THIS LIST BELONG TO THIS USER?
            async function asyncFindUser(list) {
                db.findOne(User, { email: list.ownerEmail })
                    .then((user) => {
                        console.log("user._id: " + user._id);
                        console.log("req.userId: " + req.userId);
                        if (user._id == req.userId) {
                            console.log("correct user!");
                            db.deleteOne(Playlist, { _id: req.params.id })
                                .then(() => {
                                    return res.status(200).json({});
                                })
                                .catch(err => console.log(err))
                        }
                        else {
                            console.log("incorrect user!");
                            return res.status(400).json({ 
                                errorMessage: "authentication error" 
                            });
                        }
                    });
            }
            asyncFindUser(playlist);
        })
        .catch((err) => {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            })
        })
}
getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    db.findOne(Playlist, { _id: req.params.id })
        .then((list) => {
            console.log("Found list: " + JSON.stringify(list));

            // DOES THIS LIST BELONG TO THIS USER?
            async function asyncFindUser(list) {
                db.findOne(User, { email: list.ownerEmail })
                    .then((user) => {
                        console.log("user._id: " + user._id);
                        console.log("req.userId: " + req.userId);
                        if (user._id == req.userId) {
                            console.log("correct user!");
                            return res.status(200).json({ success: true, playlist: list })
                        }
                        else {
                            console.log("incorrect user!");
                            return res.status(400).json({ success: false, description: "authentication error" });
                        }
                    });
            }
            asyncFindUser(list);
        })
        .catch(err => {
            return res.status(400).json({ success: false, error: err });
        })
}
getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");
    db.findOne(User, { _id: req.userId })
        .then((user) => {
            console.log("find user with id " + req.userId);
            async function asyncFindList(email) {
                console.log("find all Playlists owned by " + email);
                db.read(Playlist, { ownerEmail: email })
                    .then((playlists) => {
                        console.log("found Playlists: " + JSON.stringify(playlists));
                        if (!playlists) {
                            console.log("!playlists.length");
                            return res
                                .status(404)
                                .json({ success: false, error: 'Playlists not found' })
                        }
                        else {
                            console.log("Send the Playlist pairs");
                            // PUT ALL THE LISTS INTO ID, NAME PAIRS
                            let pairs = [];
                            for (let key in playlists) {
                                let list = playlists[key];
                                let pair = {
                                    _id: list._id,
                                    name: list.name
                                };
                                pairs.push(pair);
                            }
                            return res.status(200).json({ success: true, idNamePairs: pairs })
                        }
                    })
                    .catch(err => console.log(err))
            }
            asyncFindList(user.email);
        })
        .catch(err => console.log(err))
}
getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    db.read(Playlist, {})
        .then((playlists) => {
            if (!playlists.length) {
                return res
                    .status(404)
                    .json({ success: false, error: `Playlists not found` })
            }
            return res.status(200).json({ success: true, data: playlists })
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
}
updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    db.findOne(Playlist, { _id: req.params.id })
        .then((playlist) => {
            console.log("playlist found: " + JSON.stringify(playlist));
            if (!playlist) {
                return res.status(404).json({
                    message: 'Playlist not found!',
                })
            }

            // DOES THIS LIST BELONG TO THIS USER?
            async function asyncFindUser(list) {
                db.findOne(User, { email: list.ownerEmail })
                    .then((user) => {
                        console.log("user._id: " + user._id);
                        console.log("req.userId: " + req.userId);
                        if (user._id == req.userId) {
                            console.log("correct user!");
                            console.log("req.body.name: " + req.body.name);

                            list.name = body.playlist.name;
                            list.songs = body.playlist.songs;

                            db.update(Playlist, { _id: req.params.id }, { name: list.name, songs: list.songs })
                                .then(() => {
                                    console.log("SUCCESS!!!");
                                    return res.status(200).json({
                                        success: true,
                                        id: list._id,
                                        message: 'Playlist updated!',
                                    })
                                })
                                .catch(error => {
                                    console.log("FAILURE: " + JSON.stringify(error));
                                    return res.status(404).json({
                                        error,
                                        message: 'Playlist not updated!',
                                    })
                                })
                        }
                        else {
                            console.log("incorrect user!");
                            return res.status(400).json({ success: false, description: "authentication error" });
                        }
                    });
            }
            asyncFindUser(playlist);
        })
        .catch((err) => {
            return res.status(404).json({
                err,
                message: 'Playlist not found!',
            })
        })
}
module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}