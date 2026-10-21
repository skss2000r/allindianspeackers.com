import type {Route} from './+types/home';
import {seo} from '@/lib/seo';
import {getProducts} from '@/api/ecommerce-api';
import {Hero} from '@/components/home/hero';
import {Sessions} from '@/components/home/sessions';
import {JoinSpeaker} from '@/components/home/join-speaker';
export async function loader(){return getProducts({exclude_types:'subscription',limit:100});}
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Find your favourite voice — All Indian Speakers',description:'Find speakers across leadership, innovation, sports, education and more. Discover your favourite voice for your next event.',jsonLd:[{'@context':'https://schema.org','@type':'WebSite',name:'All Indian Speakers'},{'@context':'https://schema.org','@type':'Organization',name:'All Indian Speakers'}]});}
export default function Home({loaderData}:Route.ComponentProps){return <main><Hero/><JoinSpeaker/><Sessions products={loaderData.products}/></main>}
