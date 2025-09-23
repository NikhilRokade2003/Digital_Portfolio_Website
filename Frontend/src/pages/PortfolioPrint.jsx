import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { portfolioAPI } from '../../services/api';

const PortfolioPrint = () => {
	const { id } = useParams();
	const [portfolio, setPortfolio] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const load = async () => {
			try {
				setIsLoading(true);
				const res = await portfolioAPI.getPortfolio(id);
				setPortfolio(res.data);
				setTimeout(() => window.print(), 600);
			} catch (e) {
				setError('Failed to load portfolio for printing.');
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, [id]);

	if (isLoading) return <div style={{ padding: 24 }}>Preparing print view…</div>;
	if (error || !portfolio) return <div style={{ padding: 24 }}>{error || 'No portfolio found.'}</div>;

	const Section = ({ title, children }) => (
		<div className="section">
			<h2>{title}</h2>
			<div>{children}</div>
		</div>
	);

	return (
		<div className="print-container">
			<style>{`
				@page { size: A4; margin: 18mm 16mm; }
				@media print {
					body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
					.no-print { display: none !important; }
					.section { page-break-inside: avoid; }
				}
				body { background: #f7f7fb; }
				.print-container { max-width: 800px; margin: 24px auto; background: #fff; color: #1f2937; }
				.header { display: flex; gap: 20px; border-bottom: 2px solid #e5e7eb; padding: 24px; }
				.header .avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #e5e7eb; }
				.header h1 { margin: 0; font-size: 28px; }
				.header h3 { margin: 6px 0 0; font-weight: 600; color: #4f46e5; }
				.meta { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px 16px; margin-top: 8px; font-size: 13px; color: #374151; }
				.section { padding: 18px 24px; }
				.section h2 { margin: 0 0 10px; font-size: 18px; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
				.item { margin: 10px 0; }
				.item h4 { margin: 0; font-size: 15px; font-weight: 700; }
				.item .sub { font-size: 13px; color: #6b7280; }
				.item p { margin: 6px 0 0; font-size: 13px; line-height: 1.55; }
				.skills { display: flex; flex-wrap: wrap; gap: 6px; }
				.skill { font-size: 12px; background: #eef2ff; color: #3730a3; padding: 4px 10px; border-radius: 999px; }
			`}</style>

			<div className="header">
				<img
					className="avatar"
					src={portfolio.profileImage?.startsWith('http') ? portfolio.profileImage : (portfolio.profileImage ? `http://localhost:5163${portfolio.profileImage}` : 'https://via.placeholder.com/120')}
					alt={portfolio.userFullName || portfolio.title}
					crossOrigin="anonymous"
				/>
				<div>
					<h1>{portfolio.userFullName || 'Unnamed User'}</h1>
					<h3>{portfolio.title}</h3>
					<div className="meta">
						{portfolio.email && <div>Email: {portfolio.email}</div>}
						{portfolio.user?.email && <div>Account: {portfolio.user.email}</div>}
						{portfolio.phone && <div>Phone: {portfolio.phone}</div>}
						{(portfolio.city || portfolio.country) && <div>Location: {[portfolio.city, portfolio.country].filter(Boolean).join(', ')}</div>}
					</div>
				</div>
			</div>

			<Section title="Summary">
				<p>{portfolio.description || '—'}</p>
			</Section>

			<Section title="Projects">
				{(portfolio.projects || []).length === 0 ? (
					<p>—</p>
				) : (
					(portfolio.projects || []).map(p => (
						<div key={p.id} className="item">
							<h4>{p.title}</h4>
							{p.projectUrl && <div className="sub">{p.projectUrl}</div>}
							{p.description && <p>{p.description}</p>}
						</div>
					))
				)}
			</Section>

			<Section title="Experience">
				{(portfolio.experiences || []).length === 0 ? (
					<p>—</p>
				) : (
					(portfolio.experiences || []).map(e => (
						<div key={e.id} className="item">
							<h4>{e.position}</h4>
							<div className="sub">{[e.company, e.location].filter(Boolean).join(' • ')}</div>
							<div className="sub">{new Date(e.startDate).toLocaleDateString()} - {e.endDate ? new Date(e.endDate).toLocaleDateString() : 'Present'}</div>
							{e.description && <p>{e.description}</p>}
						</div>
					))
				)}
			</Section>

			<Section title="Education">
				{(portfolio.educations || []).length === 0 ? (
					<p>—</p>
				) : (
					(portfolio.educations || []).map(ed => (
						<div key={ed.id} className="item">
							<h4>{ed.degree}{ed.field ? ` in ${ed.field}` : ''}</h4>
							<div className="sub">{ed.institution}</div>
							<div className="sub">{new Date(ed.startDate).toLocaleDateString()} - {ed.endDate ? new Date(ed.endDate).toLocaleDateString() : 'Present'}</div>
							{ed.description && <p>{ed.description}</p>}
						</div>
					))
				)}
			</Section>

			<Section title="Skills">
				{(portfolio.skills || []).length === 0 ? (
					<p>—</p>
				) : (
					<div className="skills">
						{(portfolio.skills || []).map(s => (
							<span key={s.id} className="skill">{s.name}{s.level ? ` • ${s.level}/5` : ''}</span>
						))}
					</div>
				)}
			</Section>

			{(portfolio.socialMediaLinks || []).length > 0 && (
				<Section title="Links">
					{(portfolio.socialMediaLinks || []).map(l => (
						<div key={l.id} className="item">
							<h4>{l.platform}</h4>
							<div className="sub">{l.url}</div>
						</div>
					))}
				</Section>
			)}
		</div>
	);
};

export default PortfolioPrint;


