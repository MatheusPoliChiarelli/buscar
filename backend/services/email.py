import os
import resend
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

resend.api_key = os.getenv("RESEND_API_KEY")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FROM_EMAIL = "BusCAR <onboarding@resend.dev>"


def send_password_reset(to_email: str, dealership_name: str, token: str) -> bool:
    link = f"{FRONTEND_URL}/redefinir-senha?token={token}"

    html = f"""
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="background: #d97706; border-radius: 12px 12px 0 0; padding: 20px 24px;">
        <span style="color: #ffffff; font-size: 22px; font-weight: 700;">Bus</span><span style="color: #1c1917; font-size: 22px; font-weight: 700;">CAR</span>
      </div>

      <div style="border: 1px solid #fde68a; border-top: none; border-radius: 0 0 12px 12px; padding: 28px 24px;">
        <h1 style="font-size: 18px; color: #1c1917; margin: 0 0 12px;">Redefinir sua senha</h1>

        <p style="color: #57534e; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Olá, {dealership_name}. Recebemos um pedido para redefinir a senha da sua conta no BusCAR.
        </p>

        <a href="{link}" style="display: inline-block; background: #d97706; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
          Criar nova senha
        </a>

        <p style="color: #a8a29e; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
          Este link vale por 1 hora. Se você não pediu a redefinição, pode ignorar este e-mail — sua senha continua a mesma.
        </p>
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "Redefinir sua senha no BusCAR",
            "html": html,
        })
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return False