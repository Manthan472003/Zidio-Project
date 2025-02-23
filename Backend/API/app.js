const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const helmet = require('helmet');
const sequelize = require('../Database/Config/config');
const userRoutes = require('./Routes/userRoutes');
const taskRoutes = require('./Routes/taskRoutes');
const sectionRoutes = require('./Routes/sectionRoutes');
const tagRoutes = require('./Routes/tagRoutes');
const mediaRoutes = require('./Routes/mediaRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const sendMailRoute = require('./Routes/sendMailRoute');

require('./Controllers/deletePermanentlyController');

const app = express();
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"], 
    scriptSrc: ["'self'", 'cdn.example.com'], // Allow scripts from trusted CDN
    imgSrc: ["'self'"], // Allow images only from the same domain
    styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (if necessary)
  }
}));

app.use(helmet.xssFilter()); // Prevents cross-site scripting attacks
app.use(helmet.frameguard({ action: 'deny' })); // Prevents embedding in iframes

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API STARTED!!!');
});

app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/sections', sectionRoutes);
app.use('/tags', tagRoutes);
app.use('/media', mediaRoutes);
app.use('/notifications', notificationRoutes);
app.use('/comment', commentRoutes);
app.use('/sendMail', sendMailRoute);

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Unable to connect to the database:', error);
});

module.exports = app; // For standard server use
module.exports.handler = serverless(app); // For Vercel Serverless