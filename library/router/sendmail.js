const nodemailer = require('nodemailer');

const getSecurityPolicies = () => {
  switch (process.env.SMTP_SECURE) {
    case 'STRICT':
      return {
        secure: true,
        requireTLS: true
      };

    case 'STARTTLS':
      return {
        secure: false,
        requireTLS: true
      };

    case 'NONE':
      return {
        secure: false,
        ignoreTLS: true
      };

    default:
      // return nodemailer defaults
      return { };
  }
}

const sendmail = async(options) => {
  try {
    const securityPolicies = getSecurityPolicies();

    // creating mail transporter
    const transporter = nodemailer.createTransport({
      ...securityPolicies,
      host: process.env.SMTP_HOSTNAME,
      port:  process.env.SMTP_PORT,
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
    return ctx.status = 401;
  }

  if(typeof ctx.request.body != 'object') {
    // bad request status
    return ctx.status = 400;
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
