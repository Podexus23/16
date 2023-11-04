import {sign as $2vEDu$sign, verify as $2vEDu$verify} from "jsonwebtoken";
import {promisify as $2vEDu$promisify} from "util";
import {createHash as $2vEDu$createHash, randomBytes as $2vEDu$randomBytes} from "crypto";
import {Schema as $2vEDu$Schema, model as $2vEDu$model} from "mongoose";
import {isEmail as $2vEDu$isEmail} from "validator";
import {hash as $2vEDu$hash, compare as $2vEDu$compare} from "bcryptjs";
import {createTransport as $2vEDu$createTransport} from "nodemailer";

/* eslint-disable */ // import '@babel/polyfill';
// import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies



var $dbc7137b80dd09a6$exports = {};




const $dbc7137b80dd09a6$var$userSchema = new $2vEDu$Schema({
    name: {
        type: String,
        required: [
            true,
            "Please tell us your name!"
        ],
        trim: true
    },
    email: {
        type: String,
        required: [
            true,
            "Please provide us your email."
        ],
        unique: true,
        lowercase: true,
        validate: [
            $2vEDu$isEmail,
            "Please provide a valid email"
        ]
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: [
            "user",
            "guide",
            "lead-guide",
            "admin"
        ],
        default: "user"
    },
    password: {
        type: String,
        required: [
            true,
            "Please provide a password"
        ],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [
            true,
            "Please confirm your password"
        ],
        validate: {
            //this works only on SAVE!
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
$dbc7137b80dd09a6$var$userSchema.pre("save", async function(next) {
    // Only run this function was actually modified
    if (!this.isModified("password")) return next();
    // Hash the password with cost of 12
    this.password = await $2vEDu$hash(this.password, 12);
    // Delete the password confirm field
    this.passwordConfirm = undefined;
    next();
});
$dbc7137b80dd09a6$var$userSchema.pre("save", function(next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
$dbc7137b80dd09a6$var$userSchema.pre(/^find/, function(next) {
    //this points to the current query
    this.find({
        active: {
            $ne: false
        }
    });
    next();
});
$dbc7137b80dd09a6$var$userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // false means not changed
    return false;
};
$dbc7137b80dd09a6$var$userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await $2vEDu$compare(candidatePassword, userPassword);
};
$dbc7137b80dd09a6$var$userSchema.methods.createPasswordResetToken = function() {
    const resetToken = $2vEDu$randomBytes(32).toString("hex");
    this.passwordResetToken = $2vEDu$createHash("sha256").update(resetToken).digest("hex");
    console.log({
        resetToken: resetToken
    }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 600000;
    return resetToken;
};
const $dbc7137b80dd09a6$var$User = $2vEDu$model("User", $dbc7137b80dd09a6$var$userSchema);
$dbc7137b80dd09a6$exports = $dbc7137b80dd09a6$var$User;


var $cfc92fb11915fb47$export$2e2bcd8739ae039 = (fn)=>{
    return (req, res, next)=>{
        fn(req, res, next).catch(next);
    };
};


class $f3fc1744dc11d301$var$AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
var $f3fc1744dc11d301$export$2e2bcd8739ae039 = $f3fc1744dc11d301$var$AppError;


// eslint-disable-next-line import/no-extraneous-dependencies

async function $56fc02e50949a2f0$export$1cea2e25b75a88f2(option) {
    // 1) create a transporter
    const transporter = (0, $2vEDu$createTransport)({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // 2) define the email options
    const mailOptions = {
        from: "Podexus23 <santon23@gmail.com>",
        to: option.email,
        subject: option.subject,
        text: option.message
    };
    // 3) actually end the email
    await transporter.sendMail(mailOptions);
}


const $5c02e39dfc585c40$var$signToken = (id)=>(0, $2vEDu$sign)({
        id: id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
const $5c02e39dfc585c40$var$createSendToken = (user, statusCode, res)=>{
    const token = $5c02e39dfc585c40$var$signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 86400000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token: token,
        data: {
            user: user
        }
    });
};
const $5c02e39dfc585c40$export$7200a869094fec36 = (0, $cfc92fb11915fb47$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const newUser = await (0, $dbc7137b80dd09a6$exports.create)({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });
    $5c02e39dfc585c40$var$createSendToken(newUser, 201, res);
});
const $5c02e39dfc585c40$export$596d806903d1f59e = (0, $cfc92fb11915fb47$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const { email: email, password: password } = req.body;
    // 1) check if email and password exist
    if (!email || !password) next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("please provide email and password", 400));
    // 2) check if user exists & password is correct
    const user = await (0, $dbc7137b80dd09a6$exports.findOne)({
        email: email
    }).select("+password");
    if (!user || !await user.correctPassword(password, user.password)) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("incorrect email or password", 401));
    // 3) if everything ok, send token to client
    $5c02e39dfc585c40$var$createSendToken(user, 200, res);
});
function $5c02e39dfc585c40$export$a0973bcfe11b05c9(req, res) {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now + 10000),
        httpOnly: true
    });
    res.status(200).json({
        status: "success"
    });
}
const $5c02e39dfc585c40$export$eda7ca9e36571553 = (0, $cfc92fb11915fb47$export$2e2bcd8739ae039)(async (req, res, next)=>{
    // 1) Getting the token and check if it's there
    let token;
    req.requestTime = new Date().toISOString();
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) token = req.headers.authorization.split(" ")[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;
    if (!token) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("You are not logged in. Please login to get access", 401));
    // 2) Verification token
    const decoded = await (0, $2vEDu$promisify)((0, $2vEDu$verify))(token, process.env.JWT_SECRET);
    // 3) Check  if user still exists
    const freshUser = await (0, $dbc7137b80dd09a6$exports.findById)(decoded.id);
    if (!freshUser) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("The user belonging to this token does no longer exist", 401));
    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("user recently changed password! Please login again", 401));
    // grant access to protected route
    req.user = freshUser;
    next();
});
const $5c02e39dfc585c40$export$256a5a3564694cfc = (0, $cfc92fb11915fb47$export$2e2bcd8739ae039)(async (req, res, next)=>{
    if (req.cookies.jwt) {
        // verification token
        const decoded = await (0, $2vEDu$promisify)((0, $2vEDu$verify))(req.cookies.jwt, process.env.JWT_SECRET);
        // 2) Check  if user changed password after the token was issued
        const currentUser = await (0, $dbc7137b80dd09a6$exports.findById)(decoded.id);
        if (!currentUser) return next();
        // 3) Check  if user still exists
        if (currentUser.changedPasswordAfter(decoded.iat)) return next();
        // there is a logged in a user
        res.locals.user = currentUser;
        return next();
    }
    next();
});
function $5c02e39dfc585c40$export$e1bac762c84d3b0c(...roles) {
    return (req, res, next)=>{
        // roles
        if (!roles.includes(req.user.role)) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("you do not have permission to perform this action", 403));
        next();
    };
}
const $5c02e39dfc585c40$export$66791fb2cfeec3e = (0, $cfc92fb11915fb47$export$2e2bcd8739ae039)(async (req, res, next)=>{
    //get user based on posted email
    const user = await (0, $dbc7137b80dd09a6$exports.findOne)({
        email: req.body.email
    });
    if (!user) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("there is no user with email address.", 404));
    //generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    });
    //send it to user email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}. 
  If you didn't forget your password, please ignore this`;
    try {
        await (0, $56fc02e50949a2f0$export$1cea2e25b75a88f2)({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message: message
        });
        res.status(200).json({
            status: "success",
            message: "Token sent to email!"
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        });
        return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("There was an error sending the email. try again later!", 505));
    }
});
const $5c02e39dfc585c40$export$dc726c8e334dd814 = (0, $cfc92fb11915fb47$export$2e2bcd8739ae039)(async (req, res, next)=>{
    // Get user base on the token
    const hashedToken = (0, $2vEDu$createHash)("sha256").update(req.params.token).digest("hex");
    console.log(hashedToken);
    const user = await (0, $dbc7137b80dd09a6$exports.findOne)({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });
    // if token has not expired, and there is user, set new password
    if (!user) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("token is invalid or has expired"), 400);
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // update changePasswordAt property for user
    // Log the user in, send JWT
    $5c02e39dfc585c40$var$createSendToken(user, 200, res);
});
const $5c02e39dfc585c40$export$bf93bd36c441c6d0 = (0, $cfc92fb11915fb47$export$2e2bcd8739ae039)(async (req, res, next)=>{
    //get user from collection
    const user = await (0, $dbc7137b80dd09a6$exports.findById)(req.user.id).select("+password");
    //check if posted password is correct
    if (!await user.correctPassword(req.body.passwordCurrent, user.password)) return next(new (0, $f3fc1744dc11d301$export$2e2bcd8739ae039)("Your current password is wrong", 401));
    //if so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // log user in, send JWT
    $5c02e39dfc585c40$var$createSendToken(user, 200, res);
});


