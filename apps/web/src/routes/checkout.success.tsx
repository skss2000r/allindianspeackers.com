import {useEffect} from 'react';
import {Link} from 'react-router';
import type {Route} from './+types/checkout.success';
import {useCart} from '@/hooks/use-ecommerce-cart';
import {seo} from '@/lib/seo';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Thank you — All Indian Speakers',description:'Thank you for your order. Check your checkout receipt for payment confirmation.',noindex:true})}
export default function Success(){const {clear,isLoading}=useCart();useEffect(()=>{if(!isLoading)clear()},[clear,isLoading]);return <main className="detail"><h1>Thank you.</h1><p>Your checkout is complete. Please refer to your order receipt for payment confirmation and next steps.</p><Link className="action" to="/">Back to the stage ↗</Link></main>}
