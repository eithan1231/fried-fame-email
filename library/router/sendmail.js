const nodemailer = require('nodemailer');

const sendmail = async(options) => {
  try {
    // creating mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOSTNAME,
      port:  process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    options.from = `<${process.env.SMTP_USERNAME}>`;

    const info = await transporter.sendMail(options);
  }
  catch(err) {
    // Record error logs from STDERR
    console.error(err);
  }
}

/**
* send mail method
*/
module.exports = async(ctx, next) =>
{
  if(!ctx.state.rpcAuthorization) {
    // Unauthenticated
    return status = 401;
  }

  if(typeof ctx.request.body != 'object') {
    // bad request status
    return status = 400;
  }

  // Yes... I know, we are sending a dummy-response. This is due to the fact
  // it can take a few seconds to send an email... and that is more time that
  // the PHP page will be stalling... and that makes for a bad user experience.
  // If user does not receive email, he will get option to resend so should be
  // a non-issue.
  ctx.body = { success: true };
  ctx.status = 200;

  setImmediate(async () => await sendmail(ctx.request.body));
}
