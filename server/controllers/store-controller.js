const { db, models } = require('../db/active');
const { User } = models;
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
    try {
        const playlist = await db.findOne(Playlist, { _id: req.params.id });
        console.log("playlist found: " + JSON.stringify(playlist));

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await db.findOne(User, { email: playlist.ownerEmail });
        console.log("user._id: " + user._id);
        console.log("req.userId: " + req.userId);
        if (user._id == req.userId) {
            console.log("correct user!");
            await db.deleteOne(Playlist, { _id: req.params.id });
            return res.status(200).json({});
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ 
                errorMessage: "authentication error" 
            });
        }
    } catch (err) {
        return res.status(404).json({
            errorMessage: 'Playlist not found!',
        })
    }
}
getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const list = await db.findOne(Playlist, { _id: req.params.id });
        console.log("Found list: " + JSON.stringify(list));

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await db.findOne(User, { email: list.ownerEmail });
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
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
}
getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");
    try {
        const user = await db.findOne(User, { _id: req.userId });
        console.log("find user with id " + req.userId);
        async function asyncFindList(email) {
            try {
                const playlists = await db.read(Playlist, { ownerEmail: email });
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
            } catch (err) {
                return res.status(400).json({ success: false, error: err })
            }
        }
        asyncFindList(user.email);
    } catch (err) {
        console.log(err);
    }
}
getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    try {
        const playlists = await db.read(Playlist, {});
        if (!playlists.length) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` })
        }
        return res.status(200).json({ success: true, data: playlists })
    } catch (err) {
        return res.status(400).json({ success: false, error: err })
    }
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

    try {
        const playlist = await db.findOne(Playlist, { _id: req.params.id });
        console.log("playlist found: " + JSON.stringify(playlist));

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await db.findOne(User, { email: playlist.ownerEmail });
        console.log("user._id: " + user._id);
        console.log("req.userId: " + req.userId);
        if (user._id == req.userId) {
            console.log("correct user!");
            console.log("req.body.name: " + req.body.name);

            playlist.name = body.playlist.name;
            playlist.songs = body.playlist.songs;
            try {
                await db.update(Playlist, { _id: req.params.id }, { name: playlist.name, songs: playlist.songs });
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    id: playlist._id,
                    message: 'Playlist updated!',
                })
            } catch (error) {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    message: 'Playlist not updated!',
                })
            }
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
    } catch (err) {
        return res.status(404).json({
            err,
            message: 'Playlist not found!',
        })
    }
}
module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}