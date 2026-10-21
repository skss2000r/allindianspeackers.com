import type {Route} from './+types/cart';
import {seo} from '@/lib/seo';
import {CartPanel} from '@/components/cart-panel';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Your selection — All Indian Speakers',description:'Review your selected sessions and continue to secure checkout.',noindex:true})}
export default function Cart(){return <CartPanel/>}
