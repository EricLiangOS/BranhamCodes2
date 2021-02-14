import pino = require('pino');
const logger = pino({'name': 'main'});
const web_logger = logger.child({'name': 'http'});
import pino_http = require('pino-http')
const http_logger = pino_http({'name': 'http'});
import express = require('express');
import mongo = require('mongodb');

import config from "./lib/config";
import { DBManager } from './lib/database';

const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'branhamcodes';

(async () => {
	let _conn: mongo.MongoClient;

	try {
		_conn = new mongo.MongoClient(DB_URL);
		await _conn.connect();
		const _database = _conn.db(DB_NAME).collection('users');
		const database = new DBManager(_database);

		const app = express();
		app.use(http_logger);

		app.listen(config.PORT, () => logger.info('listening on %d', config.PORT));
	} catch (e) {
		logger.fatal(e);
		logger.info('shutting down MongoDB');
		_conn.close().then(() => process.exit());
		process.exit();
	}
})();
