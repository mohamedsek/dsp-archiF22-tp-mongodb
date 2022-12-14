
const port = 3000
const argon2 = require('argon2');
const mongoose = require('mongoose');
const { User } = require("./model/User");

const express = require('express')
const app = express()

var jwt = require('jsonwebtoken');

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {

    const body = req.body

    if (body.email.length <= 1)
        return res.status(401).json({
            error: true,
            message: "email non renseigne"
        })

    if (body.password.length <= 1)
        return res.status(401).json({
            error: true,
            message: "password non renseigne"
        })

    const user = await User.findOne({ email: body.email })

    if (!user) {
        return res.status(200).json({
            error: false,
            message: "email non-existant"
        })
    }

    const password = await argon2.verify(user.password, body.password)

    if (!password) {
        return res.status(200).json({
            error: false,
            message: "wrong password"
        })
    }
    const token = await jwt.sign({ email: user.email }, 'mySecret');
    return res
        .cookie("token", token, {
            httpOnly: true
        })
        .status(200).json({
            email: user.email,
            lastname: user.lastname,
            firstname: user.firstname,
            phone: user.phone
        })


})

app.post('/api/auth/register', async (req, res) => {

    const body = req.body;

    if (body.firstname.length <= 1)
        return res.status(401).json({
            error: true,
            message: "firstname incorrect"
        })

    if (body.lastname.length <= 1)
        return res.status(401).json({
            error: true,
            message: "lastname incorrect"
        })

    if (body.email.length <= 1)
        return res.status(401).json({
            error: true,
            message: "email incorrect"
        })

    if (body.phone.length <= 1)
        return res.status(401).json({
            error: true,
            message: "phone incorrect"
        })

    if (body.password.length <= 1)
        return res.status(401).json({
            error: true,
            message: "password incorrect"
        })


    if (body.password != body.confirmpassword)
        return res.status(401).json({
            error: true,
            message: "password confirmation is incorrect"
        })

    const hashpassword = await argon2.hash(body.password);

    const user = await new User({
        lastname: body.lastname,
        firstname: body.firstname,
        email: body.email,
        phone: body.phone,
        password: hashpassword
    })

    // v??rifier si l'utilisateur existe d??j??
    const userexist = await User.exists({ email: body.email })

    if (userexist)
        return res.status(401).json({
            message: "user already exist"
        })

    // enregistrer l'utilisateur

    await user.save()

    return res.status(200).json({
        email: user.email,
        lastname: user.lastname,
        firstname: user.firstname,
        phone: user.phone,
        message: "Cr??ation du compte r??ussi !"
    })

})

app.get('/api/user/profile', async (req, res) => {

    const body = req.body
    const token = req.cookies.token

    console.log(token)

    if (!token) {
        return res.status(403);
    }
    // recuperer l'email de l'utilisateur depuis le token
    try {
        const data = jwt.verify(token, "mySecret");

        usermail = data.email;
        console.log(usermail)
    } catch {
        return res.status(403);
    }

    // verifier si l'email stock?? en token existe
    const userexist = await User.exists({ email: usermail })

    if (!userexist)
        return res.status(401).json({
            error: true,
            message: "veuillez vous reconnecter"
        })

    const user = await User.findOne({ email: usermail })
    // afficher les infos de l'utilisateur
    return res
        .status(200).json({
            email: user.email,
            lastname: user.lastname,
            firstname: user.firstname,
            phone: user.phone
        })

})

app.put('/api/user/edit', async (req, res) => {

    const body = req.body
    const token = req.cookies.token

    if (!token) {
        return res.status(403);
    }
    // recuperer l'email de l'utilisateur depuis le token
    try {
        const data = jwt.verify(token, "mySecret");
        usermail = data.email;
    } catch {
        return res.status(403);
    }

    // verifier si l'email stock?? en token existe
    const userexist = await User.exists({ email: usermail })

    if (!userexist)
        return res.status(401).json({
            error: true,
            message: "veuillez vous reconnecter"
        })
    // verifier le nom et prenom saisie par l'utilisateur

    if (body.firstname.length <= 1)
        return res.status(401).json({
            error: true,
            message: "firstname incorrect"
        })

    if (body.lastname.length <= 1)
        return res.status(401).json({
            error: true,
            message: "lastname incorrect"
        })
    // changer les informations utilisateurs dans la BD

    const user = await User.findOne({ email: usermail })
    filter = { email: usermail }
    update = { lastname: body.lastname, firstname: body.firstname }
    const newuser = await User.findOneAndUpdate(filter, update, {
        new: true
    });

    return res
        .status(201)
        .json({
            email: newuser.email,
            lastname: newuser.lastname,
            firstname: newuser.firstname,
            phone: newuser.phone,
            message: "Modification du compte r??ussie !"
        })

})

