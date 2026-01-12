import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let channel: amqp.Channel;

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    channel = await connection.createChannel();

    const queueName = "send-otp";
    await channel.assertQueue(queueName, { durable: true });

    console.log("📧 Mail service consumer started, listening for OTP emails");

    channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        try {
          const { to, subject, body } = JSON.parse(
            msg.content.toString()
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: `"Chat App" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html: body,
          });

          console.log(`OTP email sent to ${to}`);

          channel.ack(msg); // ✅ ACK after success
        } catch (error) {
          console.error("otp Email sending failed", error);
          channel.nack(msg, false, false); //drop message or send to DLQ
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Failed to start RabbitMQ consumer", error);
  }
};


