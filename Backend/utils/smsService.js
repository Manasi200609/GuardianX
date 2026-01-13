const twilio = require("twilio");

const sendSMS = async (to, message) => {
  // Hackathon safe fallback
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    console.log("📩 SMS SIMULATION");
    console.log("To:", to);
    console.log("Message:", message);
    return;
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
};

module.exports = sendSMS;