const express = require('express'); const app = express(); app.get('/test', (req, res) => res.send('OK')); app.listen(3000, () => console.log('Server running on 3000'));
