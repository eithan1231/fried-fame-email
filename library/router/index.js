const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const sendmailRoute = require('./sendmail');

const router = new Router();
router.use(bodyParser());

router.post('/sendmail', sendmailRoute);

module.exports = router;
