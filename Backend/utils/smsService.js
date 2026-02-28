const twilio = require("twilio");

const sendSMS = async (to, message) => {
  // Hackathon safe fallback - if credentials are missing we just log
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    console.warn("📩 SMS SIMULATION (Twilio credentials not provided)");
    console.log("   To:", to);
    console.log("   Message:", message);
    return;
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    const resp = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`📤 Twilio message sent (sid: ${resp.sid}) to ${to}`);
  } catch (err) {
    console.error('❌ Twilio send failed:', err.message || err);
    throw err; // propagate so caller knows
  }
};

module.exports = sendSMS;