const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config(); 
const User = require('../../Database/Models/user.js');

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

// const header = ` 
// <header style="width: 100%; overflow: hidden;">
//     <!-- Referencing the image using CID -->
//     <img src="cid:emailHeaderImage" alt="Copious Teams Logo" style="width: 100%; height: auto; display: block;">
// </header>`;

const header = ``;

const footer = `
<footer style="background-color: #ffffff; border-top: 2px solid #007BFF; padding: 20px; text-align: center; font-family: 'Arial', sans-serif;">
    <p style="margin: 5px 0;">&copy; 2025 Plan-X. All rights reserved.</p>
</footer>`;

// Define the local image path
const logoPath = path.join(__dirname, '../Assets/EmailHeader.png');


const sendEmail = (req, res) => {
    const { email, subject, text, html } = req.body;

    if (!email) {
        return res.status(400).send('Email is required.');
    }

    const mainContent = `
        <main style="padding: 20px; font-family: Arial, sans-serif;">
            ${html || '<h1>Welcome!</h1><p style="margin: 10px 0;">Thank you for signing up!</p>'}
        </main>`;

    // const fullHtml = `
    //     ${header}
    //     ${mainContent}
    //     ${footer}
    // `;

    const fullHtml = `
    ${mainContent}
    ${footer}
`;

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: subject || "Default Subject",
        text: text || "Default text",
        html: fullHtml,
        attachments: [
            // {
            //     filename: 'EmailHeader.png',
            //     path: logoPath,
            //     cid: 'emailHeaderImage' // This ID will be referenced in the HTML img tag
            // }
        ],
    };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD,
        },
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred:', error);
            return res.status(500).send(`Error sending email: ${error.message}`);
        } else {
            return res.status(200).send('Email sent successfully');
        }
    });
};

const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString().padStart(6, '0');
}

const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send('Email is required.');
    }
    try {
        const user = await User.findOne({
            where: { email }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.otp = generateOtp();
        await user.save();
        const otp = user.otp;

        const mainContent = `
        <main style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #2C3E50;">Your One-Time Password (OTP)</h1>
            <p style="font-size: 18px; margin: 10px 0;">Hello,</p>
            <p style="font-size: 16px; color: #7F8C8D; margin-bottom: 20px;">Please use the following OTP to complete your action:</p>
            <h2 style="font-size: 36px; color: #E74C3C; font-weight: bold;">${otp}</h2>
            <p style="font-size: 14px; color: #95A5A6;">This OTP is valid for 10 minutes.</p>
            <p>If you did not request this OTP, please ignore this message.</p>
        </main>`;

        const fullHtml = `
        ${header}
        ${mainContent}
        ${footer}
        `;

        const subject = "Reset Your Password - OTP Inside";
        const text = `You have received an OTP after clicking 'Forgot Password'. Use this OTP to reset your password.`;


        const mailOptions = {
            from: EMAIL,
            to: email,
            subject: subject || "Default Subject",
            text: text || "Default text",
            html: fullHtml,
            attachments: [
                {
                    filename: 'EmailHeader.png',
                    path: logoPath,
                    cid: 'emailHeaderImage' // This ID will be referenced in the HTML img tag
                }
            ],
        };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD,
            },
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error occurred:', error);
                return res.status(500).send(`Error sending email: ${error.message}`);
            } else {
                return res.status(200).send('Email sent successfully');
            }
        });
        return res.status(200).json({ message: 'OTP sent successfully : ', otp });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving user.', error });
    }

}

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email) {
        return res.status(400).send('Email is required.');
    };
    if (!otp) {
        return res.status(400).send('OTP is required.');
    }
    const user = await User.findOne({
        where: { email }
    });
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    try {
        if (user.otp !== otp) {
            return res.status(201).json({ message: 'Invalid OTP.' });
        }

        return res.status(200).json({ message: 'OTP verified successfully.' });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while verifying OTP.' });

    }
}

module.exports = { sendEmail, sendOtp, verifyOtp };
