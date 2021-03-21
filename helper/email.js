var nodemailer = require('nodemailer');
const SMTPConnection = require("nodemailer/lib/smtp-connection");
module.exports.sendMail = async(data) => {
    var MAIL_SENDFROM_NAME = 'resume app';
    var MAIL_SENDFROM_MAIL = 'app@tekpillar.com';

    var transporter = nodemailer.createTransport({
        host: 'mail.tekpillar.com',
        port: 465,
        secureConnection: true, // use SSL
        transportMethod: 'SMTP',
        auth: {
            user: 'app@tekpillar.com', 
            pass: 'Dipal@0793' 
        }
    });
    
    var mail = {
        from: '"' + MAIL_SENDFROM_NAME + '" <' + MAIL_SENDFROM_MAIL + '>',				
        to: data.email,
        subject: data.subject,
        generateTextFromHTML: true,
        text:data.text,

    }

    
    transporter.sendMail(mail, function (error, response1) {
        console.log(error)
        console.log(response1)
        if (error) {
            console.log("error while mail sending", error);
            response = {status: 'error', message: 'Error while mail sending.'};
            // res.send(response);                   		                       
        } else {
            response = {status: 'success', message: 'We sent you instruction for password reset on your registred email address. Please check that.'};
            // res.send(response);
        }
    });
            
  }