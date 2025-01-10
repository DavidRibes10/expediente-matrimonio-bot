/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const {Resend} = require("resend");
const {defineString} = require("firebase-functions/params");


const resendApiKey = defineString("RESEND_API_KEY");


exports.consultaFechasExpediente = onSchedule("*/5 * * * *", async (event) => {
  try {
    const resend = new Resend(resendApiKey.value());
    // Obtener la hora actual
    const now = new Date();

    // Formatear la hora y minutos
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    // Crear el mensaje
    const message = `Log de las ${hours}:${minutes}`;

    // Hacer el log
    logger.info(message, {
      timestamp: now.toISOString(),
      scheduleTime: event.scheduleTime,
      timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Enviar el email
    const data = await resend.emails.send({
      from: "Acme <mail@davidribes.dev>",
      to: ["dribes.b@gmail.com"],
      subject: "Log Automático",
      html: `<p>${message}</p>
                   <p>Timestamp: ${now.toISOString()}</p>
                   <p>Schedule Time: ${event.scheduleTime}</p>`,
    });

    logger.info("Email enviado exitosamente", resendApiKey);
  } catch (error) {
    logger.error("Error en la función:", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
});
