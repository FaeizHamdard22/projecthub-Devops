import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT,'0.0.0.0', () => {
      console.log('Server is running on port : ' + PORT);
      console.log("Auto-deploy test!");
    });
  })
  .catch(err => console.error(err));
