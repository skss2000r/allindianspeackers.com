import sanitizeHtml from 'sanitize-html';

/**
 * Product descriptions are merchant-authored HTML rendered with
 * `dangerouslySetInnerHTML`. Anything that reaches the page this way can run
 * script in every visitor's browser, so it is reduced to a small allowlist of
 * text-formatting tags here, on the server, before it ever reaches React.
 */
export const sanitizeDescription = (html: string): string =>
	sanitizeHtml(html, {
		allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a'],
		allowedAttributes: { a: ['href', 'title'] },
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
		allowProtocolRelative: false,
		transformTags: {
			a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }, true),
		},
	});
