const nodemailer = require('nodemailer')

/**
 * EmailService — Envío de correos con Nodemailer + Gmail
 *
 * Requiere en .env:
 *   EMAIL_USER=tucorreo@gmail.com
 *   EMAIL_PASS=clave-de-aplicacion-16-chars
 *   EMAIL_FROM=Carné Digital <tucorreo@gmail.com>
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  /**
   * Enviar correo de bienvenida con credenciales al usuario creado.
   */
  async sendWelcome({ name, email, document, role }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  EMAIL: Credenciales no configuradas en .env')
      return null
    }

    const roleLabels = {
      estudiante:    'Estudiante',
      docente:       'Docente',
      administrativo:'Administrativo',
      admin:         'Administrador',
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3a6b,#0f2347);padding:32px;text-align:center;border-bottom:1px solid #334155;">
              <div style="font-size:48px;margin-bottom:12px;">🎓</div>
              <h1 style="color:#FFD700;font-size:22px;margin:0;letter-spacing:1px;">CARNÉ DIGITAL</h1>
              <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:6px 0 0;">Sistema Institucional</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#f1f5f9;font-size:18px;margin:0 0 8px;">¡Bienvenido/a, ${name}!</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Tu cuenta en el sistema de Carné Digital ha sido creada exitosamente.
                A continuación encontrarás tus credenciales de acceso.
              </p>

              <!-- Credentials box -->
              <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:20px;margin-bottom:24px;">
                <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;margin:0 0 14px;">TUS CREDENCIALES</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
                      <span style="color:#64748b;font-size:12px;">Rol</span><br/>
                      <span style="color:#f1f5f9;font-size:14px;font-weight:600;">${roleLabels[role] || role}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
                      <span style="color:#64748b;font-size:12px;">Usuario (Cédula)</span><br/>
                      <span style="color:#3b82f6;font-size:18px;font-weight:700;font-family:monospace;">${document}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="color:#64748b;font-size:12px;">Contraseña temporal</span><br/>
                      <span style="color:#f59e0b;font-size:18px;font-weight:700;font-family:monospace;">${document}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Alert -->
              <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:14px;margin-bottom:24px;">
                <p style="color:#f59e0b;font-size:13px;margin:0;line-height:1.5;">
                  ⚠️ <strong>Importante:</strong> Al iniciar sesión por primera vez, el sistema te pedirá cambiar tu contraseña. 
                  Tu contraseña temporal es tu número de cédula.
                </p>
              </div>

              <!-- Steps -->
              <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;font-weight:600;">PASOS PARA INGRESAR:</p>
              ${['Descarga la app Carné Digital en tu celular', `Ingresa tu cédula: ${document}`, `Contraseña temporal: ${document}`, 'Crea tu nueva contraseña segura', '¡Listo! Ya puedes ver tu carné digital'].map((step, i) => `
              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
                <div style="background:#3b82f6;color:#fff;width:22px;height:22px;border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${i + 1}</div>
                <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.5;">${step}</p>
              </div>`).join('')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #334155;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0;">
                Este correo fue generado automáticamente. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || `Carné Digital <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎓 Bienvenido/a al sistema de Carné Digital — Tus credenciales',
        html,
      })
      console.log(`✅ EMAIL: Correo enviado a ${email}`)
      return true
    } catch (error) {
      console.error(`❌ EMAIL: Error enviando a ${email}:`, error.message)
      return false
    }
  }
}

module.exports = new EmailService()