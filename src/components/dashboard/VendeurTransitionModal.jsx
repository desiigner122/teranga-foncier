import React from 'react';

export default function VendeurTransitionModal({ isOpen, onClose, children }) {
	if (!isOpen) return null;
	return (
		<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}>
			<div style={{ background: 'white', margin: '10vh auto', padding: 24, borderRadius: 8, maxWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
				<h2>Transition vers le mode vendeur</h2>
				{children}
				<button onClick={onClose} style={{ marginTop: 16 }}>Fermer</button>
			</div>
		</div>
	);
}
