<template>

<Navbar />
<Sidebar />

<div class="page">

<header class="header">

<h2>🍺 Vente Bar</h2>

<div class="summary">

<div class="summary-card">
<span>Aujourd'hui</span>
<strong>{{todayCount}} ventes</strong>
</div>


<div class="summary-card green">
<span>Total</span>
<strong>{{formatMoney(todayTotal)}}</strong>
</div>

</div>

</header>



<!-- CLIENT -->

<div class="card form">

<input
v-model="clientName"
placeholder="Nom client (optionnel)"
/>


<textarea
v-model="remark"
placeholder="Observation"
/>


</div>




<!-- AJOUT PRODUIT -->

<div class="card form">


<select v-model="productId">

<option value="">
-- Boisson --
</option>


<option
v-for="p in products"
:key="p.id"
:value="p.id"
>

{{p.name}}

(
{{p.quantityBottle}}
 bouteilles disponibles
)

</option>


</select>



<select v-model="type">

<option value="bottle">
🍾 Bouteille
</option>


<option value="crate">
📦 Casier
</option>


</select>



<input

type="number"

min="1"

v-model.number="qty"

/>



<button

class="btn primary"

@click="addCart"

>

➕ Ajouter

</button>


</div>




<!-- PANIER -->


<div
v-if="cart.length"
class="card"
>


<h3>
🛒 Panier
</h3>



<div
v-for="i in cart"
:key="i.productId+i.type"
class="item"
>


<div>

<strong>
{{i.name}}
</strong>


<p>
{{i.qty}}
×

{{i.type==="crate"?"Casier":"Bouteille"}}

</p>


</div>


<strong>
{{formatMoney(i.total)}}
</strong>


<button
class="delete"
@click="removeCart(i)"
>
✕
</button>


</div>



<div class="total">

Total :

{{formatMoney(cartTotal)}}

</div>



<button

class="btn primary full"

@click="saveSale"

:disabled="loading"

>

{{loading?"Enregistrement...":"Valider vente"}}


</button>


</div>





<!-- HISTORIQUE -->


<div class="card">


<h3>
📅 Historique des ventes
</h3>



<div
v-for="day in groupedSales"
:key="day.date"
>


<h4>
📅 {{day.date}}
</h4>



<div

v-for="s in day.sales"

:key="s.id"

class="sale"

@click="openModal(s)"

>


<div>

<strong>
{{formatDate(s.date)}}
</strong>


<p>
👤 {{s.clientName}}
</p>

</div>


<span class="badge">

{{formatMoney(s.total)}}

</span>


</div>


</div>





<div class="pagination">


<button
@click="page--"
:disabled="page===1"
>
⬅️
</button>


<span>
Page {{page}}/{{totalPages}}
</span>


<button
@click="page++"
:disabled="page===totalPages"
>
➡️
</button>


</div>


</div>






<!-- MODAL -->


<div
v-if="modalSale"
class="overlay"
@click.self="modalSale=null"
>


<div class="modal">


<h3>
Détails vente
</h3>


<p>
Client :
{{modalSale.clientName}}
</p>


<div
v-for="i in modalSale.items"
:key="i.productId"
>

•
{{i.name}}

-
{{i.qty}}

{{i.type}}

</div>


<hr>


<strong>

Total :

{{formatMoney(modalSale.total)}}

</strong>


<button
class="btn primary"
@click="modalSale=null"
>
Fermer
</button>


</div>

</div>



</div>

</template>





<script>


import Navbar from "../components/NavbarPage.vue"
import Sidebar from "../components/SidebarPage.vue"

import {
collection,
getDocs,
addDoc,
updateDoc,
doc
}

from "firebase/firestore"


import {db} from "../firebase"


import {printInvoiceDirect}
from "../utils/invoice"



