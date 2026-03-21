const amqp = require('amqplib');
const nodemailer = require('nodemailer');

// 1. Настройки за твоя личен Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cvetanzlatev30@gmail.com',
        pass: 'qvid xfxh jzsx dhoh'
    }
});

async function start() {
    try {
        // 2. Свързваме се с локалния RabbitMQ
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'email_queue';

        await channel.assertQueue(queue, { durable: true });
        console.log(`[*] Сървисът е вдигнат! Чакам за имейли в опашката: ${queue}...`);

        // 3. Слушаме за нови съобщения
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    let content = msg.content.toString();
                    console.log(`[x] ПРИСТИГНА CONTENT: ${content}`);

                    let data = JSON.parse(content);

                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }

                    const recipient = data.targetEmail || data.email;
                    console.log(`[x] Опит за пращане до: ${recipient}`);

                    if (!recipient) {
                        console.error("[!] Грешка: Липсва имейл в данните!");
                        channel.ack(msg);
                        return;
                    }

                    const mailOptions = {
                        from: 'cvetanzlatev30@gmail.com',
                        to: recipient,
                        subject: data.title || "Inventory Notification",
                        text: data.message || "No message content"
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(`[✔] УСПЕХ! Имейлът е изпратен на ${recipient}! 🚀`);

                    channel.ack(msg);
                } catch (error) {
                    console.error(`[!] Грешка при обработка:`, error);
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('Грешка със сървъра:', error);
    }
}

start();