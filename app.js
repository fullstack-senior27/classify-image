const express = require('express');
const mysql = require('mysql');
const axios = require('axios');

const app = express();

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
});

// Connect
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Route to handle the image analysis request
app.post('/analyze-image', async (req, res) => {
  const imagePath = req.body.image_path;

  if (!imagePath) {
    return res.status(400).json({ success: false, message: 'Image path is required' });
  }

  try {
    // Make a request to the AI analysis API
    const apiResponse = await axios.post('http://example.com/', { image_path: imagePath });

    const responseData = apiResponse.data;

    // Save the response to the MySQL database
    const sql = `INSERT INTO ai_analysis_log (image_path, success, message, class, confidence, request_timestamp, response_timestamp) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`;
    const values = [
      imagePath,
      responseData.success,
      responseData.message,
      responseData.estimated_data.class,
      responseData.estimated_data.confidence
    ];

    connection.query(sql, values, (error, results) => {
      if (error) {
        console.error('Error saving analysis result to MySQL:', error);
        res.status(500).json({ success: false, message: 'Error saving analysis result to database' });
        return;
      }
      console.log('Analysis result saved to MySQL');
      res.status(200).json({ success: true, message: 'Analysis result saved to database' });
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ success: false, message: 'Error analyzing image' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
