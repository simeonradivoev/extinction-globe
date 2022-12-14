const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/docs'));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/lil/', express.static(path.join(__dirname, 'node_modules/lil-gui/dist')));

app.listen(3000, () => console.log('Visit http://127.0.0.1:3000'));
