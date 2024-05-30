const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

dotenv.config();

const port = process.env.PORT || 3002;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.nfzkyar.mongodb.net/RegistrationFormDB`, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const Registration = mongoose.model('Registration', registrationSchema);

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.get('/backend.php', (req, res) => {
    res.status(405).send('Only POST requests are allowed for /backend.php');
});

app.post('/backend.php', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await Registration.findOne({ email });

        if (!existingUser) {
            const registrationData = new Registration({ name, email, password });
            await registrationData.save();
            res.redirect('/success');
        } else {
            console.log('User already exists');
            res.redirect('/error');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.redirect('/error');
    }
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'success.html'));
});

app.get('/error', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'error.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});