export default{


components:{
Navbar,
Sidebar
},



data(){


return{


products:[],

sales:[],

cart:[],

productId:"",

type:"bottle",

qty:1,


clientName:"",

remark:"",

loading:false,


page:1,

pageSize:10,


modalSale:null,


depotId:"bar"



}

},




computed:{


cartTotal(){

return this.cart.reduce(
(a,b)=>a+b.total,
0
)

},



todayCount(){


let d=new Date()
.toDateString()


return this.sales.filter(
s=>new Date(
s.date.seconds*1000
)
.toDateString()===d
).length


},



todayTotal(){


let d=new Date()
.toDateString()


return this.sales
.filter(
s=>new Date(
s.date.seconds*1000
)
.toDateString()===d
)
.reduce(
(a,b)=>a+b.total,
0
)


},



groupedSales(){


let groups={}


this.paginatedSales.forEach(s=>{


let date=
new Date(
s.date.seconds*1000
)
.toLocaleDateString(
"fr-FR"
)



if(!groups[date])
groups[date]=[]


groups[date].push(s)


})



return Object.keys(groups)
.map(x=>({

date:x,

sales:groups[x]

}))


},



paginatedSales(){


let start=
(this.page-1)*this.pageSize


return this.sales.slice(
start,
start+this.pageSize
)

},



totalPages(){

return Math.ceil(
this.sales.length/
this.pageSize
)||1

}



},





methods:{



async load(){


let p=
await getDocs(
collection(
db,
"barProducts"
)
)


this.products=
p.docs.map(
d=>({
id:d.id,
...d.data()
})
)



let s=
await getDocs(
collection(
db,
"barSales"
)
)


this.sales=
s.docs
.map(d=>({
id:d.id,
...d.data()
}))
.sort(
(a,b)=>
b.date.seconds-a.date.seconds
)


},





addCart(){


let p=
this.products.find(
x=>x.id===this.productId
)


if(!p)return



let needed=
this.type==="crate"
?
this.qty*12
:
this.qty



if(needed>p.quantityBottle){

alert(
"Stock insuffisant"
)

return

}



let price=
this.type==="crate"
?
p.priceCrate
:
p.priceBottle



this.cart.push({

productId:p.id,

name:p.name,

qty:this.qty,

type:this.type,

price,

total:
price*this.qty


})


this.productId=""
this.qty=1



},





removeCart(i){

this.cart=
this.cart.filter(
x=>x!==i
)

},




async saveSale(){


if(!this.cart.length)
return



this.loading=true


try{


for(let i of this.cart){


let p=
this.products.find(
x=>x.id===i.productId
)


let remove=
i.type==="crate"
?
i.qty*12
:
i.qty



await updateDoc(

doc(
db,
"barProducts",
p.id
),

{

quantityBottle:
p.quantityBottle-remove,


quantityCrate:
Math.floor(
(p.quantityBottle-remove)/12
)

}

)


}




let sale={


items:this.cart,


clientName:
this.clientName||"Client comptant",


remark:this.remark,


total:this.cartTotal,


date:new Date()


}



let ref=
await addDoc(
collection(db,"barSales"),
sale
)



await printInvoiceDirect(
{
id:ref.id,
total:sale.total
},
sale.items,
sale.clientName,
{
name:"Bar"
}
)



this.cart=[]


await this.load()


alert(
"Vente enregistrée"
)


}

catch(e){

console.error(e)

alert(
e.message
)

}

finally{

this.loading=false

}


},





formatMoney(v){

return new Intl.NumberFormat(
"fr-FR"
)
.format(v)
+" FCFA"

},



formatDate(d){

return new Date(
d.seconds*1000
)
.toLocaleString(
"fr-FR"
)

},



openModal(s){

this.modalSale=s

}



},



mounted(){

this.load()

}



}

</script>





<style scoped>


.page{

max-width:1000px;
margin:auto;
padding:20px;

}


.card{

background:white;
padding:16px;
border-radius:12px;
margin-bottom:15px;

box-shadow:
0 3px 10px #ddd;

}


.form{

display:flex;
flex-direction:column;
gap:10px;

}


input,select,textarea{

padding:10px;
border-radius:8px;
border:1px solid #ccc;

}


.btn{

padding:12px;
border:0;
border-radius:8px;
cursor:pointer;

}


.primary{

background:#16803c;
color:white;

}


.item,.sale{

display:flex;
justify-content:space-between;
align-items:center;
padding:12px 0;
border-bottom:1px solid #eee;

}


.total{

font-size:20px;
font-weight:bold;
margin:15px 0;

}


.badge{

background:#16803c;
color:white;
padding:5px 10px;
border-radius:15px;

}


.delete{

background:#ef4444;
color:white;
border:0;
padding:5px;

}


.overlay{

position:fixed;
inset:0;
background:#0008;
display:flex;
align-items:center;
justify-content:center;

}


.modal{

background:white;
padding:20px;
border-radius:12px;
width:90%;
max-width:400px;

}


.pagination{

display:flex;
justify-content:center;
gap:20px;
margin-top:15px;

}



</style>