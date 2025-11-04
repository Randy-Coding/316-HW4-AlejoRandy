const auth = require('../auth')
const db = require('../db/active');
const { User, Playlist } = db.models;
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await db.findOne(User, { id: userId });
        console.log("loggedInUser: " + loggedInUser);

        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                email: loggedInUser.email
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const msg = "Please enter all required fields.";
            return res
                .status(400)
                .json({ success: false, errorMessage: msg, message: msg });
        }

        const existingUser = await db.findOne(User, { email: email });
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            const msg = "Wrong email or password provided.";
            return res
                .status(401)
                .json({ success: false, errorMessage: msg, message: msg });
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            const msg = "Wrong email or password provided.";
            return res
                .status(401)
                .json({ success: false, errorMessage: msg, message: msg });
        }

        // LOGIN THE USER
        const token = auth.signToken(existingUser.id || existingUser._id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email
            }
        });
    } catch (err) {
        console.error(err);
        const msg = "An internal server error occurred while trying to log you in.";
        res.status(500).json({ success: false, errorMessage: msg, message: msg });
    }
};

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { firstName, lastName, email, password, passwordVerify } = req.body;
        console.log(`create user: ${firstName} ${lastName} ${email} ${password} ${passwordVerify}`);

        if (!firstName || !lastName || !email || !password || !passwordVerify) {
            return res.status(400).json({ errorMessage: "Please enter all required fields." });
        }

        if (password.length < 8) {
            return res.status(400).json({ errorMessage: "Please enter a password of at least 8 characters." });
        }

        if (password !== passwordVerify) {
            return res.status(400).json({ errorMessage: "Please enter the same password twice." });
        }

        const existingUser = await db.findOne(User, { email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                errorMessage: "An account with this email address already exists."
            });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUserData = { firstName, lastName, email, passwordHash };
        const savedUser = await db.create(User, newUserData);

        const token = auth.signToken(savedUser.id || savedUser._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}