import type {Route} from './+types/product.$handle';
import {getProductByHandle,EcommerceApiError,toPriceUnits} from '@/api/ecommerce-api';
import {seo} from '@/lib/seo';
import {ProductDetail} from '@/components/product-detail';
import {sanitizeDescription} from '@/lib/sanitize.server';
export async function loader({params}:Route.LoaderArgs){try{const product=await getProductByHandle(params.handle);return {product:{...product,description:sanitizeDescription(product.description??'')}}}catch(e){if(e instanceof EcommerceApiError&&e.status===404)throw new Response('Session not found',{status:404});throw e}}
export function meta({matches,location,loaderData}:Route.MetaArgs){const p=loaderData?.product;return seo({matches,location},p?{...p.seo,jsonLd:{'@context':'https://schema.org','@type':'Product',name:p.title,offers:{'@type':'Offer',price:toPriceUnits(p.price_in_cents,p.currency_info),priceCurrency:p.currency.toUpperCase()}}}:{title:'Session not found',description:'This session is not available.',noindex:true});}
export default function ProductPage({loaderData}:Route.ComponentProps){return <ProductDetail product={loaderData.product}/>}
