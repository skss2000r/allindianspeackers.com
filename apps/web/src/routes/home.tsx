import type {Route} from './+types/home';
import {seo} from '@/lib/seo';
import {getProducts} from '@/api/ecommerce-api';
import {Hero} from '@/components/home/hero';
import {Sessions} from '@/components/home/sessions';
import {JoinSpeaker} from '@/components/home/join-speaker';
export async function loader(){return getProducts({exclude_types:'subscription',limit:100});}
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'All Indian Speakers — Your voice. Your stage.',description:'Explore leadership keynotes, innovation talks, sports sessions and virtual expert conversations from All Indian Speakers. Find your next event experience.',jsonLd:[{'@context':'https://schema.org','@type':'WebSite',name:'All Indian Speakers'},{'@context':'https://schema.org','@type':'Organization',name:'All Indian Speakers'}]});}
export default function Home({loaderData}:Route.ComponentProps){return <main><Hero/><JoinSpeaker/><Sessions products={loaderData.products}/></main>}
