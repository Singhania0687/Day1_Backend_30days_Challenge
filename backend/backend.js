const express = require('express');
const UAParser=require('ua-parser-js')
const rateLimit=require('express-rate-limit')
const {mainDB}=require('./db')
const authMiddleWare = require('./jwt_auth');
const cookie_parser = require('cookie-parser');
const nodemailer=require('nodemailer')
const passwordtoken="kkei wyik bawx wbge"
const emailtoken="abhishekundefeated0687@gmail.com"
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const User = require('./schema');
const PORT = 3000;
const Device=require('./device_status_schema')
const swaggerUi=require('swagger-ui-express')
const swaggerJsDoc=require('swagger-jsdoc')
const path=require('path')
// Middleware
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true
}));
app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// serving frontend
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static("public"))
// Rete Limit Middleware
const limiter=rateLimit({
    windowMs:15*60*1000,
    max:10000,
    message:'Too many request from this IP,please try again after an hour'
})
app.use(limiter)

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Auth API",
      version: "1.0.0",
      description: "API documentation for your system",
    },
  },
  apis: ["./backend.js"], 
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB Connection
mainDB()

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

// Login Route
app.post('/login', async (req, res) => {
  // 1️⃣ Extract device info same as signup
  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();
  const deviceId = req.headers["user-agent"];  // must be sent by frontend
  const deviceType = ua.device.type || "desktop";
  const os = `${ua.os.name} ${ua.os.version}`;
  const browser = `${ua.browser.name} ${ua.browser.version}`;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const lastActiveAt = new Date();

  const { email, password } = req.body;

  try {
    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // 4️⃣ Check if this device already exists
    const existingDevice = await Device.findOne({
      userId: user._id,
      deviceId: deviceId
    });

    if (existingDevice) {
      // 5️⃣ Update device details
      existingDevice.ip = ip;
      existingDevice.os = os;
      existingDevice.browser = browser;
      existingDevice.deviceType = deviceType;
      existingDevice.status = "active";
      existingDevice.lastActiveAt = lastActiveAt;

      await existingDevice.save();
    } else {
      // 6️⃣ New device → create a new entry
      await Device.create({
        userId: user._id,
        deviceId,
        deviceType,
        os,
        browser,
        ip,
        status: "active",
        lastActiveAt
      });
    }

    // 7️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      'abhi_lbsnaa',
      { expiresIn: '1h' }
    );

    // 8️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000
    });

    // 9️⃣ Final response
    res.json({ status: 200, message: "Login successful" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error in login" });
  }
});


/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User profile returned
 *       403:
 *         description: Unauthorized
 */

// Protected Route
app.get("/profile", authMiddleWare, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ status: 200, user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});





/**
 * @swagger
 * /userRegistration:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully registered
 *       400:
 *         description: User already exists
 */

// User Registration
app.post('/userRegistration', async (req, res) => {
    // 1️⃣ Extract device info
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();
    const deviceId = req.headers["user-agent"]; // must be sent from frontend
    const deviceType = ua.device.type || "desktop";
    const os = `${ua.os.name} ${ua.os.version}`;
    const browser = `${ua.browser.name} ${ua.browser.version}`;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const lastActiveAt = new Date();
    // for form field extraction
    const { fname, lname, email, password ,isverified} = req.body;
    
    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {  
            return res.status(400).send("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

         
        // Create user with isverified = false
        const newUser = await User.create({
            fname,
            lname,
            email,
            password: hashedPassword,
            isverified,
        }); 

 // AFTER creating newUser and BEFORE sending success response
          await Device.create({
                 userId: newUser._id,
                 deviceId,
                 deviceType,
                 os,
                 browser,
                 ip,
                 status: "active",
                 lastActiveAt
                })
        // Generate Email Verification JWT Token
        const emailToken = jwt.sign(
            { userId: newUser._id },
            "abhishek_lbsnaa",       // <-- correct secret
            { expiresIn: "1h" }
        );

        // Create verification link
        const verificationLink = `http://127.0.0.1:3000/verifyEmail?token=${emailToken}`;

        // Nodemailer setup (Gmail App Password)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailtoken,           // your Gmail
                pass: passwordtoken,   // App Password
            }
        });

        // Send verification email
        await transporter.sendMail({
            from: `Abhishek <${emailtoken}>`,
            to: email,
            subject: "Verify Your Email",
            html: `
                <h2>Welcome ${fname}!</h2>
                <p>Please click the link below to verify your email:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>This link will expire in 1 hour.</p>
            `,
        });

        return res.status(200).send("Registration successful! Please verify your email.");

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).send("Error in registering user");
    }
});


/**
 * @swagger
 * /verify-email:
 *   post:
 *     summary: Verify user email using OTP or token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP or expired token
 *       404:
 *         description: User not found
 */

// EMAIL VERIFICATION ROUTE
app.get('/verifyEmail', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.send("Token missing");

        const decoded = jwt.verify(token, 'abhishek_lbsnaa');

        await User.findByIdAndUpdate(decoded.userId, { isverified: true });

        res.send("Email verified successfully!");
    } catch (error) {
        res.send("Invalid or expired token");
    }
});

/**
 * @swagger
 * /forget-password:
 *   post:
 *     summary: Send password reset OTP or link to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset OTP sent to email
 *       404:
 *         description: User not found
 */

// Forget Password
app.post('/forgetPassword', async (req, res) => {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.send("User not found, please signup");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ email }, { password: hashedPassword })
        .then(() => res.send("Password updated successfully"))
        .catch(() => res.send("Error in updating password"));
});


/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user and invalidate token
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       403:
 *         description: Unauthorized
 */


// Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // IMPORTANT for localhost
    sameSite: "strict"
  });

  res.json({ message: "Logged out successfully" });
});

// Server
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is listening on ${PORT}`);
});
