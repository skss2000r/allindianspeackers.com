import type { ReactNode } from 'react';

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
	return (
		<label className="field">
			<span>{label}</span>
			{children}
			{hint && <small className="hint">{hint}</small>}
			{error && <small className="error" role="alert">{error}</small>}
		</label>
	);
}