app.put('/api/user/edit-password', async (req, res) => {

    const body = req.body
    const token = req.cookies.token

    if (!token) {
        return res.status(403);
    }
    // recuperer l'email de l'utilisateur depuis le token
    try {
        const data = jwt.verify(token, "mySecret");
        usermail = data.email;
    } catch {
        return res.status(403);
    }

    // verifier si l'email stock?? en token existe
    const userexist = await User.exists({ email: usermail })

    if (!userexist)
        return res.status(401).json({
            error: true,
            message: "veuillez vous reconnecter"
        })

    // verifier le password saisie par l'utilisateur

    if (body.password.length <= 1)
        return res.status(401).json({
            error: true,
            message: "password incorrect"
        })


    if (body.password != body.confirmpassword)
        return res.status(401).json({
            error: true,
            message: "password confirmation is incorrect"
        })

    // 
    const hashpassword = await argon2.hash(body.password);


    // changer les informations utilisateurs dans la BD
    filter = { email: usermail }
    update = { password: hashpassword }

    const user = await User.findOne({ email: usermail })
    newuser = await User.findOneAndUpdate(filter, update, {
        new: true
    });

    return res.status(201).json({
        message: "Mot de passe modifi?? !"
    })


})

app.put('/api/user/edit-phone', async (req, res) => {

    const body = req.body
    const token = req.cookies.token

    if (!token) {
        return res.status(403);
    }
    // recuperer l'email de l'utilisateur depuis le token
    try {
        const data = jwt.verify(token, "mySecret");
        usermail = data.email;
    } catch {
        return res.status(403);
    }

    // verifier si l'email stock?? en token existe
    const userexist = await User.exists({ email: usermail })

    if (!userexist)
        return res.status(401).json({
            error: true,
            message: "veuillez vous reconnecter"
        })

    // verifier le telephone saisie par l'utilisateur

    if (body.phone.length <= 1)
        return res.status(401).json({
            error: true,
            message: "phone incorrect"
        })

    // changer les informations utilisateurs dans la BD

    const user = await User.findOne({ email: usermail })
    filter = { email: usermail }
    update = { phone: body.phone }

    const newuser = await User.findOneAndUpdate(filter, update, {
        new: true
    });

    return res
        .status(201)
        .json({
            message: "Num??ro de t??l??phone modifi?? !"
        })

})

app.put('/api/user/edit-email', async (req, res) => {

    const body = req.body
    const token = req.cookies.token

    if (!token) {
        return res.status(403);
    }
    // recuperer l'email de l'utilisateur depuis le token
    try {
        const data = jwt.verify(token, "mySecret");
        usermail = data.email;
    } catch {
        return res.status(403);
    }

    // verifier si l'email stock?? en token existe
    const userexist = await User.exists({ email: usermail })

    if (!userexist)
        return res.status(401).json({
            error: true,
            message: "veuillez vous reconnecter"
        })



    // verifier l'email saisie par l'utilisateur

    if (body.email.length <= 1)
        return res.status(401).json({
            error: true,
            message: "email incorrect"
        })

    // changer les informations utilisateurs dans la BD

    const user = await User.findOne({ email: usermail })
    filter = { email: usermail }
    update = { email: body.email }
    const newuser = await User.findOneAndUpdate(filter, update, {
        new: true
    });

    const newtoken = await jwt.sign({ email: newuser.email }, 'mySecret');
    return res
        .cookie("token", newtoken, {
            httpOnly: true
        })
        .status(200).json({
            message: "Email modifi?? !"
        })
})

app.delete('/api/user/delete', async (req, res) => {

    const body = req.body
    const token = req.cookies.token

    if (!token) {
        return res.status(403);
    }
    // recuperer l'email de l'utilisateur depuis le token
    try {
        const data = jwt.verify(token, "mySecret");
        usermail = data.email;
    } catch {
        return res.status(403);
    }

     // verifier si l'email stock?? en token existe
     const userexist = await User.exists({ email: usermail })

     if (!userexist)
         return res.status(401).json({
             error: true,
             message: "veuillez vous reconnecter"
         })

    // chercher et supprimer l'utilisateur de la BD
    const newuser = await User.findOneAndDelete({ email: usermail });

    return res
        .status(200)
        .clearCookie("token")  // supprimer le token stock?? en cookie
        .json({
            message: "Votre profil a ??t?? supprim?? ! Un email de confirmation de suppression vous a ??t?? envoy??"
        })

})

const start = async () => {
    try {
        const mongo = await mongoose.connect(
            "mongodb://127.0.0.1:27017/myappdb"
        ).catch(error => console.error(err.reason));
        console.log(mongo)
        app.listen(port, () => console.log("Server started on port 3000"));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();