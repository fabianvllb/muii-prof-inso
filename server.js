// 1. handle development vs production environment
if (process.env.NODE_ENV === "production") {
    console.log("We are in production (live website accessible to everyone).");
} else {
    console.log("We are in development (local website on personal computer).");
    require("dotenv").config();
}

// 2. load environment variables (think of internal passwords)
const sessionSecret = process.env.SESSION_SECRET;
const mongoDBURI = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

// 3. require dependencies
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const validator = require("email-validator");

// 4. configure app
const app = express();
app.enable("trust proxy");
app.set("view engine", "ejs");
app.use(helmet());
app.use(express.json());
app.use(express.static("public"));
app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { sameSite: true }
}))
app.use(passport.initialize());
app.use(passport.session());

// 5. set up and connect to database
mongoose.set("sanitizeFilter", true);
mongoose.connect(mongoDBURI).then(
    () => {
      console.log("We are connected to MongoDB.");
    },
    (err) => {
      console.log("We could not connect to MongoDB: " + err.message);
    }
);
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: String,
    password: String,
});
const User = mongoose.model("user", userSchema);

// 6. handle authentication (login && access permissions)
passport.serializeUser((user, done) => {
    return done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
passport.use(
    new LocalStrategy({ usernameField: "email"}, (email, password, done) => {
        User.findOne({ email: email }).then((existingUser) => {
            if (!existingUser) {
                console.log("Login error: " + email + " not found.")
                return done(null, false);
            }
            else {
                console.log("Login. Email does belong to a user: " + existingUser);
                let hashedPassword = existingUser.password;
                bcrypt.compare(password, hashedPassword, (err, isSamePassword) => {
                    if (err) {
                        console.log("Login error: " + err.message);
                        return done(null, false);
                    } else {
                        if (isSamePassword) {
                            console.log("Login. User exists, passwords match. Success!");
                            return done(null, existingUser);
                        } else {
                            console.log("Login error. Passwords do not match.");
                            return done(null, false);
                        }
                    }
                });
            }
        })
    })
);
function forwardAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/user");
    } else {
        return next();
    }
}
function preventNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/");
    }
}
app.post("/login", (req, res, next) => {
    try {
        const { email, password } = req.body;
        // console.log(
        //     "\nLogin request:" + "\nEmail: " + email + "\nPassword: " + password
        // );
        let errors = {};
        let errorsFound = false;
        if (!validator.validate(email)) {
            console.log("Login error. Invalid email: " + email);
            Object.assign(errors, { emailError: "Please, enter a valid email" });
            errorsFound = true;
        }
        if (password.length == 0) {
            console.log("Login error. Zero-length password.");
            Object.assign(errors, {
              passwordError: "Please, enter a password",
            });
            errorsFound = true;
        }
        if (errorsFound) {
            res.send({ errors: errors });
        } else {
            let redirectRoute = "/user";
            passport.authenticate("local", function (err, user, info) {
                if (err) {
                    throw err;
                } else if (!user) {
                    Object.assign(errors, {
                        emailPassCombinationError: "Please, enter valid credentials",
                  });
                  res.send({ errors: errors });
                } else {
                    req.logIn(user, function (err) {
                        if (err) {
                            throw err;
                        } else {
                            res.send({ success: { redirectRoute: redirectRoute } });
                        }
                  });
                }
            })(req, res, next);
        }
    }
    catch (err) {
        console.log("Login error: " + err.message);
        res.send({ errors: { generalError: "Please, try again." } });
    }
})
app.get("/", forwardAuthenticated, (req, res) => {
    res.render("auth.ejs");
});

// 7. handle register
app.post("/register", (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(
        //     "\Register request:" + "\nEmail: " + email + "\nPassword: " + password
        // );
        let errors = {};
        let errorsFound = false;
        if (!validator.validate(email)) {
            console.log("Register error. Invalid email: " + email);
            Object.assign(errors, { emailError: "Please, enter a valid email" });
            errorsFound = true;
        }
        if (password.length == 0) {
            console.log("Register error. Zero-length password.");
            Object.assign(errors, {
              passwordError: "Please, enter a password",
            });
            errorsFound = true;
        }
        if (errorsFound) {
            res.send({ errors: errors });
        } else {
            User.findOne({ email: email }).then((user) => {
                if (user) {
                    console.log("Register error. Email already in use.");
                    Object.assign(errors, {
                        emailAlreadyInUseError: "Please, use a unique email",
                    });
                    res.send({ errors: errors });
                }
                else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            console.log("Register error. Salting error: " + err.message);
                            throw err;
                        }
                        else {
                            bcrypt.hash(password, salt, (err, hashedPassword) => {
                                if (err) {
                                    console.log(
                                        "Register error. Hashing error: " + err.message
                                    );
                                    throw err;
                                }
                                else {
                                    new User({
                                        email: email,
                                        password: hashedPassword,
                                    })
                                    .save()
                                    .then((user) => {
                                        console.log(
                                            "Register success. New user added: " +
                                            user
                                        );
                                        res.send({ success: {} });
                                    })
                                    .catch((err) => {
                                        console.log(
                                            "Register error. Error adding user: " + err.message
                                        );
                                        throw err;
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }
    catch (err) {
        console.log("Register error: " + err.message);
        res.send({ errors: { generalError: "Please, try again." } });
    }
});

// 8. handle logout
app.post("/logout", (req, res, next) => {
    console.log("\nLogout request.")
    req.session.user = null
    req.session.save(function (err) {
        if (err) next(err)
        req.session.regenerate(function (err) {
            if (err) next(err)
            res.send({});
            // res.redirect("/");
        })
    })
});

// 9. handle user
app.get("/user", preventNotAuthenticated, (req, res) => {
    res.render("user.ejs");
});

// 10. listen
app.listen(port);