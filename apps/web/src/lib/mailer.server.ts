/**
 * Transactional email over SMTP (works with Hostinger Email, Gmail app
 * passwords, Brevo, SES, etc.). Configure SMTP_HOST, SMTP_PORT, SMTP_USER,
 * SMTP_PASS and MAIL_FROM. Without them nothing is sent and the miss is logged,
 * so a booking is still saved and can be followed up from the server log.
 */
import nodemailer, { type Transporter } from 'nodemailer';
import logger from '@/lib/logger.server';
import { escapeHtml } from '@/lib/security.server';

let transporter: Transporter | null | undefined;

const getTransporter = (): Transporter | null => {
	if (transporter !== undefined) {
		return transporter;
	}

	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
		transporter = null;

		return null;
	}

	const port = Number(SMTP_PORT || 465);

	transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		requireTLS: port !== 465,
		auth: { user: SMTP_USER, pass: SMTP_PASS },
	});

	return transporter;
};

export type Mail = { to: string; subject: string; text: string; html: string };

/** Resolves true when the message was handed to the SMTP server. Never throws. */
export const sendMail = async (mail: Mail): Promise<boolean> => {
	const smtp = getTransporter();

	if (!smtp) {
		logger.warn(`Email not sent (SMTP not configured): "${mail.subject}"`);

		if (process.env.NODE_ENV !== 'production') {
			logger.info(`[dev mail to ${mail.to}] ${mail.subject}\n${mail.text}`);
		}

		return false;
	}

	try {
		await smtp.sendMail({
			from: process.env.MAIL_FROM || process.env.SMTP_USER,
			to: mail.to,
			subject: mail.subject,
			text: mail.text,
			html: mail.html,
		});

		return true;
	} catch (error) {
		logger.error(`Email failed: "${mail.subject}"`, error instanceof Error ? error.message : String(error));

		return false;
	}
};

/** Wraps already-escaped body HTML in a plain, client-safe layout. */
export const emailLayout = (heading: string, bodyHtml: string): string =>
	`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111">` +
	`<h2 style="margin:0 0 16px">${escapeHtml(heading)}</h2>${bodyHtml}` +
	`<hr style="border:0;border-top:1px solid #ddd;margin:24px 0"/><p style="font-size:12px;color:#666">All Indian Speakers</p></div>`;

export const emailButton = (href: string, label: string): string =>
	`<p><a href="${escapeHtml(href)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${escapeHtml(label)}</a></p>`;
