const Notification =
  require(
    "../models/Notification"
  );

async function createNotification(

  userId,

  title,

  message

) {

  await Notification.create({

    userId,

    title,

    message

  });

}

module.exports =
  createNotification;