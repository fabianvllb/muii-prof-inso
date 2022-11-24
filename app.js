// 1. handle development vs production environment
if (process.env.NODE_ENV === "production") {
    console.log("We are in production.");
} else {
    console.log("We are in development.");
}

// 2. load environment variables (think of internal passwords)
const sessionSecret = process.env.SESSION_SECRET;
const minPwdLength = process.env.MIN_PASSWORD_LENGTH;
const maxPwdLength = process.env.MAX_PASSWORD_LENGTH;
const dbModelName = process.env.DB_MODEL_NAME;
const mongoDBURI = process.env.MONGODB_URI;

// 3. import dependencies
import express from "express";
import helmet from "helmet";
import express_logger from "express-logger-unique-req-id";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import session from "express-session";
import validator from "email-validator";
import assert from "assert";

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
express_logger.initializeLogger(app);
const logger = express_logger.getLogger();

console.log(mongoDBURI);
console.log(dbModelName);
console.log(mongoDBURI != undefined);
console.log(dbModelName != undefined);

// 5. set up and connect to database
mongoose.set("sanitizeFilter", true);
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: String,
    password: String,
});
const User = mongoose.model(dbModelName, userSchema);
mongoose.connect(mongoDBURI).then(
    () => {
      console.log("We are connected to MongoDB.");
    },
    (err) => {
        console.log("We could not connect to MongoDB: " + err.message);
    }
);

// 6. handle debug logs
function debugLog(origin, userAgent, eventMsg) {
    logger.debug("\nOrigin: " + origin +
                 "\nUserAgent: " + userAgent +
                 "\nEvent: " + eventMsg);
}

// 7. verify password constraints
function checkValidPassword(pwd) {
    try {
        return (typeof pwd === 'string' || pwd instanceof String) && minPwdLength <= pwd.length && pwd.length <= maxPwdLength
    }
    catch (err) {
        return false
    }
}

// 8. handle authentication (login && access permissions)
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
                debugLog("", "", "Login error: " + email + " not found.");
                return done(null, false);
            }
            else {
                debugLog("", "", "Login. Email belongs to user: " + existingUser);
                let hashedPassword = existingUser.password;
                bcrypt.compare(password, hashedPassword, (err, isSamePassword) => {
                    if (err) {
                        debugLog("", "", "Login error: Bcrypt compare error: " + err.message);
                        return done(null, false);
                    } else {
                        if (isSamePassword) {
                            debugLog("", "", "Login: User exists, passwords match. Success!");
                            return done(null, existingUser);
                        } else {
                            debugLog("", "", "Login error: Passwords do not match.");
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
    const origin = req.headers["origin"];
    const userAgent = req.headers["user-agent"];
    try {
        assert(Object.keys(req.body).length > 0);
        const { email, password } = req.body;
        //debugLog(origin, userAgent, "Login request:" + "\nEmail: " + email + "\nPassword: " + password);
        let errors = {};
        let errorsFound = false;
        if (!validator.validate(email)) {
            debugLog(origin, userAgent, "Login error. Invalid email: " + email);
            Object.assign(errors, { emailError:
                "Please, enter a valid email",
            });
            errorsFound = true;
        }
        if (!checkValidPassword(password)) {
            debugLog(origin, userAgent, "Login error. Invalid password.");
            Object.assign(errors, {
              passwordError: "Please, enter a valid password",
            });
            errorsFound = true;
        }
        if (errorsFound) {
            res.send({ errors: errors });
        } else {
            debugLog(origin, userAgent, "Pre-login checks passed. Attempting login...");
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
        debugLog(origin, userAgent, "Login error: " + err.message);
        res.send({ errors: { generalError: "Please, try again." } });
    }
})
app.get("/", forwardAuthenticated, (req, res) => {
    res.render("auth.ejs");
});

// 9. handle register
app.post("/register", (req, res) => {
    const origin = req.headers["origin"];
    const userAgent = req.headers["user-agent"];
    try {
        assert(Object.keys(req.body).length > 0);
        const { email, password } = req.body;
        //debugLog(origin, userAgent, "Register request:" + "\nEmail: " + email + "\nPassword: " + password);
        let errors = {};
        let errorsFound = false;
        if (!validator.validate(email)) {
            debugLog(origin, userAgent, "Register error. Invalid email: " + email);
            Object.assign(errors, {
                emailError: "Please, enter a valid email",
            });
            errorsFound = true;
        }
        if (!checkValidPassword(password)) {
            debugLog(origin, userAgent, "Register error. Invalid password.");
            Object.assign(errors, {
              passwordError: "Please, enter a valid password",
            });
            errorsFound = true;
        }
        if (errorsFound) {
            res.send({ errors: errors });
        } else {
            debugLog(origin, userAgent, "Pre-register checks passed. Attempting registration...");
            User.findOne({ email: email }).then((user) => {
                if (user) {
                    debugLog(origin, userAgent, "Register error. Email already in use.");
                    Object.assign(errors, {
                        emailAlreadyInUseError: "Please, use a unique email",
                    });
                    res.send({ errors: errors });
                }
                else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            debugLog(origin, userAgent, "Register error. Salting error: " + err.message);
                            throw err;
                        }
                        else {
                            bcrypt.hash(password, salt, (err, hashedPassword) => {
                                if (err) {
                                    debugLog(origin, userAgent, "Register error. Hashing error: " + err.message);
                                    throw err;
                                }
                                else {
                                    new User({
                                        email: email,
                                        password: hashedPassword,
                                    })
                                    .save()
                                    .then((user) => {
                                        debugLog(origin, userAgent, "Register success. New user added.");
                                        res.send({ success: {} });
                                    })
                                    .catch((err) => {
                                        debugLog(origin, userAgent, "Register error. Error adding user: " + err.message);
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
        debugLog(origin, userAgent, "Register error: " + err.message);
        res.send({ errors: { generalError: "Please, try again." } });
    }
});

// 10. handle logout
app.post("/logout", (req, res, next) => {
    const origin = req.headers["origin"];
    const userAgent = req.headers["user-agent"];
    debugLog(origin, userAgent, "Logout request.")
    req.session.user = null;
    req.session.save(function (err) {
        if (err) next(err)
        req.session.regenerate(function (err) {
            if (err) next(err)
            res.send({});
            // res.redirect("/");
        });
    });
});

// 11. handle user
app.get("/user", preventNotAuthenticated, (req, res) => {
    res.render("user.ejs");
});

// 12. export
export { app, mongoose, User };