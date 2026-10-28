'use client';
import Shell from './gallery-components/shell';
export default function ErrorPage({reset}:{reset:()=>void}){return <Shell><section className="sg-intro"><p className="sg-kicker">A MOMENT OF PAUSE</p><h1>We couldn’t load this page.</h1><p>Please try again shortly.</p><button className="sg-button" onClick={reset}>TRY AGAIN ↗</button></section></Shell>;}