/* eslint-disable */ /* eslint-disable */ const $57052e0f02fcbd13$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
};
const $57052e0f02fcbd13$export$27077c57cd15b0d5 = (type, msg)=>{
    const markup = `<div class='alert alert--${type}'>${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout($57052e0f02fcbd13$export$516836c6a9dfc573, 5000);
};


async function $896fce0a0eaf741b$export$596d806903d1f59e(email, password) {
    try {
        const res = await axios({
            method: "POST",
            url: "http://127.0.0.1:3000/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.status === "success") {
            (0, $57052e0f02fcbd13$export$27077c57cd15b0d5)("success", "Logged in successfully");
            window.setTimeout(()=>{
                location.assign("/");
            }, 1500);
        }
        console.log(res);
    } catch (err) {
        (0, $57052e0f02fcbd13$export$27077c57cd15b0d5)("error", err.response.data);
    }
}
const $896fce0a0eaf741b$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await axios({
            method: "GET",
            url: "http://127.0.0.1:3000/api/v1/users/logout"
        });
        if (res.data.status === "success") location.reload(true);
    } catch (err) {
        (0, $57052e0f02fcbd13$export$27077c57cd15b0d5)("error", "Error logging out! Try again.");
    }
};


/* eslint-disable */ console.log("hello from the client side");
function $ace40bd9ddcb1cff$export$4c5dd147b21b9176(locations) {
    mapboxgl.accessToken = `pk.eyJ1IjoicG9kZXh1czIzIiwiYSI6ImNsb2lycDgzbzF1N3kycXA5NGM0OWU3NDgifQ.zr564U0ctKS60QqXa30fIg`;
    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/podexus23/cloisacnk004t01o4hx5ia7t6",
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        // Add marker
        const el = document.createElement("div");
        el.className = "marker";
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} ${loc.description}</p>`).addTo(map);
        // extends map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}


// DOM Elements
const $8976785d36b1dc90$var$mapBox = document.getElementById("map");
const $8976785d36b1dc90$var$loginForm = document.querySelector(".form");
const $8976785d36b1dc90$var$logoutBtn = document.querySelector(".nav__el--logout");
// Values
// Delegation
if ($8976785d36b1dc90$var$mapBox) {
    const locations = JSON.parse($8976785d36b1dc90$var$mapBox.dataset.locations);
    (0, $ace40bd9ddcb1cff$export$4c5dd147b21b9176)(locations);
}
if ($8976785d36b1dc90$var$loginForm) $8976785d36b1dc90$var$loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    (0, $896fce0a0eaf741b$export$596d806903d1f59e)(email, password);
});
if ($8976785d36b1dc90$var$logoutBtn) $8976785d36b1dc90$var$logoutBtn.addEventListener("click", (0, $5c02e39dfc585c40$export$a0973bcfe11b05c9));


//# sourceMappingURL=bundle.mjs.map
