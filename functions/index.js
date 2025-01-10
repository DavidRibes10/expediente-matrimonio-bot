/* eslint-disable require-jsdoc */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const {Resend} = require("resend");
const {defineString} = require("firebase-functions/params");
const axios = require("axios");


const resendApiKey = defineString("RESEND_API_KEY");
const correosDestinatarios = defineString("TO_EMAILS");


exports.consultaFechasExpediente = onSchedule("*/5 * * * *", async (event) => {
  try {
    const API_URL = "https://sige.gva.es/qsige.localizador/citaPrevia/disponible/centro/85/servicio/265/calendario";
    const RESERVATION_URL = "https://sige.gva.es/qsige/citaprevia.justicia/#/es/home?uuid=01E4-33B69-2883-5B9B8";
    const DESTINATARIOS = correosDestinatarios.value().split(",");

    const data = await fetchAPI(API_URL);
    const availableDays = data.dias.filter((day) => day.estado !== 1);

    if (availableDays.length > 0) {
      const daysList = availableDays.map((day) => day.dia).join(", ");
      const subject = "Disponibilidad de Reserva Detectada";
      const body = `
                Se han detectado días disponibles para reserva.
                Días: ${daysList}
                Accede al siguiente enlace para realizar la reserva:
                ${RESERVATION_URL}
            `;

      await sendEmail(subject, body, DESTINATARIOS);
      logger.info("Correo enviado con éxito.");
    }
  } catch (error) {
    logger.error("Error en la función:", {
      error: error.message,
    });
    throw error;
  }
});

// Función para realizar la solicitud HTTP
async function fetchAPI(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener los datos de la API: " + error.message);
  }
}

// Función para enviar correos electrónicos con Resend
async function sendEmail( subject, body, destinatarios) {
  try {
    const resend = new Resend(resendApiKey.value());
    await resend.emails.send({
      from: "David Ribes <mail@davidribes.dev>",
      to: destinatarios,
      subject: subject,
      text: body,
    });
    console.log("Correo enviado correctamente.");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}
