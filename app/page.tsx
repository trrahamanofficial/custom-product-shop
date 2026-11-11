"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = { id:string; name:string; description:string; category:string; price:number; image_url:string|null; stock:number };
export default function Home(){
  const [products,setProducts]=useState<Product[]>([]);
  const [loading,setLoading]=useState(true);
  const [cart,setCart]=useState<Record<string,number>>({});
  const [checkout,setCheckout]=useState(false);
  const [customer,setCustomer]=useState({name:"",phone:"",address:""});
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [upiId,setUpiId]=useState("YOUR-UPI-ID-HERE");
  useEffect(()=>{supabase.from("products").select("id,name,description,category,price,image_url,stock").eq("is_active",true).order("created_at",{ascending:false}).then(({data})=>{setProducts(data||[]);setLoading(false);});},[]);
  const cartItems=useMemo(()=>products.filter(p=>(cart[p.id]||0)>0).map(p=>({...p,quantity:cart[p.id]})),[products,cart]);
  const total=cartItems.reduce((s,p)=>s+Number(p.price)*p.quantity,0);
  const count=Object.values(cart).reduce((a,b)=>a+b,0);
  async function placeOrder(e:React.FormEvent){
    e.preventDefault(); setBusy(true); setMessage("");
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setMessage("অর্ডার করতে আগে লগইন করুন।");setBusy(false);return;}
    const {data:order,error}=await supabase.from("orders").insert({
      user_id:user.id,customer_name:customer.name,phone:customer.phone,address:customer.address,total,
      status:"pending",payment_method:"upi_manual",payment_status:"pending_verification"
    }).select("id").single();
    if(error||!order){setMessage(error?.message||"অর্ডার তৈরি হয়নি।");setBusy(false);return;}
    const rows=cartItems.map(p=>({order_id:order.id,product_id:p.id,product_name:p.name,quantity:p.quantity,unit_price:p.price}));
    const {error:itemError}=await supabase.from("order_items").insert(rows);
    if(itemError){setMessage("অর্ডার তৈরি হয়েছে, তবে পণ্যের তালিকা সেভ হয়নি। Admin-কে জানান। Order: "+order.id);setBusy(false);return;}
    setMessage("অর্ডার জমা হয়েছে! Order ID: "+order.id+" · পেমেন্ট যাচাই বাকি। টাকা পাওয়ার পর Admin অর্ডার Confirm করবে।");
    setCart({});setCheckout(false);setCustomer({name:"",phone:"",address:""});setBusy(false);
  }
  return <main className="wrap">
    <nav className="nav"><Link className="brand" href="/">BigBag Shop</Link><div className="links"><Link href="/login">লগইন</Link><Link href="/signup" className="btn">সাইন আপ</Link><Link href="/supervisor/login">Supervisor</Link></div></nav>
    <section className="hero"><p className="muted">আপনার অনলাইন বাজার</p><h1>পছন্দের পণ্য,<br/>এবার ঘরে বসেই।</h1><p>সহজে পণ্য খুঁজুন, কার্টে রাখুন এবং অর্ডার করুন।</p><Link className="btn" href="/signup">কেনাকাটা শুরু করুন</Link></section>
    <div className="row"><h2>জনপ্রিয় পণ্য</h2><span className="muted">কার্টে {count}টি পণ্য</span></div>
    {loading?<p>পণ্য লোড হচ্ছে...</p>:products.length===0?<div className="panel"><h3>দোকান প্রস্তুত হচ্ছে</h3><p className="muted">Admin Panel থেকে প্রথম পণ্য যোগ করলে এখানে দেখা যাবে।</p></div>:<section className="grid">{products.map(p=><article className="card" key={p.id}><div className="product-img">{p.image_url?<img src={p.image_url} alt={p.name} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/>:"🛍️"}</div><p className="muted">{p.category}</p><h3>{p.name}</h3><p className="muted">{p.description}</p><p className="price">₹{Number(p.price).toFixed(2)}</p><button className="btn" disabled={p.stock<1} onClick={()=>setCart(c=>({...c,[p.id]:Math.min(p.stock,(c[p.id]||0)+1)}))}>{p.stock<1?"স্টক নেই":"কার্টে যোগ করুন"}</button></article>)}</section>}
    {count>0&&<section className="panel" style={{marginTop:20}}><h2>আপনার কার্ট</h2>{cartItems.map(p=><div className="row" key={p.id}><span>{p.name} × {p.quantity}</span><span>₹{(Number(p.price)*p.quantity).toFixed(2)}</span><button className="btn alt" onClick={()=>setCart(c=>{const n={...c};delete n[p.id];return n;})}>বাদ দিন</button></div>)}<h3>মোট: ₹{total.toFixed(2)}</h3><button className="btn" onClick={async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user){setMessage("অর্ডার করতে আগে লগইন করুন।");return;}setCheckout(true);}}>Checkout করুন</button></section>}
    {checkout&&<section className="panel" style={{marginTop:20}}><h2>অর্ডার ও UPI পেমেন্ট</h2><p>আপনার UPI অ্যাপ থেকে নিচের UPI ID-তে ₹{total.toFixed(2)} পাঠিয়ে তারপর অর্ডার জমা দিন।</p><p><strong>UPI ID:</strong> {upiId}</p><p className="muted">দ্রষ্টব্য: UPI ID সেট না হওয়া পর্যন্ত টাকা পাঠাবেন না।</p><form className="grid" onSubmit={placeOrder}><label className="field">আপনার নাম<input required value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})}/></label><label className="field">মোবাইল নম্বর<input required type="tel" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})}/></label><label className="field">সম্পূর্ণ ডেলিভারি ঠিকানা<textarea required value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})}/></label><button className="btn" disabled={busy}>{busy?"জমা হচ্ছে...":"অর্ডার জমা দিন"}</button><button type="button" className="btn alt" onClick={()=>setCheckout(false)}>বন্ধ করুন</button></form></section>}
    {message&&<div className="panel" style={{marginTop:16}}><p>{message}</p></div>}
    <p className="muted" style={{textAlign:"center",padding:30}}>© 2026 BigBag Shop</p>
  </main>;
}
