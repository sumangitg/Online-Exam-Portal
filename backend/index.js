// backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const cors = require('cors');
const path =require('path');
const app = express();
app.use(bodyParser.json());   
app.use(cors());     


// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hal987@@@',
  database: 'emailverify'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'haldersumanaqz123@gmail.com',
    pass: 'qquc ifng eqlx vlvc'
  }
});



app.post('/verify-email', (req, res) => {
  const { email } = req.body;
  const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });

  connection.query('INSERT INTO otps (email, otp) VALUES (?, ?)', [email, otp], (error, results) => {
    if (error) {
      console.error('Error saving OTP to database: ' + error);
      res.status(500).json({ error: 'An error occurred while saving OTP to database' });
      return;
    }

    transporter.sendMail({
      from: 'haldersumanaqz123@gmail.com',
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}`
    }, (error, info) => {
      if (error) {
        console.error('Error sending email: ' + error);
        res.status(500).json({ error: 'An error occurred while sending email' });
        return;
      }
      res.status(200).json({ message: 'OTP sent successfully' });
    });
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  connection.query('SELECT * FROM otps WHERE email = ? AND otp = ?', [email, otp], (error, results) => {
    if (error) {
      console.error('Error verifying OTP: ' + error);
      res.status(500).json({ error: 'An error occurred while verifying OTP' });
      return;
    }

    if (results.length === 0) {
      res.status(400).json({ error: 'Invalid OTP' });
    } else {
      connection.query('UPDATE users SET email_verified = 1 WHERE email = ?', [email], (error) => {
        if (error) {
          console.error('Error marking email as verified: ' + error);
          res.status(500).json({ error: 'An error occurred while marking email as verified' });
          return;
        }       
        res.status(200).json({ message: 'Email verified successfully', email: email});
      });
    }
  });
});

// app.get('/questions', (req, res) => {
//   const sql = 'SELECT * FROM questions';
//   connection.query(sql, (err, results) => {
//       if (err) {
//           console.error('Error fetching questions:', err);
//           res.status(500).send('An error occurred while fetching questions');
//           return;
//       }
//       res.json(results);
//       console.log(results);   
//   });
// });
// Serve the React app for all other routes
app.get('/', (req, res) => {
  res.send("hello");
});

const PORT = process.env.PORT || 4502;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
