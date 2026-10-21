import {Link} from 'react-router';
import type {Route} from './+types/checkout.cancelled';
import {seo} from '@/lib/seo';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Checkout cancelled — All Indian Speakers',description:'No payment was taken. Your selected sessions are still in your cart.',noindex:true})}
export default function Cancelled(){return <main className="detail"><h1>Take your time.</h1><p>No payment was taken. Your selection is still here.</p><Link className="action" to="/cart">Return to selection ↗</Link></main>}
