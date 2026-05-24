const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin SDK una sola vez
if (!admin.apps.length) {
  try {
    const serviceAccount = require(path.join(process.cwd(), 'firebase-service-account.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK inicializado');
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
    console.error('   Asegúrate de tener firebase-service-account.json en la raíz del backend');
  }
}

class NotificationService {
  /**
   * Enviar notificación push a un dispositivo.
   * @param {string} fcmToken - Token FCM del dispositivo
   * @param {object} notification - { title, body }
   * @param {object} data - Datos adicionales para la app
   */
  async sendToDevice(fcmToken, notification, data = {}) {
    if (!fcmToken) {
      console.warn('⚠️  FCM: Token no disponible, notificación omitida');
      return null;
    }

    if (!admin.apps.length) {
      console.error('❌ FCM: Firebase Admin no inicializado');
      return null;
    }

    try {
      const message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        // data solo acepta strings
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: {
          priority: 'high',
          notification: { sound: 'default' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      };

      const result = await admin.messaging().send(message);
      console.log('✅ FCM: Notificación enviada:', result);
      return result;
    } catch (error) {
      console.error('❌ FCM Error:', error.message);
      return null;
    }
  }

  // ── Notificaciones específicas ─────────────────────────────

  async notifyNewLoan(fcmToken, { loanId, equipmentName }) {
    return this.sendToDevice(
      fcmToken,
      {
        title: '📦 Nuevo préstamo registrado',
        body: `Se registró un préstamo de "${equipmentName}" a tu nombre. ¿Fuiste tú?`,
      },
      { type: 'NEW_LOAN', loanId, screen: 'LoanConfirmation' }
    );
  }

  async notifyLoanReturned(fcmToken, { loanId, equipmentName }) {
    return this.sendToDevice(
      fcmToken,
      {
        title: '✅ Préstamo finalizado',
        body: `El préstamo de "${equipmentName}" ha sido marcado como devuelto.`,
      },
      { type: 'LOAN_RETURNED', loanId, screen: 'Loans' }
    );
  }
}

module.exports = new NotificationService();