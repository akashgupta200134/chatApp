import amqp from "amqplib";



let channel : amqp.Channel;

export const connectRabbitmq = async() => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });

        channel = await connection.createChannel();
        console.log("connected to RabbitMQ");

    } catch (error) {
          console.error("Error during RabbitMQ connection", error);
        
        
    }

}

export const publishToQueue = async (queueName : string , message : any) =>{
    if(!channel){
        console.log("RabbitMQ channel is not inititalized");
        return; 
    }

    await channel.assertQueue(queueName , {durable : true});

    channel.sendToQueue(queueName , Buffer.from(JSON.stringify(message)), {
        persistent:true
    })

}