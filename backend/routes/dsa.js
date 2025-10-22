const express = require('express');
const dsaRouter = express.Router();
const {generateCodeStream} = require("../controllers/geminiController");

// AI Code Generation Endpoint
dsaRouter.post('/generate-code', generateCodeStream);

module.exports = dsaRouter;