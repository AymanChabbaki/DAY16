const express = require('express');
const port = 3000;

const app = express()

app.get('/', (req, res) => {
  res.send('its the first server ');
});


app.listen(port, () => {
    console.log('server running on port 3000');
} )