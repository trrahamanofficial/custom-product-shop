"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
type Product = {id:string;name:string;description:string;category:string;price:number;image_url:string|null;stock:number};
export default function Home(){
 const [products,setProducts]=useState<Product[]>([]);
 const [loading,setLoading]=useState(true);
 const [cart,setCart]=useState<Record<string,number>>({});
 useEffect(()=>{supabase.from("products").select("id,name,description,category,price,image_url,stock").eq("is_active",true).order("created_at",{ascending:false}).then(({data})=>{setProducts(data||[]);setLoading(false);});},[]);
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 return <main className="wrap"><nav className="nav"><Link className="brand" href="/">ShopBangla</Link><div className="links"><Link href="/login">লগইন</Link><Link href="/signup" className="btn">সাইন আপ</Link><Link href="/supervisor/login">Supervisor</Link></div></nav>
 <section className="hero"><p className="muted">আপনার অনলাইন বাজার</p><h1>পছন্দের পণ্য,<br/>এবার ঘরে বসেই।</h1><p>সহজে পণ্য খুঁজুন, কার্টে রাখুন এবং অর্ডার করুন।</p><Link className="btn" href="/signup">কেনাকাটা শুরু করুন</Link></section>
 <div className="row"><h2>জনপ্রিয় পণ্য</h2><span className="muted">কার্টে {count}টি পণ্য</span></div>
 {loading?<p>পণ্য লোড হচ্ছে...</p>:products.length===0?<div className="panel"><h3>দোকান প্রস্তুত হচ্ছে</h3><p className="muted">Admin Panel থেকে প্রথম পণ্য যোগ করলে এখানে দেখা যাবে।</p></div>:<section className="grid">{products.map(p=><article className="card" key={p.id}><div className="product-img">{p.image_url?<img src={p.image_url} alt={p.name} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/>:"🛍️"}</div><p className="muted">{p.category}</p><h3>{p.name}</h3><p className="muted">{p.description}</p><p className="price">₹{Number(p.price).toFixed(2)}</p><button className="btn" onClick={()=>setCart(c=>({...c,[p.id]:(c[p.id]||0)+1}))}>কার্টে যোগ করুন</button></article>)}</section>}
 <p className="muted" style={{textAlign:"center",padding:30}}>© 2026 ShopBangla</p></main>
}
