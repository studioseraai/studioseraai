import Link from 'next/link';import Shell from './gallery-components/shell';
export default function NotFound(){return <Shell><section className="sg-intro"><p className="sg-kicker">404 · NOT FOUND</p><h1>A different path to art.</h1><p>This page or artwork is not available.</p><Link className="sg-button" href="/collections">EXPLORE COLLECTION ↗</Link></section></Shell>;}
