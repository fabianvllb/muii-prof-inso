// 1. development vs production environment
if (process.env.NODE_ENV === "production") {
    console.log("We are in production.");
} else {
    console.log("We are in development (localhost).");
}

// 2. load environment variables
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
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import validator from "email-validator";
import assert from "assert";
import { default as connectMongoDBSession } from 'connect-mongodb-session';

// 4. configure app
const app = express();
app.enable("trust proxy");
app.set("view engine", "ejs");
app.use(helmet());
app.use(express.json());
app.use(express.static("public"));
const MongoDBStore = connectMongoDBSession(session);
var store = new MongoDBStore({
    uri: mongoDBURI,
    collection: "mySessions"
});
store.on("error", (error) => {
    console.log("MongoDBStore error: ", error);
});
app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { sameSite: true },
    store: store
})); // --forceExit in package.json test script
// https://stackoverflow.com/questions/72896114/jest-doesnt-terminate-if-there-is-any-store-is-created-with-mongodb-even-if-its
// "Jest doesn't terminate if there is any store created with mongodb even if it's not used.
// I have spent days on it without any progress except --forceExit on Jest.
// As far as I understand, sessions are handled by superagent within supertest, 
// so as a solution I just removed connect-mongo from test environment since its not used.
// By the way I have also tried with connect-mongodb-session instead of connect-mongo and it didnt help."
// -> This would be another option.
app.use(passport.initialize());
app.use(passport.session());
express_logger.initializeLogger(app);
const logger = express_logger.getLogger();

// 5. set up and connect to database
mongoose.set("sanitizeFilter", true);
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: String,
    password: String,
    subscriptionList: [String],
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
const debugLog = (origin, userAgent, eventMsg) => {
    logger.debug("\nOrigin: " + origin +
                 "\nUserAgent: " + userAgent +
                 "\nEvent: " + eventMsg);
}

// 7. verify password constraints
const checkValidPassword = (pwd) => {
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
const forwardAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/user");
    } else {
        return next();
    }
}
const preventNotAuthenticated = (req, res, next) => {
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
            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    debugLog(origin, userAgent, "Login error: passport.authenticate: " + err.message);
                    res.send({ errors: { generalError: "Please, try again." } });
                } else if (!user) {
                    Object.assign(errors, {
                        emailPassCombinationError: "Please, enter valid credentials",
                  });
                  res.send({ errors: errors });
                } else {
                    req.logIn(user, (err) => {
                        if (err) {
                            debugLog(origin, userAgent, "Login error: req.login: " + err.message);
                            res.send({ errors: { generalError: "Please, try again." } });
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
                            res.send({ errors: { generalError: "Please, try again." } });
                        }
                        else {
                            bcrypt.hash(password, salt, (err, hashedPassword) => {
                                if (err) {
                                    debugLog(origin, userAgent, "Register error. Hashing error: " + err.message);
                                    res.send({ errors: { generalError: "Please, try again." } });
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
                                        res.send({ errors: { generalError: "Please, try again." } });
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
    req.session.save((err) => {
        if (err) next(err)
        req.session.regenerate((err) => {
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

// -----------------------------------------------------------------------------
// Subscripción a páginas de interés (TAIGA-EPIC #7)

//Send subscribed pages list data for rendering
app.get("/feed", preventNotAuthenticated, (req, res) => {
  const origin = req.headers["origin"];
  const userAgent = req.headers["user-agent"];
  let subscribedPagesData;
  User.findOne({ email: req.user.email }).then((existingUser) => {
    if (!existingUser) {
      debugLog("", "", "Feed error: " + email + " not found.");
      return res.send({ errors: { generalError: "Couldn't find user, please try again." } });;
    }
    for(page in subscriptionList){
      Page.findOne({ pageId: page.id}).then((subscribedPage) => {
        subscribedPagesData.push(subscribedPage);
      });
    }
    res.send({ subscribedPagesData: subscribedPagesData });
  });
});

//Subscribe to new page
app.post("/subscribe", (req, res) => {
  const origin = req.headers["origin"];
  const userAgent = req.headers["user-agent"];
  const pageURL = req.body.pageURL;
  User.findOne({ email: req.user.email }).then((err, existingUser) => {
    if (!existingUser) {
      debugLog("", "", "Subscribe error: " + req.user.email + " not found.");
      return res.send({ errors: { generalError: "Couldn't subscribe, please try again." } });;
    }
    existingUser.subscriptionList.push(pageURL);
    res.send({ success: {} });
  });
});

// 12. export
export { app, mongoose, User };